import { useState } from 'react'
import { Plus, Type } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { fonts } from '../../data/fonts'
import type { TextElement } from '../../types'

export default function TextEditor() {
  const { elements, selectedElementIds, addElement, updateElement } = useEditorStore()
  const [activeTextId, setActiveTextId] = useState<string | null>(null)

  const selectedElement = elements.find(
    (el) => el.id === selectedElementIds[0] && el.type === 'text'
  ) as TextElement | undefined

  const activeElement = activeTextId
    ? (elements.find((el) => el.id === activeTextId) as TextElement)
    : selectedElement

  const handleAddText = () => {
    addElement({
      type: 'text' as const,
      x: 100,
      y: 100,
      width: 800,
      height: 200,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: '点击编辑文字',
      fontFamily: 'PingFang SC',
      fontSize: 64,
      fontWeight: 600,
      color: '#2D3748',
      textAlign: 'left' as const,
      lineHeight: 1.3,
      letterSpacing: 0,
    } as any)
  }

  const textElements = elements.filter((el) => el.type === 'text') as TextElement[]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Type className="w-5 h-5" />
          文字编辑
        </h2>
        <button onClick={handleAddText} className="btn-secondary text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" />
          添加文字
        </button>
      </div>

      {textElements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Type className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>暂无文字图层</p>
          <p className="text-sm mt-1">点击上方按钮添加文字</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Text List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">文字图层</p>
            {textElements.map((el) => (
              <button
                key={el.id}
                onClick={() => setActiveTextId(el.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  activeElement?.id === el.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <p className="font-medium text-sm truncate">{el.content.split('\n')[0]}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {el.fontFamily} · {el.fontSize}px
                </p>
              </button>
            ))}
          </div>

          {/* Edit Active Text */}
          {activeElement && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">文字内容</label>
                <textarea
                  value={activeElement.content}
                  onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="输入文字内容"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">字体</label>
                <select
                  value={activeElement.fontFamily}
                  onChange={(e) => updateElement(activeElement.id, { fontFamily: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {fonts.map((font) => (
                    <option key={font.id} value={font.family}>
                      {font.name} - {font.preview}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    大小: {activeElement.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="200"
                    value={activeElement.fontSize}
                    onChange={(e) =>
                      updateElement(activeElement.id, { fontSize: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">粗细</label>
                  <select
                    value={activeElement.fontWeight}
                    onChange={(e) =>
                      updateElement(activeElement.id, { fontWeight: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="300">细</option>
                    <option value="400">正常</option>
                    <option value="500">中等</option>
                    <option value="600">半粗</option>
                    <option value="700">粗</option>
                    <option value="900">特粗</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">颜色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={activeElement.color}
                    onChange={(e) => updateElement(activeElement.id, { color: e.target.value })}
                    className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={activeElement.color}
                    onChange={(e) => updateElement(activeElement.id, { color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">对齐方式</label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updateElement(activeElement.id, { textAlign: align })}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                        activeElement.textAlign === align
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-300 hover:border-orange-300'
                      }`}
                    >
                      {align === 'left' && '左对齐'}
                      {align === 'center' && '居中'}
                      {align === 'right' && '右对齐'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    行高: {activeElement.lineHeight.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="3"
                    step="0.1"
                    value={activeElement.lineHeight}
                    onChange={(e) =>
                      updateElement(activeElement.id, { lineHeight: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    字间距: {activeElement.letterSpacing}px
                  </label>
                  <input
                    type="range"
                    min="-5"
                    max="20"
                    value={activeElement.letterSpacing}
                    onChange={(e) =>
                      updateElement(activeElement.id, { letterSpacing: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

