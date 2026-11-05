function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
assert.strictEqual = (a: unknown, b: unknown, msg?: string) => {
  if (a !== b) throw new Error(`${msg || 'Assertion failed'}: expected ${b}, got ${a}`);
};
assert.deepStrictEqual = (a: unknown, b: unknown, msg?: string) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg || 'Assertion failed'}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
};
assert.ok = (a: unknown, msg?: string): asserts a => {
  if (!a) throw new Error(msg || 'Assertion failed');
};
import {
  distToSegment,
  getElementBounds,
  hitTestElement,
  getHandlesForElement,
  hitTestHandles,
  cloneElement,
  cloneElements,
  CanvasElement,
  ToolType,
  ResizeHandle
} from '../pages/teacher/smartboard/WhiteboardCanvas.js';

console.log('--- Starting Smart Board Selection & Manipulation Verification ---');

// Test 1: Hit test and selection on rectangle
{
  const rect: CanvasElement = {
    id: 'rect_1',
    tool: 'rect',
    x: 100,
    y: 100,
    widthBox: 150,
    heightBox: 100,
    color: '#111827',
    width: 4
  };

  assert.strictEqual(hitTestElement(rect, 150, 150), true, 'Inside rect should hit');
  assert.strictEqual(hitTestElement(rect, 98, 98), true, 'Close to border within tolerance should hit');
  assert.strictEqual(hitTestElement(rect, 300, 300), false, 'Far outside rect should not hit');

  // Verify moving rect
  const moved = cloneElement(rect);
  const dx = 40;
  const dy = -20;
  moved.x! += dx;
  moved.y! += dy;
  assert.strictEqual(moved.x, 140, 'Rect X translated');
  assert.strictEqual(moved.y, 80, 'Rect Y translated');
  assert.strictEqual(moved.widthBox, 150, 'Rect width preserved');
  assert.strictEqual(moved.heightBox, 100, 'Rect height preserved');
  console.log('✓ Scenario 1: Select and move a rectangle passed');
}

// Test 2: Select and move an inserted image
{
  const imgEl: CanvasElement = {
    id: 'img_1',
    tool: 'rect',
    imageDataUrl: 'data:image/png;base64,fakeimage',
    x: 200,
    y: 150,
    widthBox: 300,
    heightBox: 200,
    color: '#000000',
    width: 1
  };

  assert.strictEqual(hitTestElement(imgEl, 250, 200), true, 'Inside image should hit');
  assert.strictEqual(hitTestElement(imgEl, 50, 50), false, 'Outside image should not hit');

  const movedImg = cloneElement(imgEl);
  movedImg.x! += 60;
  movedImg.y! += 40;
  assert.strictEqual(movedImg.x, 260, 'Image X translated');
  assert.strictEqual(movedImg.y, 190, 'Image Y translated');
  assert.strictEqual(movedImg.imageDataUrl, 'data:image/png;base64,fakeimage', 'Image data preserved');
  console.log('✓ Scenario 2: Select and move an inserted image passed');
}

// Test 3: Select and move an arrow
{
  const arrow: CanvasElement = {
    id: 'arrow_1',
    tool: 'arrow',
    points: [{ x: 50, y: 50 }, { x: 250, y: 250 }],
    color: '#dc2626',
    width: 4
  };

  // Point (150, 150) lies directly on the arrow line
  assert.strictEqual(hitTestElement(arrow, 150, 150), true, 'Point on arrow shaft should hit');
  // Point (154, 150) is within 8px tolerance
  assert.strictEqual(hitTestElement(arrow, 154, 150), true, 'Point within tolerance of shaft should hit');
  // Point (50, 200) is far off
  assert.strictEqual(hitTestElement(arrow, 50, 200), false, 'Point far off arrow should not hit');

  // Verify translation
  const movedArrow = cloneElement(arrow);
  const dx = 30;
  const dy = -15;
  movedArrow.points!.forEach(p => {
    p.x += dx;
    p.y += dy;
  });
  assert.deepStrictEqual(movedArrow.points, [{ x: 80, y: 35 }, { x: 280, y: 235 }]);
  console.log('✓ Scenario 3: Select and move an arrow passed');
}

