import { useRef, useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'
import { renderCanvas } from '../utils/renderCanvas'

export default function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { canvas, elements } = useEditorStore()

  useEffect(() => {
    const canvasElement = canvasRef.current
    if (!canvasElement) return

    const ctx = canvasElement.getContext('2d')
    if (!ctx) return

    renderCanvas(ctx, canvas, elements)
  }, [canvas, elements])

  const containerWidth = 600
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

