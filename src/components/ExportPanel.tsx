import { renderCanvas } from '../utils/renderCanvas'
import { useState } from 'react'
import { Download, Smartphone, Monitor } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { platformSizes } from '../data/platformSizes'

export default function ExportPanel() {
  const { canvas, elements, setPlatformSize } = useEditorStore()
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [quality, setQuality] = useState(100)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  const currentPlatform = platformSizes.find(
    (p) => p.width === canvas.width && p.height === canvas.height
  )

  const handleExport = async () => {
    setExporting(true)
    setError('')
    try {
    await document.fonts.ready
    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height
    const ctx = exportCanvas.getContext('2d')

    if (!ctx) throw new Error('浏览器不支持画布导出')

    renderCanvas(ctx, canvas, elements)

    // Export
    const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp'
    const qualityValue = format === 'png' ? 1 : quality / 100

    const blob = await new Promise<Blob>((resolve, reject) => {
      exportCanvas.toBlob(value => value ? resolve(value) : reject(new Error('图片生成失败，请重试')), mimeType, qualityValue)
    })
    {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `cover-${Date.now()}.${format}`
          link.click()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '导出失败，请重试')
    } finally { setExporting(false) }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" />
        导出设置
      </h2>

      <div className="space-y-4">
        {/* Platform Size */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            平台尺寸
          </label>
          <div className="grid grid-cols-2 gap-2">
            {platformSizes.slice(0, 6).map((size) => (
              <button
                key={size.id}
                onClick={() => setPlatformSize(size)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  currentPlatform?.id === size.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {size.platform.includes('小红书') || size.platform.includes('抖音') ? (
                    <Smartphone className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Monitor className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="font-medium text-sm">{size.platform}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {size.width} × {size.height}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            导出格式
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                  format === fmt
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        {format !== 'png' && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              质量: {quality}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          {exporting ? '正在生成…' : '下载封面图片'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          💡 支持 PNG、JPEG、WebP 格式，可自定义质量
        </p>
      </div>
    </div>
  )
}

