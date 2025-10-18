import TextEditor from './editors/TextEditor'
import ColorEditor from './editors/ColorEditor'
import ElementEditor from './editors/ElementEditor'

interface EditorPanelProps {
  type: 'text' | 'color' | 'element'
}

export default function EditorPanel({ type }: EditorPanelProps) {
  return (
    <div className="card">
      {type === 'text' && <TextEditor />}
      {type === 'color' && <ColorEditor />}
      {type === 'element' && <ElementEditor />}
    </div>
  )
}

