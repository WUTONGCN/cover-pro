import { useState } from 'react'
import { Smile, Square, Circle, Star, Image } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { emojiCategories } from '../../data/emojis'

export default function ElementEditor() {
  const { addElement } = useEditorStore()
  const [activeTab, setActiveTab] = useState<'emoji' | 'shape' | 'image'>('emoji')
  const [activeCategory, setActiveCategory] = useState<string>('common')

  const handleAddEmoji = (emoji: string) => {
    addElement({
      type: 'emoji' as const,
      x: 100,
      y: 100,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      emoji,
      fontSize: 100,
    } as any)
  }

  const handleAddShape = (shapeType: 'rect' | 'circle' | 'star') => {
    addElement({
      type: 'shape' as const,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      shapeType,
      fillColor: '#FF6B6B',
      borderRadius: shapeType === 'rect' ? 20 : 0,
    } as any)
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Smile className="w-5 h-5" />
        装饰元素
      </h2>

      {/* Tab Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('emoji')}
          className={`flex-1 px-3 py-2 rounded-lg transition-all ${
            activeTab === 'emoji'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          😀 表情
        </button>
        <button
          onClick={() => setActiveTab('shape')}
          className={`flex-1 px-3 py-2 rounded-lg transition-all ${
            activeTab === 'shape'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ⬛ 形状
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 px-3 py-2 rounded-lg transition-all ${
            activeTab === 'image'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🖼️ 图片
        </button>
      </div>

      {/* Content */}
      {activeTab === 'emoji' && (
        <div className="space-y-4">
          {/* Category Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(emojiCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === key
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-6 gap-2">
            {emojiCategories[activeCategory as keyof typeof emojiCategories].emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddEmoji(emoji)}
                className="aspect-square flex items-center justify-center text-3xl hover:bg-gray-100 rounded-lg transition-colors"
                title={`添加 ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            💡 点击表情添加到画布，可在画布中拖拽调整位置
          </p>
        </div>
      )}

      {activeTab === 'shape' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleAddShape('rect')}
              className="aspect-square flex flex-col items-center justify-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <Square className="w-8 h-8 text-gray-600" />
              <span className="text-sm font-medium">矩形</span>
            </button>
            <button
              onClick={() => handleAddShape('circle')}
              className="aspect-square flex flex-col items-center justify-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <Circle className="w-8 h-8 text-gray-600" />
              <span className="text-sm font-medium">圆形</span>
            </button>
            <button
              onClick={() => handleAddShape('star')}
              className="aspect-square flex flex-col items-center justify-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <Star className="w-8 h-8 text-gray-600" />
              <span className="text-sm font-medium">星形</span>
            </button>
          </div>

          <p className="text-xs text-gray-500">
            💡 添加形状后可在图层面板中调整颜色和大小
          </p>
        </div>
      )}

      {activeTab === 'image' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
            <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">点击上传图片</p>
            <p className="text-xs text-gray-500 mt-1">支持 PNG、JPG、GIF 格式</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">贴纸库</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-2xl cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  🎨
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

