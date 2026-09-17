import { useState } from 'react'
import Header from './components/Header'
import TemplateSelector from './components/TemplateSelector'
import EditorPanel from './components/EditorPanel'
import AdvancedCanvas from './components/AdvancedCanvas'
import PropertyPanel from './components/PropertyPanel'
import LayerPanel from './components/LayerPanel'
import ExportPanel from './components/ExportPanel'

function App() {
  const [activeLeftTab, setActiveLeftTab] = useState<'template' | 'text' | 'color' | 'element'>('template')
  const [activeRightTab, setActiveRightTab] = useState<'property' | 'layer'>('property')

  return (
    <div className="min-h-screen xl:h-screen flex flex-col xl:overflow-hidden">
      <Header />
      
      <main className="flex-1 xl:overflow-hidden">
        <div className="container mx-auto px-3 py-3 h-full max-w-[1920px]">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full">
          {/* Left Panel - Content Controls */}
          <div className="xl:col-span-2 flex flex-col gap-3 overflow-hidden">
            {/* Tab Selector */}
            <div className="card p-2">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveLeftTab('template')}
                  className={`px-2 py-2 rounded-lg transition-all text-xs font-medium ${
                    activeLeftTab === 'template'
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ✨ 模板
                </button>
                <button
                  onClick={() => setActiveLeftTab('text')}
                  className={`px-2 py-2 rounded-lg transition-all text-xs font-medium ${
                    activeLeftTab === 'text'
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🖋️ 文字
                </button>
                <button
                  onClick={() => setActiveLeftTab('color')}
                  className={`px-2 py-2 rounded-lg transition-all text-xs font-medium ${
                    activeLeftTab === 'color'
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🎨 配色
                </button>
                <button
                  onClick={() => setActiveLeftTab('element')}
                  className={`px-2 py-2 rounded-lg transition-all text-xs font-medium ${
                    activeLeftTab === 'element'
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🎪 元素
                </button>
              </div>
            </div>

            {/* Tab Content - 可滚动区域 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="space-y-3">
                {activeLeftTab === 'template' && <TemplateSelector />}
                {activeLeftTab === 'text' && <EditorPanel type="text" />}
                {activeLeftTab === 'color' && <EditorPanel type="color" />}
                {activeLeftTab === 'element' && <EditorPanel type="element" />}

                {/* Export Panel */}
                <ExportPanel />
              </div>
            </div>
          </div>

          {/* Center Panel - Advanced Canvas */}
          <div className="xl:col-span-7 min-h-[520px] xl:min-h-0 flex flex-col overflow-hidden">
            <div className="card p-4 flex-1 flex flex-col overflow-hidden">
              <AdvancedCanvas />
            </div>
          </div>

          {/* Right Panel - Properties & Layers */}
          <div className="xl:col-span-3 flex flex-col gap-3 overflow-hidden">
            {/* Tab Selector */}
            <div className="card p-2">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setActiveRightTab('property')}
                  className={`px-2 py-2 rounded-lg transition-all text-xs font-medium ${
                    activeRightTab === 'property'
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🎛️ 属性
                </button>
                <button
                  onClick={() => setActiveRightTab('layer')}
                  className={`px-2 py-2 rounded-lg transition-all text-xs font-medium ${
                    activeRightTab === 'layer'
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📐 图层
                </button>
              </div>
            </div>

            {/* Tab Content - 可滚动区域 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {activeRightTab === 'property' && <PropertyPanel />}
              {activeRightTab === 'layer' && <LayerPanel />}
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