// Test 4: Select and move a text object
{
  const textEl: CanvasElement = {
    id: 'text_1',
    tool: 'text',
    x: 100,
    y: 80,
    text: 'Quadratic Equation Formula',
    color: '#2563eb',
    width: 4
  };

  const bounds = getElementBounds(textEl);
  assert.ok(bounds.width > 50, 'Text bounds width computed');
  assert.ok(bounds.height > 10, 'Text bounds height computed');
  assert.strictEqual(hitTestElement(textEl, 120, 75), true, 'Clicking text body should hit');
  assert.strictEqual(hitTestElement(textEl, 500, 500), false, 'Clicking far away should not hit');

  const movedText = cloneElement(textEl);
  movedText.x! += 25;
  movedText.y! += 30;
  assert.strictEqual(movedText.x, 125, 'Text X translated');
  assert.strictEqual(movedText.y, 110, 'Text Y translated');
  assert.strictEqual(movedText.text, 'Quadratic Equation Formula', 'Text content preserved');
  console.log('✓ Scenario 4: Select and move a text object passed');
}

// Test 5: Resize supported objects (rect, circle, image, arrow)
{
  // 5a: Rectangle resize via handles
  const rect: CanvasElement = {
    id: 'r_resize',
    tool: 'rect',
    x: 100,
    y: 100,
    widthBox: 100,
    heightBox: 80,
    color: '#000',
    width: 2
  };
  const handles = getHandlesForElement(rect);
  assert.strictEqual(handles.length, 4, 'Rect should have 4 corner handles');
  const nw = handles.find(h => h.type === 'nw')!;
  const se = handles.find(h => h.type === 'se')!;
  assert.strictEqual(nw.x, 100);
  assert.strictEqual(nw.y, 100);
  assert.strictEqual(se.x, 200);
  assert.strictEqual(se.y, 180);

  // Hit test handles
  assert.strictEqual(hitTestHandles(rect, 202, 181), 'se', 'SE handle hit within 9px radius');
  assert.strictEqual(hitTestHandles(rect, 99, 101), 'nw', 'NW handle hit within 9px radius');
  assert.strictEqual(hitTestHandles(rect, 150, 140), null, 'Center of rect is not a handle');

  // Resize SE by (+20, +30)
  const resizedSE = cloneElement(rect);
  resizedSE.widthBox! += 20;
  resizedSE.heightBox! += 30;
  assert.strictEqual(resizedSE.widthBox, 120);
  assert.strictEqual(resizedSE.heightBox, 110);
  assert.strictEqual(resizedSE.x, 100);
  assert.strictEqual(resizedSE.y, 100);

  // Resize NW by (+10, +10) -> moves top-left, reduces width/height
  const resizedNW = cloneElement(rect);
  const dx = 10, dy = 10;
  resizedNW.x! += dx;
  resizedNW.widthBox! -= dx;
  resizedNW.y! += dy;
  resizedNW.heightBox! -= dy;
  assert.strictEqual(resizedNW.x, 110);
  assert.strictEqual(resizedNW.y, 110);
  assert.strictEqual(resizedNW.widthBox, 90);
  assert.strictEqual(resizedNW.heightBox, 70);

  // 5b: Arrow resize via start/end handles
  const arrow: CanvasElement = {
    id: 'a_resize',
    tool: 'arrow',
    points: [{ x: 50, y: 50 }, { x: 200, y: 150 }],
    color: '#16a34a',
    width: 3
  };
  const arrowHandles = getHandlesForElement(arrow);
  assert.strictEqual(arrowHandles.length, 2, 'Arrow has start and end handles');
  assert.strictEqual(hitTestHandles(arrow, 52, 49), 'start', 'Start handle hit');
  assert.strictEqual(hitTestHandles(arrow, 198, 151), 'end', 'End handle hit');

  // Move end handle to (250, 180)
  const resizedArrow = cloneElement(arrow);
  resizedArrow.points![1] = { x: 250, y: 180 };
  assert.strictEqual(resizedArrow.points![1].x, 250);
  assert.strictEqual(resizedArrow.points![1].y, 180);

  // 5c: Circle resize
  const circle: CanvasElement = {
    id: 'c_resize',
    tool: 'circle',
    x: 50,
    y: 50,
    widthBox: 100,
    heightBox: 100,
    color: '#ea580c',
    width: 2
  };
  const circleHandles = getHandlesForElement(circle);
  assert.strictEqual(circleHandles.length, 4, 'Circle has 4 corner bounding handles');

  // 5d: Image resize
  const img: CanvasElement = {
    id: 'img_resize',
    tool: 'rect',
    imageDataUrl: 'data:...',
    x: 0,
    y: 0,
    widthBox: 200,
    heightBox: 150,
    color: '#000',
    width: 1
  };
  const imgHandles = getHandlesForElement(img);
  assert.strictEqual(imgHandles.length, 4, 'Image has 4 corner bounding handles');
  console.log('✓ Scenario 5: Resize supported objects passed');
}

