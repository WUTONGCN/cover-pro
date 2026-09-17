import { renderCanvas as renderScene } from '../utils/renderCanvas'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { CanvasElement, TextElement, ShapeElement, EmojiElement } from '../types'

type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate' | 'move' | null

export default function AdvancedCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { canvas, elements, updateElement, selectElement, selectedElementIds, removeElement, duplicateElement, clearSelection, undo, redo, beginTransaction, endTransaction } = useEditorStore()
  
  const [dragState, setDragState] = useState<{
    type: HandleType
    elementId: string
    startX: number
    startY: number
    originalElement: CanvasElement
  } | null>(null)
  
  const [editingText, setEditingText] = useState<string | null>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 })
  const [displayScale, setDisplayScale] = useState(1)

  // 计算显示缩放
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.clientWidth - 48 // 减去padding
      const containerHeight = containerRef.current.clientHeight - 48
      const scaleX = containerWidth / canvas.width
      const scaleY = containerHeight / canvas.height
      setDisplayScale(Math.max(0.05, Math.min(scaleX, scaleY, 1)))
    }
    
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [canvas.width, canvas.height])

  // 绘制画布
  const renderCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    renderScene(ctx, canvas, elements.filter(el => el.id !== editingText))

    // 绘制选中框和控制点
    const selected = elements.find(el => selectedElementIds.includes(el.id))
    if (selected && !editingText) {
      drawSelection(ctx, selected)
    }
  }, [canvas, elements, selectedElementIds, editingText])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // 绘制选中框
  const drawSelection = (ctx: CanvasRenderingContext2D, el: CanvasElement) => {
    // 选中边框
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 3
    ctx.setLineDash([8, 4])
    ctx.strokeRect(el.x - 4, el.y - 4, el.width + 8, el.height + 8)
    ctx.setLineDash([])

    // 8个缩放控制点
    const handles = [
      { x: el.x, y: el.y, cursor: 'nw-resize' },
      { x: el.x + el.width / 2, y: el.y, cursor: 'n-resize' },
      { x: el.x + el.width, y: el.y, cursor: 'ne-resize' },
      { x: el.x + el.width, y: el.y + el.height / 2, cursor: 'e-resize' },
      { x: el.x + el.width, y: el.y + el.height, cursor: 'se-resize' },
      { x: el.x + el.width / 2, y: el.y + el.height, cursor: 's-resize' },
      { x: el.x, y: el.y + el.height, cursor: 'sw-resize' },
      { x: el.x, y: el.y + el.height / 2, cursor: 'w-resize' },
    ]

    handles.forEach(h => {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(h.x - 8, h.y - 8, 16, 16)
      ctx.strokeStyle = '#3B82F6'
      ctx.lineWidth = 3
      ctx.strokeRect(h.x - 8, h.y - 8, 16, 16)
    })

    // 旋转控制点
    const ry = el.y - 40
    ctx.beginPath()
    ctx.arc(el.x + el.width / 2, ry, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#10B981'
    ctx.fill()
    ctx.strokeStyle = '#059669'
    ctx.lineWidth = 3
    ctx.stroke()

    // 连接线
    ctx.beginPath()
    ctx.moveTo(el.x + el.width / 2, el.y)
    ctx.lineTo(el.x + el.width / 2, ry + 8)
    ctx.strokeStyle = '#10B981'
    ctx.lineWidth = 3
    ctx.setLineDash([6, 6])
    ctx.stroke()
    ctx.setLineDash([])
  }

  // 获取画布坐标
  const getCanvasCoords = (e: React.MouseEvent): { x: number; y: number } | null => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null
    
    const x = (e.clientX - rect.left) / displayScale
    const y = (e.clientY - rect.top) / displayScale
    
    return { x, y }
  }

  // 检测点击位置
  const detectHandle = (x: number, y: number): { type: HandleType; el: CanvasElement } | null => {
    const sel = elements.find(el => selectedElementIds.includes(el.id))
    
    if (!sel) {
      // 查找点击的元素 (从上到下)
      const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex)
      for (const el of sorted) {
        if (!el.visible) continue
        if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
          return { type: 'move', el }
        }
      }
      return null
    }

    const el = sel
    const threshold = 15

    // 旋转点
    const ry = el.y - 40
    if (Math.hypot(x - (el.x + el.width / 2), y - ry) <= threshold) {
      return { type: 'rotate', el }
    }

    // 8个控制点
    const handles: { x: number; y: number; type: HandleType }[] = [
      { x: el.x, y: el.y, type: 'nw' },
      { x: el.x + el.width / 2, y: el.y, type: 'n' },
      { x: el.x + el.width, y: el.y, type: 'ne' },
      { x: el.x + el.width, y: el.y + el.height / 2, type: 'e' },
      { x: el.x + el.width, y: el.y + el.height, type: 'se' },
      { x: el.x + el.width / 2, y: el.y + el.height, type: 's' },
      { x: el.x, y: el.y + el.height, type: 'sw' },
      { x: el.x, y: el.y + el.height / 2, type: 'w' },
    ]

    for (const h of handles) {
      if (Math.abs(x - h.x) <= threshold && Math.abs(y - h.y) <= threshold) {
        return { type: h.type, el }
      }
    }

    // 元素内部
    if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
      return { type: 'move', el }
    }

    return null
  }

  // 鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const coords = getCanvasCoords(e)
    if (!coords) return

    const detection = detectHandle(coords.x, coords.y)
    if (!detection || detection.el.locked) {
      clearSelection()
      setShowToolbar(false)
      return
    }

    selectElement(detection.el.id)
    beginTransaction()
    setDragState({
      type: detection.type,
      elementId: detection.el.id,
      startX: coords.x,
      startY: coords.y,
      originalElement: { ...detection.el }
    })
    setShowToolbar(false)
    e.stopPropagation()
  }

  // 鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e)
    if (!coords) return

    if (!dragState) {
      // 更新光标样式
      const detection = detectHandle(coords.x, coords.y)
      if (detection && canvasRef.current) {
        const cursorMap: Record<string, string> = {
          'move': 'move',
          'nw': 'nw-resize',
          'n': 'n-resize',
          'ne': 'ne-resize',
          'e': 'e-resize',
          'se': 'se-resize',
          's': 's-resize',
          'sw': 'sw-resize',
          'w': 'w-resize',
          'rotate': 'grab'
        }
        canvasRef.current.style.cursor = cursorMap[detection.type || ''] || 'default'
      } else if (canvasRef.current) {
        canvasRef.current.style.cursor = 'default'
      }
      return
    }

    const dx = coords.x - dragState.startX
    const dy = coords.y - dragState.startY
    const orig = dragState.originalElement

    if (dragState.type === 'move') {
      updateElement(dragState.elementId, {
        x: Math.round(orig.x + dx),
        y: Math.round(orig.y + dy)
      })
    } else if (dragState.type === 'rotate') {
      const cx = orig.x + orig.width / 2
      const cy = orig.y + orig.height / 2
      const angle = Math.atan2(coords.y - cy, coords.x - cx) * 180 / Math.PI + 90
      updateElement(dragState.elementId, {
        rotation: Math.round(angle) % 360
      })
    } else if (dragState.type) {
      // 调整大小
      let newX = orig.x, newY = orig.y, newW = orig.width, newH = orig.height

      if (dragState.type.includes('w')) {
        const maxDx = orig.width - 20
        const actualDx = Math.min(dx, maxDx)
        newX = orig.x + actualDx
        newW = orig.width - actualDx
      } else if (dragState.type.includes('e')) {
        newW = Math.max(20, orig.width + dx)
      }

      if (dragState.type.includes('n')) {
        const maxDy = orig.height - 20
        const actualDy = Math.min(dy, maxDy)
        newY = orig.y + actualDy
        newH = orig.height - actualDy
      } else if (dragState.type.includes('s')) {
        newH = Math.max(20, orig.height + dy)
      }

      updateElement(dragState.elementId, {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH)
      })
    }
  }

  // 鼠标松开
  const handleMouseUp = () => {
    if (dragState) {
      const el = elements.find(e => e.id === dragState.elementId)
      if (el) {
        setToolbarPos({
          x: (el.x + el.width / 2) * displayScale,
          y: Math.max(0, (el.y - 70) * displayScale)
        })
        setTimeout(() => setShowToolbar(true), 50)
      }
    }
    endTransaction()
    setDragState(null)
  }

  // 双击编辑文本
  const handleDoubleClick = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e)
    if (!coords) return

    const detection = detectHandle(coords.x, coords.y)
    if (detection && !detection.el.locked && detection.el.type === 'text') {
      beginTransaction()
      setEditingText(detection.el.id)
      setShowToolbar(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  // 键盘快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (editingText || target.closest('input, textarea, select, [contenteditable="true"]')) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo(); else undo()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault(); redo(); return
      }
      if (selectedElementIds.length === 0) return

      const id = selectedElementIds[0]
      const el = elements.find(e => e.id === id)
      if (!el || el.locked) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        removeElement(id)
        setShowToolbar(false)
        e.preventDefault()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        duplicateElement(id)
        e.preventDefault()
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const step = e.shiftKey ? 10 : 1
        const updates: Partial<CanvasElement> = {}
        if (e.key === 'ArrowLeft') updates.x = el.x - step
        if (e.key === 'ArrowRight') updates.x = el.x + step
        if (e.key === 'ArrowUp') updates.y = el.y - step
        if (e.key === 'ArrowDown') updates.y = el.y + step
        updateElement(id, updates)
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedElementIds, elements, editingText, removeElement, duplicateElement, updateElement, undo, redo])

  const selectedEl = elements.find(el => selectedElementIds.includes(el.id))

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800">🎨 画布编辑器</h2>
          <span className="text-xs text-gray-400">{canvas.width}×{canvas.height}</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedEl && (
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-medium border border-blue-200">
              {selectedEl.type === 'text' ? '📝 文本' : selectedEl.type === 'emoji' ? '😀 表情' : '🔷 形状'}
            </span>
          )}
          <span className="text-xs text-gray-500">拖动 • 缩放 • 旋转</span>
        </div>
      </div>

      <div ref={containerRef} className="relative flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 shadow-inner flex-1 overflow-auto">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={canvas.width}
            height={canvas.height}
            className="shadow-2xl cursor-crosshair"
            style={{ 
              width: canvas.width * displayScale,
              height: canvas.height * displayScale,
              border: '2px solid #3B82F6',
              borderRadius: '8px',
              imageRendering: 'crisp-edges'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          />

          {/* 文本编辑输入框 */}
          {editingText && selectedEl && selectedEl.type === 'text' && (
            <textarea
              ref={inputRef}
              value={(selectedEl as TextElement).content}
              onChange={e => updateElement(editingText, { content: e.target.value })}
              onBlur={() => { endTransaction(); setEditingText(null) }}
              className="absolute border-2 border-blue-500 rounded-lg p-2 bg-white shadow-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{
                left: selectedEl.x * displayScale,
                top: selectedEl.y * displayScale,
                width: selectedEl.width * displayScale,
                height: selectedEl.height * displayScale,
                fontSize: (selectedEl as TextElement).fontSize * displayScale,
                fontWeight: (selectedEl as TextElement).fontWeight,
                fontFamily: (selectedEl as TextElement).fontFamily,
                color: (selectedEl as TextElement).color,
                textAlign: (selectedEl as TextElement).textAlign,
                lineHeight: (selectedEl as TextElement).lineHeight,
                zIndex: 1000
              }}
            />
          )}

          {/* 快捷工具栏 */}
          {showToolbar && selectedEl && !editingText && (
            <div
              className="absolute bg-white shadow-2xl rounded-xl p-2 border-2 border-blue-400 flex items-center gap-2"
              style={{
                left: toolbarPos.x,
                top: toolbarPos.y,
                transform: 'translateX(-50%)',
                zIndex: 1000
              }}
            >
              {selectedEl.type === 'text' && (
                <>
                  <input
                    type="color"
                    value={(selectedEl as TextElement).color}
                    onChange={e => updateElement(selectedEl.id, { color: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer"
                    title="颜色"
                  />
                  <input
                    type="range"
                    min="16"
                    max="120"
                    value={(selectedEl as TextElement).fontSize}
                    onChange={e => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                    className="w-20"
                    title={`字号: ${(selectedEl as TextElement).fontSize}px`}
                  />
                </>
              )}
              {selectedEl.type === 'shape' && (
                <input
                  type="color"
                  value={(selectedEl as ShapeElement).fillColor}
                  onChange={e => updateElement(selectedEl.id, { fillColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="填充色"
                />
              )}
              {selectedEl.type === 'emoji' && (
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={(selectedEl as EmojiElement).fontSize}
                  onChange={e => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                  className="w-20"
                  title={`大小: ${(selectedEl as EmojiElement).fontSize}px`}
                />
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={selectedEl.opacity * 100}
                onChange={e => updateElement(selectedEl.id, { opacity: Number(e.target.value) / 100 })}
                className="w-20"
                title={`透明度: ${Math.round(selectedEl.opacity * 100)}%`}
              />
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={() => duplicateElement(selectedEl.id)}
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                title="复制 (Ctrl+D)"
              >
                📋
              </button>
              <button
                onClick={() => { removeElement(selectedEl.id); setShowToolbar(false); }}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                title="删除 (Del)"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
