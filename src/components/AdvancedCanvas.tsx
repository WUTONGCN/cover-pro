import { useRef, useState, useEffect, useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { CanvasElement, TextElement, EmojiElement, ShapeElement } from '../types'

type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate' | 'move' | null

export default function AdvancedCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { canvas, elements, updateElement, selectElement, selectedElementIds, removeElement, duplicateElement, clearSelection } = useEditorStore()
  
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
      setDisplayScale(Math.min(scaleX, scaleY, 1))
    }
    
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [canvas.width, canvas.height])

  // 绘制画布
  const renderCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    // 清空
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 背景
    ctx.fillStyle = canvas.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制所有元素（按z-index排序）
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex)
    sorted.forEach(el => {
      if (!el.visible || (editingText === el.id && el.type === 'text')) return
      
      ctx.save()
      ctx.globalAlpha = el.opacity

      // 应用旋转
      if (el.rotation) {
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        ctx.translate(cx, cy)
        ctx.rotate((el.rotation * Math.PI) / 180)
        ctx.translate(-cx, -cy)
      }

      // 绘制元素
      if (el.type === 'text') drawText(ctx, el as TextElement)
      else if (el.type === 'emoji') drawEmoji(ctx, el as EmojiElement)
      else if (el.type === 'shape') drawShape(ctx, el as ShapeElement)

      ctx.restore()
    })

    // 绘制选中框和控制点
    const selected = elements.find(el => selectedElementIds.includes(el.id))
    if (selected && !editingText) {
      drawSelection(ctx, selected)
    }
  }, [canvas, elements, selectedElementIds, editingText])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // 绘制文本
  const drawText = (ctx: CanvasRenderingContext2D, el: TextElement) => {
    ctx.font = `${el.fontWeight} ${el.fontSize}px ${el.fontFamily}`
    ctx.fillStyle = el.color
    ctx.textAlign = el.textAlign
    ctx.textBaseline = 'top'

    const lines = el.content.split('\n')
    const lineHeight = el.fontSize * el.lineHeight
    let x = el.x
    if (el.textAlign === 'center') x = el.x + el.width / 2
    else if (el.textAlign === 'right') x = el.x + el.width

    lines.forEach((line, i) => {
      if (el.letterSpacing) {
        let curX = x
        const chars = line.split('')
        if (el.textAlign === 'center') {
          const totalW = ctx.measureText(line).width + (chars.length - 1) * el.letterSpacing
          curX = x - totalW / 2
        } else if (el.textAlign === 'right') {
          const totalW = ctx.measureText(line).width + (chars.length - 1) * el.letterSpacing
          curX = x - totalW
        }
        chars.forEach(char => {
          ctx.fillText(char, curX, el.y + i * lineHeight)
          curX += ctx.measureText(char).width + el.letterSpacing
        })
      } else {
        ctx.fillText(line, x, el.y + i * lineHeight)
      }
    })
  }

  // 绘制Emoji
  const drawEmoji = (ctx: CanvasRenderingContext2D, el: EmojiElement) => {
    ctx.font = `${el.fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(el.emoji, el.x + el.width / 2, el.y + el.height / 2)
  }

  // 绘制形状
  const drawShape = (ctx: CanvasRenderingContext2D, el: ShapeElement) => {
    ctx.fillStyle = el.fillColor
    if (el.strokeColor && el.strokeWidth) {
      ctx.strokeStyle = el.strokeColor
      ctx.lineWidth = el.strokeWidth
    }

    if (el.shapeType === 'rect') {
      if (el.borderRadius) {
        const r = Math.min(el.borderRadius, el.width / 2, el.height / 2)
        ctx.beginPath()
        ctx.moveTo(el.x + r, el.y)
        ctx.arcTo(el.x + el.width, el.y, el.x + el.width, el.y + el.height, r)
        ctx.arcTo(el.x + el.width, el.y + el.height, el.x, el.y + el.height, r)
        ctx.arcTo(el.x, el.y + el.height, el.x, el.y, r)
        ctx.arcTo(el.x, el.y, el.x + el.width, el.y, r)
        ctx.closePath()
        ctx.fill()
        if (el.strokeColor) ctx.stroke()
      } else {
        ctx.fillRect(el.x, el.y, el.width, el.height)
        if (el.strokeColor) ctx.strokeRect(el.x, el.y, el.width, el.height)
      }
    } else if (el.shapeType === 'circle') {
      ctx.beginPath()
      ctx.arc(el.x + el.width / 2, el.y + el.height / 2, Math.min(el.width, el.height) / 2, 0, Math.PI * 2)
      ctx.fill()
      if (el.strokeColor) ctx.stroke()
    } else if (el.shapeType === 'star') {
      const cx = el.x + el.width / 2
      const cy = el.y + el.height / 2
      const or = Math.min(el.width, el.height) / 2
      const ir = or * 0.4
      let angle = -Math.PI / 2
      const step = Math.PI / 5
      
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? or : ir
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
        angle += step
      }
      ctx.closePath()
      ctx.fill()
      if (el.strokeColor) ctx.stroke()
    }
  }

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
    if (!detection) {
      clearSelection()
      setShowToolbar(false)
      return
    }

    selectElement(detection.el.id)
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
        canvasRef.current.style.cursor = cursorMap[detection.type] || 'default'
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
    setDragState(null)
  }

  // 双击编辑文本
  const handleDoubleClick = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e)
    if (!coords) return

    const detection = detectHandle(coords.x, coords.y)
    if (detection && detection.el.type === 'text') {
      setEditingText(detection.el.id)
      setShowToolbar(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  // 键盘快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingText) return
      if (selectedElementIds.length === 0) return

      const id = selectedElementIds[0]
      const el = elements.find(e => e.id === id)
      if (!el) return

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
  }, [selectedElementIds, elements, editingText, removeElement, duplicateElement, updateElement])

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
              onBlur={() => setEditingText(null)}
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