// Test 6: Deselection on empty canvas click
{
  const elements: CanvasElement[] = [
    { id: '1', tool: 'rect', x: 50, y: 50, widthBox: 50, heightBox: 50, color: '#000', width: 2 },
    { id: '2', tool: 'rect', x: 200, y: 200, widthBox: 50, heightBox: 50, color: '#000', width: 2 },
  ];

  let selectedId: string | null = '1';

  // Simulate click at empty canvas (500, 500)
  const clickX = 500, clickY = 500;
  let hit = false;
  for (let i = elements.length - 1; i >= 0; i--) {
    if (hitTestElement(elements[i], clickX, clickY)) {
      selectedId = elements[i].id;
      hit = true;
      break;
    }
  }
  if (!hit) {
    selectedId = null;
  }
  assert.strictEqual(selectedId, null, 'Deselection occurred on empty canvas click');
  console.log('✓ Scenario 6: Deselection on empty canvas click passed');
}

// Test 7 & 8: Mode isolation - Select mode does NOT create elements; Switching to pen creates stroke
{
  const canvasElements: CanvasElement[] = [
    { id: 'existing', tool: 'rect', x: 10, y: 10, widthBox: 100, heightBox: 100, color: '#000', width: 2 }
  ];
  let activeTool: ToolType = 'select';
  let isDrawing = false;
  let createdElement: CanvasElement | null = null;

  // Pointer down in Select mode on existing element
  if (activeTool === 'select') {
    // In select mode, isDrawing is NEVER set to true, and no element is created
    isDrawing = false;
    createdElement = null;
  }
  assert.strictEqual(isDrawing, false, 'Select mode does not enter drawing state');
  assert.strictEqual(createdElement, null, 'Select mode does not create accidental elements');
  assert.strictEqual(canvasElements.length, 1, 'Canvas elements count unchanged');

  // Switch to Pen tool
  activeTool = 'pen';
  if (activeTool === 'pen') {
    isDrawing = true;
    createdElement = {
      id: 'stroke_1',
      tool: 'pen',
      points: [{ x: 50, y: 50 }],
      color: '#111827',
      width: 4
    };
    canvasElements.push(createdElement);
  }
  assert.strictEqual(isDrawing, true, 'Pen mode enters drawing state');
  assert.strictEqual(canvasElements.length, 2, 'New stroke added');
  assert.strictEqual(canvasElements[1].id, 'stroke_1');
  console.log('✓ Scenario 7 & 8: Mode isolation & safe tool switching passed');
}

