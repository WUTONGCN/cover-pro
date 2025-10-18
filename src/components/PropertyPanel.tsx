import { 
  AlignLeft, AlignCenter, AlignRight, 
  AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter,
  AlignVerticalJustifyStart, AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyEnd,
  Trash2, Copy, Lock, Unlock, Eye, EyeOff
} from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import type { TextElement, ShapeElement, EmojiElement } from '../types'

export default function PropertyPanel() {
  const { 
    elements, 
    selectedElementIds, 
    updateElement, 
    removeElement, 
    duplicateElement,
    alignElements 
  } = useEditorStore()

  const selectedElement = elements.find(el => el.id === selectedElementIds[0])

  if (!selectedElement) {
    return (
      <div className="card">
        <h2 className="text-lg font-bold mb-4">属性面板</h2>
        <div className="text-center py-12 text-gray-500">
          <p className="text-3xl mb-2">🎨</p>
          <p>请选择一个元素</p>
          <p className="text-sm mt-1">点击画布中的元素开始编辑</p>
        </div>
      </div>
    )
  }

  const handleUpdate = (updates: any) => {
    updateElement(selectedElement.id, updates)
  }

  return (
    <div className="card space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">属性面板</h2>
        <div className="flex gap-1">
          <button
            onClick={() => handleUpdate({ visible: !selectedElement.visible })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={selectedElement.visible ? '隐藏' : '显示'}
          >
            {selectedElement.visible ? 
              <Eye className="w-4 h-4" /> : 
              <EyeOff className="w-4 h-4 text-gray-400" />
            }
          </button>
          <button
            onClick={() => handleUpdate({ locked: !selectedElement.locked })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={selectedElement.locked ? '解锁' : '锁定'}
          >
            {selectedElement.locked ? 
              <Lock className="w-4 h-4" /> : 
              <Unlock className="w-4 h-4 text-gray-400" />
            }
          </button>
          <button
            onClick={() => duplicateElement(selectedElement.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="复制"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeElement(selectedElement.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* 对齐工具 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          对齐
        </label>
        <div className="grid grid-cols-6 gap-1">
          <button
            onClick={() => alignElements('left')}
            className="p-2 border border-gray-200 hover:bg-orange-50 hover:border-orange-300 rounded transition-colors"
            title="左对齐"
          >
            <AlignHorizontalJustifyStart className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignElements('center-horizontal')}
            className="p-2 border border-gray-200 hover:bg-orange-50 hover:border-orange-300 rounded transition-colors"
            title="水平居中"
          >
            <AlignHorizontalJustifyCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignElements('right')}
            className="p-2 border border-gray-200 hover:bg-orange-50 hover:border-orange-300 rounded transition-colors"
            title="右对齐"
          >
            <AlignHorizontalJustifyEnd className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignElements('top')}
            className="p-2 border border-gray-200 hover:bg-orange-50 hover:border-orange-300 rounded transition-colors"
            title="顶部对齐"
          >
            <AlignVerticalJustifyStart className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignElements('center-vertical')}
            className="p-2 border border-gray-200 hover:bg-orange-50 hover:border-orange-300 rounded transition-colors"
            title="垂直居中"
          >
            <AlignVerticalJustifyCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => alignElements('bottom')}
            className="p-2 border border-gray-200 hover:bg-orange-50 hover:border-orange-300 rounded transition-colors"
            title="底部对齐"
          >
            <AlignVerticalJustifyEnd className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 位置和大小 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">X 位置</label>
          <input
            type="number"
            value={Math.round(selectedElement.x)}
            onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Y 位置</label>
          <input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">宽度</label>
          <input
            type="number"
            value={Math.round(selectedElement.width)}
            onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">高度</label>
          <input
            type="number"
            value={Math.round(selectedElement.height)}
            onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 旋转和透明度 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          旋转: {selectedElement.rotation}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={selectedElement.rotation}
          onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          透明度: {Math.round(selectedElement.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={selectedElement.opacity * 100}
          onChange={(e) => handleUpdate({ opacity: Number(e.target.value) / 100 })}
          className="w-full"
        />
      </div>

      {/* 文本特定属性 */}
      {selectedElement.type === 'text' && (
        <TextProperties element={selectedElement as TextElement} onUpdate={handleUpdate} />
      )}

      {/* 形状特定属性 */}
      {selectedElement.type === 'shape' && (
        <ShapeProperties element={selectedElement as ShapeElement} onUpdate={handleUpdate} />
      )}

      {/* Emoji特定属性 */}
      {selectedElement.type === 'emoji' && (
        <EmojiProperties element={selectedElement as EmojiElement} onUpdate={handleUpdate} />
      )}
    </div>
  )
}

// 文本属性编辑器
function TextProperties({ element, onUpdate }: { element: TextElement; onUpdate: (u: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">文本内容</label>
        <textarea
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">文字颜色</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-12 h-10 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={element.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">字号</label>
          <input
            type="number"
            value={element.fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">字重</label>
          <select
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
            <option value="800">Extra Bold</option>
            <option value="900">Black</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">对齐方式</label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ textAlign: 'left' })}
            className={`flex-1 p-2 border rounded-lg transition-colors ${
              element.textAlign === 'left' 
                ? 'bg-orange-500 text-white border-orange-500' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <AlignLeft className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onUpdate({ textAlign: 'center' })}
            className={`flex-1 p-2 border rounded-lg transition-colors ${
              element.textAlign === 'center' 
                ? 'bg-orange-500 text-white border-orange-500' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <AlignCenter className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onUpdate({ textAlign: 'right' })}
            className={`flex-1 p-2 border rounded-lg transition-colors ${
              element.textAlign === 'right' 
                ? 'bg-orange-500 text-white border-orange-500' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <AlignRight className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          行高: {element.lineHeight.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.8"
          max="2.5"
          step="0.1"
          value={element.lineHeight}
          onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          字间距: {element.letterSpacing}
        </label>
        <input
          type="range"
          min="-5"
          max="20"
          value={element.letterSpacing}
          onChange={(e) => onUpdate({ letterSpacing: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </>
  )
}

// 形状属性编辑器
function ShapeProperties({ element, onUpdate }: { element: ShapeElement; onUpdate: (u: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">填充颜色</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={element.fillColor}
            onChange={(e) => onUpdate({ fillColor: e.target.value })}
            className="w-12 h-10 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={element.fillColor}
            onChange={(e) => onUpdate({ fillColor: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
          />
        </div>
      </div>

      {element.shapeType === 'rect' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            圆角: {element.borderRadius || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={element.borderRadius || 0}
            onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">边框颜色</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={element.strokeColor || '#000000'}
            onChange={(e) => onUpdate({ strokeColor: e.target.value })}
            className="w-12 h-10 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={element.strokeColor || '#000000'}
            onChange={(e) => onUpdate({ strokeColor: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          边框宽度: {element.strokeWidth || 0}px
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={element.strokeWidth || 0}
          onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </>
  )
}

// Emoji属性编辑器
function EmojiProperties({ element, onUpdate }: { element: EmojiElement; onUpdate: (u: any) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
        <input
          type="text"
          value={element.emoji}
          onChange={(e) => onUpdate({ emoji: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-4xl text-center"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          大小: {element.fontSize}px
        </label>
        <input
          type="range"
          min="20"
          max="200"
          value={element.fontSize}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </>
  )
}

