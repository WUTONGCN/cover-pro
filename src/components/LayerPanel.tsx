import { Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'

export default function LayerPanel() {
  const {
    elements,
    selectedElementIds,
    selectElement,
    updateElement,
    removeElement,
    duplicateElement,
    moveElement,
  } = useEditorStore()

  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex)

  const getElementLabel = (element: any) => {
    if (element.type === 'text') {
      return element.content.split('\n')[0].substring(0, 20) || '文本'
    }
    if (element.type === 'emoji') {
      return element.emoji
    }
    if (element.type === 'shape') {
      return `形状 (${element.shapeType})`
    }
    if (element.type === 'image') {
      return '图片'
    }
    return '元素'
  }

  const getElementIcon = (element: any) => {
    if (element.type === 'text') return '📝'
    if (element.type === 'emoji') return element.emoji
    if (element.type === 'shape') return '⬛'
    if (element.type === 'image') return '🖼️'
    return '📦'
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">📐</span>
        图层管理
      </h2>

      {elements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>暂无图层</p>
          <p className="text-sm mt-1">添加文字或元素后将在此显示</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedElements.map((element) => {
            const isSelected = selectedElementIds.includes(element.id)
            
            return (
              <div
                key={element.id}
                className={`group p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Icon */}
                  <button
                    onClick={() => selectElement(element.id)}
                    className="text-xl flex-shrink-0"
                  >
                    {getElementIcon(element)}
                  </button>

                  {/* Label */}
                  <button
                    onClick={() => selectElement(element.id)}
                    className="flex-1 text-left truncate text-sm font-medium"
                  >
                    {getElementLabel(element)}
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Visibility */}
                    <button
                      onClick={() => updateElement(element.id, { visible: !element.visible })}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title={element.visible ? '隐藏' : '显示'}
                    >
                      {element.visible ? (
                        <Eye className="w-4 h-4 text-gray-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Lock */}
                    <button
                      onClick={() => updateElement(element.id, { locked: !element.locked })}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title={element.locked ? '解锁' : '锁定'}
                    >
                      {element.locked ? (
                        <Lock className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Unlock className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Move Up */}
                    <button
                      onClick={() => moveElement(element.id, 'up')}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="上移一层"
                    >
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => moveElement(element.id, 'down')}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="下移一层"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => duplicateElement(element.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="复制"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => removeElement(element.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Element Info */}
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-orange-200 text-xs text-gray-600 space-y-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">位置:</span> {Math.round(element.x)}, {Math.round(element.y)}
                      </div>
                      <div>
                        <span className="font-medium">大小:</span> {Math.round(element.width)} × {Math.round(element.height)}
                      </div>
                      <div>
                        <span className="font-medium">旋转:</span> {element.rotation}°
                      </div>
                      <div>
                        <span className="font-medium">透明度:</span> {Math.round(element.opacity * 100)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

