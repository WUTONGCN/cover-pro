import { useRef, useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { TextElement, EmojiElement, ShapeElement } from '../types'

export default function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { canvas, elements } = useEditorStore()

  useEffect(() => {
    const canvasElement = canvasRef.current
    if (!canvasElement) return

    const ctx = canvasElement.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    if (canvas.backgroundColor.startsWith('linear-gradient')) {
      // Parse gradient (simplified)
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

    // Sort elements by zIndex
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex)

    // Draw elements
    sortedElements.forEach((element) => {
      if (!element.visible) return

      ctx.save()
      ctx.globalAlpha = element.opacity

      // Apply rotation
      if (element.rotation !== 0) {
        const centerX = element.x + element.width / 2
        const centerY = element.y + element.height / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((element.rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)
      }

      if (element.type === 'text') {
        drawText(ctx, element as TextElement)
      } else if (element.type === 'emoji') {
        drawEmoji(ctx, element as EmojiElement)
      } else if (element.type === 'shape') {
        drawShape(ctx, element as ShapeElement)
      }

      ctx.restore()
    })
  }, [canvas, elements])

  const drawText = (ctx: CanvasRenderingContext2D, element: TextElement) => {
    ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`
    ctx.fillStyle = element.color
    ctx.textAlign = element.textAlign
    ctx.textBaseline = 'top'

    const lines = element.content.split('\n')
    const lineHeight = element.fontSize * element.lineHeight

    let textX = element.x
    if (element.textAlign === 'center') {
      textX = element.x + element.width / 2
    } else if (element.textAlign === 'right') {
      textX = element.x + element.width
    }

    lines.forEach((line, index) => {
      const textY = element.y + index * lineHeight
      
      // Apply letter spacing
      if (element.letterSpacing !== 0) {
        const chars = line.split('')
        let currentX = textX
        
        if (element.textAlign === 'center') {
          const totalWidth = ctx.measureText(line).width + (chars.length - 1) * element.letterSpacing
          currentX = textX - totalWidth / 2
        } else if (element.textAlign === 'right') {
          const totalWidth = ctx.measureText(line).width + (chars.length - 1) * element.letterSpacing
          currentX = textX - totalWidth
        }

        chars.forEach((char) => {
          ctx.fillText(char, currentX, textY)
          currentX += ctx.measureText(char).width + element.letterSpacing
        })
      } else {
        ctx.fillText(line, textX, textY)
      }
    })
  }

  const drawEmoji = (ctx: CanvasRenderingContext2D, element: EmojiElement) => {
    ctx.font = `${element.fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      element.emoji,
      element.x + element.width / 2,
      element.y + element.height / 2
    )
  }

  const drawShape = (ctx: CanvasRenderingContext2D, element: ShapeElement) => {
    ctx.fillStyle = element.fillColor

    if (element.strokeColor && element.strokeWidth) {
      ctx.strokeStyle = element.strokeColor
      ctx.lineWidth = element.strokeWidth
    }

    if (element.shapeType === 'rect') {
      if (element.borderRadius) {
        // Draw rounded rectangle
        const x = element.x
        const y = element.y
        const width = element.width
        const height = element.height
        const radius = element.borderRadius

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
        if (element.strokeColor) ctx.stroke()
      } else {
        ctx.fillRect(element.x, element.y, element.width, element.height)
        if (element.strokeColor) {
          ctx.strokeRect(element.x, element.y, element.width, element.height)
        }
      }
    } else if (element.shapeType === 'circle') {
      ctx.beginPath()
      ctx.arc(
        element.x + element.width / 2,
        element.y + element.height / 2,
        element.width / 2,
        0,
        2 * Math.PI
      )
      ctx.fill()
      if (element.strokeColor) ctx.stroke()
    } else if (element.shapeType === 'star') {
      drawStar(
        ctx,
        element.x + element.width / 2,
        element.y + element.height / 2,
        5,
        element.width / 2,
        element.width / 4
      )
      ctx.fill()
      if (element.strokeColor) ctx.stroke()
    }
  }

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx, cy - outerRadius)
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }
    
    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath()
  }

  // Calculate scale to fit canvas in container
  const containerWidth = 800
  const scale = Math.min(containerWidth / canvas.width, 1)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">实时预览</h2>
        <span className="text-sm text-gray-500">
          {canvas.width} × {canvas.height}
        </span>
      </div>

      <div className="flex justify-center items-center bg-gray-50 rounded-xl p-8">
        <div 
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvas.width}
            height={canvas.height}
            className="shadow-2xl"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center">
        👆 在右侧面板编辑内容，实时预览效果
      </p>
    </div>
  )
}

