import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { useEditorStore as store } from '../src/store/editorStore'
import { templates } from '../src/data/templates'
import { renderCanvas } from '../src/utils/renderCanvas'
const initial = store.getInitialState()
beforeEach(() => store.setState(initial, true))
const state = () => store.getState()
test('template changes undo and redo with canvas and selection', () => {
  state().setTemplate(templates[0])
  const elements = structuredClone(state().elements)
  state().undo(); assert.deepEqual(state().elements, [])
  state().redo(); assert.deepEqual(state().elements, elements)
})
test('drag transaction is restored in one undo and redo is cleared by a new edit', () => {
  state().setTemplate(templates[0]); const id = state().elements[0].id; const x = state().elements[0].x
  state().beginTransaction()
  state().updateElement(id, { x: 12 }); state().updateElement(id, { x: 40 })
  state().endTransaction()
  assert.equal(state().history.past.length, 2)
  state().undo(); assert.equal(state().elements[0].x, x)
  state().redo(); assert.equal(state().elements[0].x, 40)
  state().undo(); state().updateElement(id, { x: 75 }); assert.equal(state().history.future.length, 0)
})
test('layer reordering does not mutate the previous state', () => {
  state().setTemplate(templates[0]); const before = state().elements; const snapshot = structuredClone(before)
  state().moveElement(before[0].id, 'top')
  assert.deepEqual(before, snapshot)
  state().undo(); assert.deepEqual(state().elements, snapshot)
})
test('locked elements reject edits until unlocked', () => {
  state().setTemplate(templates[0]); const {id, x} = state().elements[0]
  state().updateElement(id, { locked: true }); state().updateElement(id, { x: 999 })
  assert.equal(state().elements[0].x, x)
  state().updateElement(id, { locked: false }); state().updateElement(id, { x: 999 })
  assert.equal(state().elements[0].x, 999)
})
test('history is bounded and no-op updates do not create steps', () => {
  state().setTemplate(templates[0]); const {id, x} = state().elements[0]
  state().updateElement(id, { x }); assert.equal(state().history.past.length, 1)
  for(let i=0;i<150;i++) state().updateElement(id, { x: i })
  assert.equal(state().history.past.length, 100)
})
test('reset clears metadata and can be undone', () => {
  state().setTemplate(templates[0]); state().reset()
  assert.equal(state().template, undefined); assert.equal(state().elements.length, 0)
  state().undo(); assert.equal(state().template?.id, templates[0].id)
})
test('bulk alignment makes one undo step', () => {
  state().setTemplate(templates[0]); const before = structuredClone(state().elements)
  before.forEach(el => state().selectElement(el.id, true))
  state().alignElements('left'); assert.equal(state().history.past.length, 2)
  state().undo(); assert.deepEqual(state().elements, before)
})
test('renderer draws gradients and triangle with matching preview/export path', () => {
  const calls: string[] = []
  const ctx = new Proxy({}, { get: (_, key) => () => {
    calls.push(String(key));
    if(key === 'createLinearGradient') return { addColorStop: () => {} }
    if(key === 'measureText') return { width: 20 }
  }, set: () => true }) as CanvasRenderingContext2D
  renderCanvas(ctx, {width:100, height:100, backgroundColor:'linear-gradient(90deg, #ffffff, #000000)'}, [{
    id:'triangle', type:'shape', shapeType:'triangle', x:0,y:0,width:100,height:100,
    rotation:0,opacity:1,zIndex:0,locked:false,visible:true,fillColor:'#ff0000',
  }])
  assert.ok(calls.includes('createLinearGradient')); assert.ok(calls.includes('closePath'))
  assert.equal(calls.filter(c => c === 'lineTo').length, 2)
})