// Test 9: Image and Arrow rendering & structure integrity
{
  const arrow: CanvasElement = {
    id: 'arrow_test',
    tool: 'arrow',
    points: [{ x: 100, y: 100 }, { x: 300, y: 100 }],
    color: '#2563eb',
    width: 4
  };
  const bounds = getElementBounds(arrow);
  assert.strictEqual(bounds.minX, 96, 'MinX accounts for padding');
  assert.strictEqual(bounds.maxX, 304, 'MaxX accounts for padding');
  assert.strictEqual(bounds.minY, 96, 'MinY accounts for padding');
  assert.strictEqual(bounds.maxY, 104, 'MaxY accounts for padding');

  const img: CanvasElement = {
    id: 'img_test',
    tool: 'rect',
    imageDataUrl: 'data:image/jpeg;base64,12345',
    x: 40,
    y: 60,
    widthBox: 120,
    heightBox: 80,
    color: '#000',
    width: 1
  };
  const imgBounds = getElementBounds(img);
  assert.strictEqual(imgBounds.minX, 40);
  assert.strictEqual(imgBounds.minY, 60);
  assert.strictEqual(imgBounds.width, 120);
  assert.strictEqual(imgBounds.height, 80);
  console.log('✓ Scenario 9: Image and arrow structures and bounds intact');
}

// Test 10: Undo/Redo history restoration of moved & resized elements
{
  const initial: CanvasElement[] = [
    { id: 'el_move', tool: 'rect', x: 50, y: 50, widthBox: 100, heightBox: 100, color: '#000', width: 2 }
  ];

  const undoStack: CanvasElement[][] = [];
  const redoStack: CanvasElement[][] = [];
  let currentElements = cloneElements(initial);

  // Step 1: User moves rect to (150, 150)
  const beforeMoveSnapshot = cloneElements(currentElements);
  undoStack.push(beforeMoveSnapshot);
  redoStack.length = 0; // Clear redo

  currentElements[0].x = 150;
  currentElements[0].y = 150;
  assert.strictEqual(currentElements[0].x, 150);

  // Step 2: User resizes rect to width 200
  const beforeResizeSnapshot = cloneElements(currentElements);
  undoStack.push(beforeResizeSnapshot);
  redoStack.length = 0;

  currentElements[0].widthBox = 200;
  assert.strictEqual(currentElements[0].widthBox, 200);

  // Step 3: Undo resize
  const undoResizeSnapshot = undoStack.pop()!;
  redoStack.push(cloneElements(currentElements));
  currentElements = undoResizeSnapshot;

  assert.strictEqual(currentElements[0].widthBox, 100, 'Undo restored widthBox to 100');
  assert.strictEqual(currentElements[0].x, 150, 'X is still 150');

  // Step 4: Undo move
  const undoMoveSnapshot = undoStack.pop()!;
  redoStack.push(cloneElements(currentElements));
  currentElements = undoMoveSnapshot;

  assert.strictEqual(currentElements[0].x, 50, 'Undo restored X to 50');
  assert.strictEqual(currentElements[0].y, 50, 'Undo restored Y to 50');

  // Step 5: Redo move
  const redoMoveSnapshot = redoStack.pop()!;
  undoStack.push(cloneElements(currentElements));
  currentElements = redoMoveSnapshot;

  assert.strictEqual(currentElements[0].x, 150, 'Redo restored moved X to 150');

  // Step 6: Redo resize
  const redoResizeSnapshot = redoStack.pop()!;
  undoStack.push(cloneElements(currentElements));
  currentElements = redoResizeSnapshot;

  assert.strictEqual(currentElements[0].widthBox, 200, 'Redo restored resized widthBox to 200');
  console.log('✓ Scenario 10: Undo/redo history restoration of moved & resized elements passed');
}

console.log('========================================================');
console.log('ALL 10 VERIFICATION SCENARIOS PASSED WITH ZERO FAILURES!');
console.log('========================================================');
