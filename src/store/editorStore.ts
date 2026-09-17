import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { EditorState, EditorSnapshot, CanvasElement, Template, ColorTheme, PlatformSize } from '../types'

interface EditorStore extends EditorState {
  beginTransaction: () => void
  endTransaction: () => void
  // Actions
  setTemplate: (template: Template) => void
  setColorTheme: (theme: ColorTheme) => void
  setPlatformSize: (size: PlatformSize) => void
  addElement: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  removeElement: (id: string) => void
  selectElement: (id: string, multiple?: boolean) => void
  clearSelection: () => void
  moveElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void
  duplicateElement: (id: string) => void
  setBackgroundColor: (color: string) => void
  setBackgroundImage: (url: string) => void
  alignElements: (alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical') => void
  undo: () => void
  redo: () => void
  reset: () => void
  generateRandomContent: () => void
}

const getInitialState = (): EditorState => ({
  canvas: {
    width: 1080,
    height: 1440,
    backgroundColor: '#FBFFE4',
  },
  template: undefined,
  colorTheme: undefined,
  elements: [],
  selectedElementIds: [],
  history: {
    past: [],
    future: [],
  },
})

const snapshot = (state: EditorState): EditorSnapshot => structuredClone({
  canvas: state.canvas, elements: state.elements, selectedElementIds: state.selectedElementIds,
  template: state.template, colorTheme: state.colorTheme,
})
const sameDocument = (a: EditorState | EditorSnapshot, b: EditorState | EditorSnapshot) =>
  JSON.stringify([a.canvas, a.elements, a.template, a.colorTheme]) ===
  JSON.stringify([b.canvas, b.elements, b.template, b.colorTheme])

export const useEditorStore = create<EditorStore>((rawSet, get) => {
  let transaction: EditorSnapshot | null = null
  const set: typeof rawSet = (update) => {
    const before = get()
    const changes = typeof update === 'function' ? update(before) : update
    const after = { ...before, ...changes }
    if (sameDocument(before, after)) {
      rawSet(changes)
      return
    }
    rawSet({ ...changes, history: {
      past: transaction ? before.history.past : [...before.history.past, snapshot(before)].slice(-100),
      future: [],
    } })
  }
  return ({
  beginTransaction: () => { if (!transaction) transaction = snapshot(get()) },
  endTransaction: () => {
    const before = transaction
    transaction = null
    if (before && !sameDocument(before, get())) {
      rawSet({ history: { past: [...get().history.past, before].slice(-100), future: [] } })
    }
  },
  ...getInitialState(),

  setTemplate: (template) => {
    const state = get()
    set({
      template,
      elements: template.layout.elements.map((el, index) => ({
        ...el,
        id: nanoid(),
        zIndex: index,
      })),
      canvas: {
        ...state.canvas,
        backgroundColor: template.layout.backgroundColor,
        backgroundImage: template.layout.backgroundImage,
      },
      selectedElementIds: [],
    })
  },

  setColorTheme: (theme) => {
    const state = get()
    set({
      colorTheme: theme,
      canvas: {
        ...state.canvas,
        backgroundColor: theme.gradient
          ? `linear-gradient(${theme.gradient.angle}deg, ${theme.gradient.start}, ${theme.gradient.end})`
          : theme.colors.background,
      },
      elements: state.elements.map((el) => {
        if (el.type === 'text') {
          return {
            ...el,
            color: theme.colors.text,
          }
        }
        return el
      }),
    })
  },

  setPlatformSize: (size) => {
    const state = get()
    set({
      canvas: {
        ...state.canvas,
        width: size.width,
        height: size.height,
      },
    })
  },

  addElement: (element) => {
    const state = get()
    const newElement = {
      ...element,
      id: nanoid(),
      zIndex: state.elements.length,
    } as CanvasElement

    set({
      elements: [...state.elements, newElement],
      selectedElementIds: [newElement.id],
    })
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id && (!el.locked || Object.keys(updates).every(key => key === 'locked' || key === 'visible'))
          ? { ...el, ...updates } as CanvasElement : el
      ),
    }))
  },

  removeElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementIds: state.selectedElementIds.filter((sid) => sid !== id),
    }))
  },

  selectElement: (id, multiple = false) => {
    set((state) => {
      if (multiple) {
        const isSelected = state.selectedElementIds.includes(id)
        return {
          selectedElementIds: isSelected
            ? state.selectedElementIds.filter((sid) => sid !== id)
            : [...state.selectedElementIds, id],
        }
      }
      return {
        selectedElementIds: [id],
      }
    })
  },

  clearSelection: () => {
    set({ selectedElementIds: [] })
  },

  moveElement: (id, direction) => {
    set((state) => {
      const elements = state.elements.map(el => ({ ...el }))
      const index = elements.findIndex((el) => el.id === id)
      
      if (index === -1) return state

      const element = elements[index]

      switch (direction) {
        case 'up':
          if (index < elements.length - 1) {
            [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]]
          }
          break
        case 'down':
          if (index > 0) {
            [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]]
          }
          break
        case 'top':
          elements.splice(index, 1)
          elements.push(element)
          break
        case 'bottom':
          elements.splice(index, 1)
          elements.unshift(element)
          break
      }

      // Update zIndex
      elements.forEach((el, i) => {
        el.zIndex = i
      })

      return { elements }
    })
  },

  duplicateElement: (id) => {
    set((state) => {
      const element = state.elements.find((el) => el.id === id)
      if (!element) return state

      const newElement = {
        ...element,
        id: nanoid(),
        x: element.x + 20,
        y: element.y + 20,
        zIndex: state.elements.length,
      }

      return {
        elements: [...state.elements, newElement],
        selectedElementIds: [newElement.id],
      }
    })
  },

  setBackgroundColor: (color) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        backgroundColor: color,
      },
    }))
  },

  setBackgroundImage: (url) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        backgroundImage: url,
      },
    }))
  },

  alignElements: (alignment) => {
    const state = get()
    const { selectedElementIds, elements, canvas } = state

    if (selectedElementIds.length === 0) return

    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id))
    
    get().beginTransaction()
    selectedElements.filter(element => !element.locked).forEach(element => {
      const updates: Partial<CanvasElement> = {}

      switch (alignment) {
        case 'left':
          updates.x = 0
          break
        case 'right':
          updates.x = canvas.width - element.width
          break
        case 'top':
          updates.y = 0
          break
        case 'bottom':
          updates.y = canvas.height - element.height
          break
        case 'center-horizontal':
          updates.x = (canvas.width - element.width) / 2
          break
        case 'center-vertical':
          updates.y = (canvas.height - element.height) / 2
          break
      }

      get().updateElement(element.id, updates)
    })
    get().endTransaction()
  },

  undo: () => {
    get().endTransaction()
    const { history } = get()
    const previous = history.past[history.past.length - 1]
    if (!previous) return
    rawSet({ ...structuredClone(previous), history: {
      past: history.past.slice(0, -1), future: [snapshot(get()), ...history.future].slice(0, 100),
    } })
  },

  redo: () => {
    get().endTransaction()
    const { history } = get()
    const next = history.future[0]
    if (!next) return
    rawSet({ ...structuredClone(next), history: {
      past: [...history.past, snapshot(get())].slice(-100), future: history.future.slice(1),
    } })
  },

  reset: () => {
    set(getInitialState())
  },

  generateRandomContent: () => {
    const randomTexts = [
      '大家都在用的\n封面生成器\n亲测有效',
      '3分钟搞定\n小红书封面\n从此告别设计烦恼',
      '超实用技巧\n让你的封面\n点击率翻倍',
      '爆款封面\n原来这么简单\n手把手教你',
      '设计小白必看\n零基础做出\n专业级封面',
    ]

    const randomEmojis = ['🤔', '👍', '😍', '💡', '🎯', '✨', '🔥', '💪', '🎨', '📱']

    const state = get()
    const textElement = state.elements.find((el) => el.type === 'text' && !el.locked)
    const emojiElement = state.elements.find((el) => el.type === 'emoji' && !el.locked)

    get().beginTransaction()
    if (textElement) {
      const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)]
      get().updateElement(textElement.id, { content: randomText })
    }

    if (emojiElement) {
      const randomEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)]
      get().updateElement(emojiElement.id, { emoji: randomEmoji })
    }
    get().endTransaction()
  },
})
})
