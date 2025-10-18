import { templates } from '../data/templates'
import { useEditorStore } from '../store/editorStore'

export default function TemplateSelector() {
  const { template, setTemplate } = useEditorStore()

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">✨</span>
        选择模板
      </h2>
      <p className="text-sm text-gray-600 mb-4">选择适合您内容的专业模板</p>
      
      <div className="grid grid-cols-1 gap-3">
        {templates.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => setTemplate(tmpl)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              template?.id === tmpl.id
                ? 'border-orange-500 bg-orange-50 shadow-lg'
                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{tmpl.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{tmpl.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{tmpl.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tmpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

