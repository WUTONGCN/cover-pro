import { Palette } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { colorThemes } from '../../data/colorThemes'

export default function ColorEditor() {
  const { colorTheme, setColorTheme, canvas, setBackgroundColor } = useEditorStore()

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5" />
        配色主题
      </h2>
      <p className="text-sm text-gray-600 mb-4">选择配色方案或自定义颜色</p>

      <div className="space-y-4">
        {/* Theme Selector */}
        <div className="grid grid-cols-1 gap-3">
          {colorThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setColorTheme(theme)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                colorTheme?.id === theme.id
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0"
                  style={{
                    background: theme.gradient
                      ? `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.start}, ${theme.gradient.end})`
                      : theme.colors.background,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{theme.name}</h3>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                  <div className="flex gap-1 mt-2">
                    {Object.values(theme.colors).slice(0, 5).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                {colorTheme?.id === theme.id && (
                  <span className="text-orange-500 font-medium">✓ 已应用</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Background Color */}
        <div className="pt-4 border-t">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            自定义背景色
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={canvas.backgroundColor.startsWith('#') ? canvas.backgroundColor : '#FFFFFF'}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={canvas.backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="#FFFFFF"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 支持十六进制颜色值（如 #FFFFFF）和CSS渐变
          </p>
        </div>
      </div>
    </div>
  )
}

