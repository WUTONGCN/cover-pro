// Template Types
export type TemplateType = 
  | 'thinking'
  | 'dialog'
  | 'emotion'
  | 'suggestion'
  | 'story'
  | 'data'
  | 'comparison'
  | 'checklist'
  | 'quote'
  | 'minimal'
  | 'gradient' | 'card3d' | 'cyberpunk' | 'retro' | 'magazine'
  | 'tech' | 'handdrawn' | 'glassmorphism' | 'memphis' | 'chinese'

export interface Template {
  id: string
  name: string
  type: TemplateType
  emoji: string
  description: string
  tags: string[]
  preview: string
  layout: TemplateLayout
}

export interface TemplateLayout {
  backgroundColor: string
  backgroundImage?: string
  elements: CanvasElement[]
}

// Canvas Element Types
export type ElementType = 'text' | 'image' | 'shape' | 'emoji' | 'sticker'

export interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  zIndex: number
  locked: boolean
  visible: boolean
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  textAlign: 'left' | 'center' | 'right'
  lineHeight: number
  letterSpacing: number
  textShadow?: TextShadow
  textStroke?: TextStroke
  backgroundColor?: string
  padding?: number
  borderRadius?: number
}

export interface TextShadow {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

export interface TextStroke {
  enabled: boolean
  color: string
  width: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  filter?: ImageFilter
}

export interface ImageFilter {
  brightness: number
  contrast: number
  saturate: number
  blur: number
}

export interface ShapeElement extends BaseElement {
  type: 'shape'
  shapeType: 'rect' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow'
  fillColor: string
  strokeColor?: string
  strokeWidth?: number
  borderRadius?: number
}

export interface EmojiElement extends BaseElement {
  type: 'emoji'
  emoji: string
  fontSize: number
}

export interface StickerElement extends BaseElement {
  type: 'sticker'
  src: string
  category: string
}

export type CanvasElement = TextElement | ImageElement | ShapeElement | EmojiElement | StickerElement

// Color Theme
export interface ColorTheme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  gradient?: {
    start: string
    end: string
    angle: number
  }
}

// Platform Size
export interface PlatformSize {
  id: string
  name: string
  platform: string
  width: number
  height: number
  ratio: string
}

// Export Options
export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp'
  quality: number
  scale: number
  platformSize: PlatformSize
}

// Editor State
export interface EditorState {
  canvas: {
    width: number
    height: number
    backgroundColor: string
    backgroundImage?: string
  }
  elements: CanvasElement[]
  selectedElementIds: string[]
  template?: Template
  colorTheme?: ColorTheme
  history: {
    past: EditorSnapshot[]
    future: EditorSnapshot[]
  }
}

// Font
export interface Font {
  id: string
  name: string
  family: string
  preview: string
  weights: number[]
}


export type EditorSnapshot = Omit<EditorState, 'history'>
