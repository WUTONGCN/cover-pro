import { Sparkles, Download, Undo, Redo, Save, RotateCcw } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'

export default function Header() {
  const { undo, redo, reset, generateRandomContent } = useEditorStore()

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-3 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                封面生成器 Pro
              </h1>
              <p className="text-[10px] text-gray-500">3分钟搞定专业封面</p>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-700">WUTONG开源</div>
              <div className="text-xs text-gray-500">
                <span>WX：tkzypt</span>
                <span className="mx-2">|</span>
                <span>QQ：1622068165</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="撤销"
              >
                <Undo className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={redo}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="重做"
              >
                <Redo className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={generateRandomContent}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="一键生成"
              >
                <Sparkles className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={reset}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="重置"
              >
                <RotateCcw className="w-4 h-4 text-gray-600" />
              </button>
              <div className="h-5 w-px bg-gray-300 mx-1" />
              <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="保存模板">
                <Save className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

