import { useState } from 'react'
import { Download, Smartphone, Monitor, Image as ImageIcon } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { platformSizes } from '../data/platformSizes'

export default function ExportPanel() {
  const { canvas, elements, setPlatformSize } = useEditorStore()
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [quality, setQuality] = useState(100)

  const currentPlatform = platformSizes.find(
    (p) => p.width === canvas.width && p.height === canvas.height
  )

  const handleExport = () => {
    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height
    const ctx = exportCanvas.getContext('2d')

    if (!ctx) return

    // Draw background
    if (canvas.backgroundColor.startsWith('linear-gradient')) {
      const match = canvas.backgroundColor.match(/linear-gradient\((\d+)deg,\s*([^,]+),\s*([^)]+)\)/)
      if (match) {
        const angle = parseInt(match[1])
        const color1 = match[2].trim()
        const color2 = match[3].trim()

        const angleRad = (angle - 90) * (Math.PI / 180)
        const x1 = canvas.width / 2 + Math.cos(angleRad) * canvas.width / 2
        const y1 = canvas.height / 2 + Math.sin(angleRad) * canvas.height / 2
        const x2 = canvas.width / 2 - Math.cos(angleRad) * canvas.width / 2
        const y2 = canvas.height / 2 - Math.sin(angleRad) * canvas.height / 2

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        gradient.addColorStop(0, color1)
        gradient.addColorStop(1, color2)
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = '#FFFFFF'
      }
    } else {
      ctx.fillStyle = canvas.backgroundColor
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw all elements (same as preview)
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex)
    
    sortedElements.forEach((element) => {
      if (!element.visible) return

      ctx.save()
      ctx.globalAlpha = element.opacity

      if (element.rotation !== 0) {
        const centerX = element.x + element.width / 2
        const centerY = element.y + element.height / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((element.rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)
      }

      if (element.type === 'text') {
        const textEl = element as any
        ctx.font = `${textEl.fontWeight} ${textEl.fontSize}px ${textEl.fontFamily}`
        ctx.fillStyle = textEl.color
        ctx.textAlign = textEl.textAlign
        ctx.textBaseline = 'top'

        const lines = textEl.content.split('\n')
        const lineHeight = textEl.fontSize * textEl.lineHeight

        let textX = textEl.x
        if (textEl.textAlign === 'center') {
          textX = textEl.x + textEl.width / 2
        } else if (textEl.textAlign === 'right') {
          textX = textEl.x + textEl.width
        }

        lines.forEach((line: string, index: number) => {
          const textY = textEl.y + index * lineHeight
          
          if (textEl.letterSpacing !== 0) {
            const chars = line.split('')
            let currentX = textX
            
            if (textEl.textAlign === 'center') {
              const totalWidth = ctx.measureText(line).width + (chars.length - 1) * textEl.letterSpacing
              currentX = textX - totalWidth / 2
            } else if (textEl.textAlign === 'right') {
              const totalWidth = ctx.measureText(line).width + (chars.length - 1) * textEl.letterSpacing
              currentX = textX - totalWidth
            }

            chars.forEach((char: string) => {
              ctx.fillText(char, currentX, textY)
              currentX += ctx.measureText(char).width + textEl.letterSpacing
            })
          } else {
            ctx.fillText(line, textX, textY)
          }
        })
      } else if (element.type === 'emoji') {
        const emojiEl = element as any
        ctx.font = `${emojiEl.fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          emojiEl.emoji,
          emojiEl.x + emojiEl.width / 2,
          emojiEl.y + emojiEl.height / 2
        )
      } else if (element.type === 'shape') {
        const shapeEl = element as any
        ctx.fillStyle = shapeEl.fillColor

        if (shapeEl.strokeColor && shapeEl.strokeWidth) {
          ctx.strokeStyle = shapeEl.strokeColor
          ctx.lineWidth = shapeEl.strokeWidth
        }

        if (shapeEl.shapeType === 'rect') {
          if (shapeEl.borderRadius) {
            const x = shapeEl.x
            const y = shapeEl.y
            const width = shapeEl.width
            const height = shapeEl.height
            const radius = shapeEl.borderRadius

            ctx.beginPath()
            ctx.moveTo(x + radius, y)
            ctx.lineTo(x + width - radius, y)
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
            ctx.lineTo(x + width, y + height - radius)
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
            ctx.lineTo(x + radius, y + height)
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
            ctx.lineTo(x, y + radius)
            ctx.quadraticCurveTo(x, y, x + radius, y)
            ctx.closePath()
            ctx.fill()
            if (shapeEl.strokeColor) ctx.stroke()
          } else {
            ctx.fillRect(shapeEl.x, shapeEl.y, shapeEl.width, shapeEl.height)
            if (shapeEl.strokeColor) {
              ctx.strokeRect(shapeEl.x, shapeEl.y, shapeEl.width, shapeEl.height)
            }
          }
        } else if (shapeEl.shapeType === 'circle') {
          ctx.beginPath()
          ctx.arc(
            shapeEl.x + shapeEl.width / 2,
            shapeEl.y + shapeEl.height / 2,
            shapeEl.width / 2,
            0,
            2 * Math.PI
          )
          ctx.fill()
          if (shapeEl.strokeColor) ctx.stroke()
        } else if (shapeEl.shapeType === 'star') {
          // Draw star shape
          const centerX = shapeEl.x + shapeEl.width / 2
          const centerY = shapeEl.y + shapeEl.height / 2
          const outerRadius = shapeEl.width / 2
          const innerRadius = outerRadius * 0.5
          const spikes = 5

          ctx.beginPath()
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (i * Math.PI) / spikes - Math.PI / 2
            const x = centerX + Math.cos(angle) * radius
            const y = centerY + Math.sin(angle) * radius
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.closePath()
          ctx.fill()
          if (shapeEl.strokeColor) ctx.stroke()
        } else if (shapeEl.shapeType === 'triangle') {
          // Draw triangle
          const centerX = shapeEl.x + shapeEl.width / 2
          const topY = shapeEl.y
          const bottomY = shapeEl.y + shapeEl.height
          const leftX = shapeEl.x
          const rightX = shapeEl.x + shapeEl.width

          ctx.beginPath()
          ctx.moveTo(centerX, topY)
          ctx.lineTo(rightX, bottomY)
          ctx.lineTo(leftX, bottomY)
          ctx.closePath()
          ctx.fill()
          if (shapeEl.strokeColor) ctx.stroke()
        }
      }

      ctx.restore()
    })

    // Export
    const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp'
    const qualityValue = format === 'png' ? 1 : quality / 100

    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `cover-${Date.now()}.${format}`
          link.click()
          URL.revokeObjectURL(url)
        }
      },
      mimeType,
      qualityValue
    )
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

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          下载封面图片
        </button>

        <p className="text-xs text-gray-500 text-center">
          💡 支持 PNG、JPEG、WebP 格式，可自定义质量
        </p>
      </div>
    </div>
  )
}

