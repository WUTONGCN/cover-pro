import type { EditorState } from '../types'

export function renderCanvas(ctx: CanvasRenderingContext2D, canvas: EditorState['canvas'], elements: EditorState['elements']) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
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

        const gradient = ctx.createLinearGradient(x2, y2, x1, y1)
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
        const textEl = element
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
            const chars = Array.from(line)
            let currentX = textX

            if (textEl.textAlign === 'center') {
              const totalWidth = ctx.measureText(line).width + (chars.length - 1) * textEl.letterSpacing
              currentX = textX - totalWidth / 2
            } else if (textEl.textAlign === 'right') {
              const totalWidth = ctx.measureText(line).width + (chars.length - 1) * textEl.letterSpacing
              currentX = textX - totalWidth
            }

            ctx.textAlign = 'left'
            chars.forEach((char: string) => {
              ctx.fillText(char, currentX, textY)
              currentX += ctx.measureText(char).width + textEl.letterSpacing
            })
          } else {
            ctx.fillText(line, textX, textY)
          }
        })
      } else if (element.type === 'emoji') {
        const emojiEl = element
        ctx.font = `${emojiEl.fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          emojiEl.emoji,
          emojiEl.x + emojiEl.width / 2,
          emojiEl.y + emojiEl.height / 2
        )
      } else if (element.type === 'shape') {
        const shapeEl = element
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
            const radius = Math.min(shapeEl.borderRadius, width / 2, height / 2)

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
            Math.min(shapeEl.width, shapeEl.height) / 2,
            0,
            2 * Math.PI
          )
          ctx.fill()
          if (shapeEl.strokeColor) ctx.stroke()
        } else if (shapeEl.shapeType === 'star') {
          // Draw star shape
          const centerX = shapeEl.x + shapeEl.width / 2
          const centerY = shapeEl.y + shapeEl.height / 2
          const outerRadius = Math.min(shapeEl.width, shapeEl.height) / 2
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

}
