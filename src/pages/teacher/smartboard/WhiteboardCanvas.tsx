import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Pen,
  Eraser,
  Type,
  Square,
  Circle,
  Minus,
  MoveRight,
  RotateCcw,
  RotateCw,
  Trash2,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Download,
  Highlighter,
  MousePointer2,
} from 'lucide-react';

export type ToolType = 'select' | 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'line' | 'arrow';

export type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'start' | 'end';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  tool: ToolType;
  points?: StrokePoint[];
  color: string;
  width: number;
  text?: string;
  x?: number;
  y?: number;
  widthBox?: number;
  heightBox?: number;
  image?: HTMLImageElement;
  imageDataUrl?: string;
}

export function cloneElement(el: CanvasElement): CanvasElement {
  return {
    ...el,
    points: el.points ? el.points.map((p) => ({ ...p })) : undefined,
  };
}

export function cloneElements(els: CanvasElement[]): CanvasElement[] {
  return els.map(cloneElement);
}

export function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function getElementBounds(el: CanvasElement): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (
    el.x !== undefined &&
    el.y !== undefined &&
    el.widthBox !== undefined &&
    el.heightBox !== undefined
  ) {
    const minX = Math.min(el.x, el.x + el.widthBox);
    const minY = Math.min(el.y, el.y + el.heightBox);
    const maxX = Math.max(el.x, el.x + el.widthBox);
    const maxY = Math.max(el.y, el.y + el.heightBox);
    return { minX, minY, maxX, maxY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
  }

  if (el.points && el.points.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of el.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const pad = Math.max(4, el.width / 2);
    return {
      minX: minX - pad,
      minY: minY - pad,
      maxX: maxX + pad,
      maxY: maxY + pad,
      width: Math.max(1, maxX - minX + pad * 2),
      height: Math.max(1, maxY - minY + pad * 2),
    };
  }

  if (el.tool === 'text' && el.text && el.x !== undefined && el.y !== undefined) {
    const fontSize = Math.max(16, el.width * 4);
    const textWidth = Math.max(20, el.text.length * fontSize * 0.62);
    return {
      minX: el.x,
      minY: el.y - fontSize,
      maxX: el.x + textWidth,
      maxY: el.y + 4,
      width: textWidth,
      height: fontSize + 4,
    };
  }

  return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
}

export function hitTestElement(el: CanvasElement, px: number, py: number): boolean {
  // 1. Box / Image / Rect / Circle
  if (
    el.x !== undefined &&
    el.y !== undefined &&
    el.widthBox !== undefined &&
    el.heightBox !== undefined
  ) {
    const bounds = getElementBounds(el);
    const tolerance = 6;
    if (el.tool === 'circle') {
      const radiusX = Math.abs(el.widthBox) / 2;
      const radiusY = Math.abs(el.heightBox) / 2;
      const centerX = el.x + el.widthBox / 2;
      const centerY = el.y + el.heightBox / 2;
      const rx = radiusX + tolerance;
      const ry = radiusY + tolerance;
      if (rx <= 0 || ry <= 0) return false;
      const norm = Math.pow((px - centerX) / rx, 2) + Math.pow((py - centerY) / ry, 2);
      return norm <= 1;
    }
    return (
      px >= bounds.minX - tolerance &&
      px <= bounds.maxX + tolerance &&
      py >= bounds.minY - tolerance &&
      py <= bounds.maxY + tolerance
    );
  }

  // 2. Line or Arrow
  if ((el.tool === 'line' || el.tool === 'arrow') && el.points && el.points.length >= 2) {
    const p1 = el.points[0];
    const p2 = el.points[1];
    const tolerance = Math.max(8, el.width + 4);
    return distToSegment(px, py, p1.x, p1.y, p2.x, p2.y) <= tolerance;
  }

  // 3. Freehand pen / highlighter / eraser
  if (el.points && el.points.length > 0) {
    const tolerance = Math.max(8, el.width + 4);
    if (el.points.length === 1) {
      return Math.hypot(px - el.points[0].x, py - el.points[0].y) <= tolerance;
    }
    for (let i = 0; i < el.points.length - 1; i++) {
      if (distToSegment(px, py, el.points[i].x, el.points[i].y, el.points[i + 1].x, el.points[i + 1].y) <= tolerance) {
        return true;
      }
    }
    return false;
  }

  // 4. Text
  if (el.tool === 'text') {
    const bounds = getElementBounds(el);
    const tolerance = 6;
    return (
      px >= bounds.minX - tolerance &&
      px <= bounds.maxX + tolerance &&
      py >= bounds.minY - tolerance &&
      py <= bounds.maxY + tolerance
    );
  }

  return false;
}

export function getHandlesForElement(el: CanvasElement): Array<{ type: ResizeHandle; x: number; y: number }> {
  if (
    el.x !== undefined &&
    el.y !== undefined &&
    el.widthBox !== undefined &&
    el.heightBox !== undefined
  ) {
    const bounds = getElementBounds(el);
    return [
      { type: 'nw', x: bounds.minX, y: bounds.minY },
      { type: 'ne', x: bounds.maxX, y: bounds.minY },
      { type: 'se', x: bounds.maxX, y: bounds.maxY },
      { type: 'sw', x: bounds.minX, y: bounds.maxY },
    ];
  }
  if ((el.tool === 'line' || el.tool === 'arrow') && el.points && el.points.length >= 2) {
    return [
      { type: 'start', x: el.points[0].x, y: el.points[0].y },
      { type: 'end', x: el.points[1].x, y: el.points[1].y },
    ];
  }
  return [];
}

export function hitTestHandles(el: CanvasElement, px: number, py: number): ResizeHandle | null {
  const handles = getHandlesForElement(el);
  const handleRadius = 9;
  for (const h of handles) {
    if (Math.hypot(px - h.x, py - h.y) <= handleRadius) {
      return h.type;
    }
  }
  return null;
}

export interface WhiteboardCanvasRef {
  getCanvasData: () => { dataUrl: string; elements: CanvasElement[] } | null;
  loadBoard: (dataUrl?: string, elements?: CanvasElement[]) => void;
  loadElements: (elements: CanvasElement[]) => void;
  clearCanvas: () => void;
}

interface WhiteboardCanvasProps {
  className?: string;
  onSave?: (dataUrl: string, elements: CanvasElement[]) => void;
  initialElements?: CanvasElement[];
}

const COLOR_PALETTE = [
  '#111827', // Black
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#9333ea', // Purple
  '#ea580c', // Orange
  '#eab308', // Yellow
  '#ffffff', // White
];

const STROKE_WIDTHS = [
  { label: 'S', width: 2 },
  { label: 'M', width: 4 },
  { label: 'L', width: 8 },
  { label: 'XL', width: 14 },
];

export const WhiteboardCanvas = forwardRef<WhiteboardCanvasRef, WhiteboardCanvasProps>(
  ({ className, onSave, initialElements }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#111827');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // History stacks
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [undoStack, setUndoStack] = useState<CanvasElement[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasElement[][]>([]);

  // Selection & manipulation state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const selectedElementIdRef = useRef<string | null>(null);
  selectedElementIdRef.current = selectedElementId;

  const dragActionRef = useRef<'move' | 'resize' | null>(null);
  const resizeHandleRef = useRef<ResizeHandle | null>(null);
  const dragStartRef = useRef<StrokePoint>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const snapshotBeforeActionRef = useRef<CanvasElement[] | null>(null);
  const [canvasCursor, setCanvasCursor] = useState<string>('crosshair');

  // Refs for real-time drawing without React re-renders on pointermove
  const elementsRef = useRef<CanvasElement[]>([]);
  elementsRef.current = elements;

  const isDrawingRef = useRef(false);
  const activeElementRef = useRef<CanvasElement | null>(null);
  const lastPointRef = useRef<StrokePoint | null>(null);
  const lastSizeRef = useRef({ width: 0, height: 0 });

  // Inline text input state
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);

  // Helper to render a single element onto a given 2D context
  const drawElement = useCallback((ctx: CanvasRenderingContext2D, el: CanvasElement) => {
    ctx.save();

    if (el.tool === 'highlighter') {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.width * 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (el.tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = el.width * 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // If element contains an image, prioritize drawing the image over basic shape outlines
    if (el.image && el.x !== undefined && el.y !== undefined && el.widthBox !== undefined && el.heightBox !== undefined) {
      try {
        if (el.image instanceof HTMLImageElement && el.image.complete && el.image.naturalWidth > 0) {
          ctx.drawImage(el.image, el.x, el.y, el.widthBox, el.heightBox);
        }
      } catch (err) {
        console.warn('Failed to draw image element:', err);
      }
    } else if ((el.tool === 'pen' || el.tool === 'highlighter' || el.tool === 'eraser') && el.points && el.points.length > 0) {
      if (el.points.length === 1) {
        // Draw single dot
        ctx.beginPath();
        ctx.arc(el.points[0].x, el.points[0].y, Math.max(1, el.width / 2), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      }
    } else if (el.tool === 'rect' && el.x !== undefined && el.y !== undefined && el.widthBox !== undefined && el.heightBox !== undefined) {
      ctx.beginPath();
      ctx.strokeRect(el.x, el.y, el.widthBox, el.heightBox);
    } else if (el.tool === 'circle' && el.x !== undefined && el.y !== undefined && el.widthBox !== undefined && el.heightBox !== undefined) {
      const radiusX = Math.max(0.1, Math.abs(el.widthBox) / 2);
      const radiusY = Math.max(0.1, Math.abs(el.heightBox) / 2);
      const centerX = el.x + el.widthBox / 2;
      const centerY = el.y + el.heightBox / 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (el.tool === 'line' && el.points && el.points.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      ctx.lineTo(el.points[1].x, el.points[1].y);
      ctx.stroke();
    } else if (el.tool === 'arrow' && el.points && el.points.length >= 2) {
      const fromX = el.points[0].x;
      const fromY = el.points[0].y;
      const toX = el.points[1].x;
      const toY = el.points[1].y;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const distance = Math.hypot(dx, dy);

      if (distance >= 2) {
        const angle = Math.atan2(dy, dx);
        // Clamp head length so short arrows don't invert
        const headLength = Math.min(Math.max(12, el.width * 3), distance * 0.6);
        const shaftEndX = toX - (headLength * 0.6) * Math.cos(angle);
        const shaftEndY = toY - (headLength * 0.6) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(shaftEndX, shaftEndY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
    } else if (el.tool === 'text' && el.text && el.x !== undefined && el.y !== undefined) {
      ctx.font = `bold ${Math.max(16, el.width * 4)}px sans-serif`;
      ctx.fillText(el.text, el.x, el.y);
    }

    ctx.restore();
  }, []);

  // Redraw all committed elements cleanly onto the main canvas (used during undo, redo, clear, or resize)
  const renderAllElements = useCallback((elementsToDraw?: CanvasElement[]) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    const rect = container?.getBoundingClientRect();
    const width = Math.floor(rect?.width || lastSizeRef.current.width || canvas.clientWidth || 800);
    const height = Math.floor(rect?.height || lastSizeRef.current.height || canvas.clientHeight || 600);
    if (width <= 0 || height <= 0) return;

    lastSizeRef.current = { width, height };
    const dpr = window.devicePixelRatio || 1;

    // Reset transform and fill entire canvas backing store with solid white
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width || width * dpr, canvas.height || height * dpr);
    ctx.restore();

    // Replay elements scaled to DPR
    ctx.save();
    ctx.scale(dpr, dpr);
    const list = elementsToDraw !== undefined ? elementsToDraw : elementsRef.current;
    for (let i = 0; i < list.length; i++) {
      try {
        drawElement(ctx, list[i]);
      } catch (err) {
        console.warn('Error drawing element:', err);
      }
    }
    ctx.restore();
  }, [drawElement]);

  // Expose imperative API for parent components (IntegratedSmartBoard & StandardSmartBoard)
  useImperativeHandle(ref, () => ({
    getCanvasData: () => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return null;
      return {
        dataUrl: canvas.toDataURL('image/png'),
        elements: elementsRef.current.map((el) => {
          if (el.image instanceof HTMLImageElement && !el.imageDataUrl) {
            return { ...el, imageDataUrl: el.image.src };
          }
          return el;
        }),
      };
    },
    loadBoard: (dataUrl?: string, newElements?: CanvasElement[]) => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();
      const cssWidth = Math.floor(rect?.width || lastSizeRef.current.width || canvas.clientWidth || 800);
      const cssHeight = Math.floor(rect?.height || lastSizeRef.current.height || canvas.clientHeight || 600);
      lastSizeRef.current = { width: cssWidth, height: cssHeight };
      const dpr = window.devicePixelRatio || 1;

      // Ensure canvas backing store matches size
      if (canvas.width !== Math.floor(cssWidth * dpr) || canvas.height !== Math.floor(cssHeight * dpr)) {
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
      }

      const safeElements = (newElements || []).map((el) => {
        if (el.imageDataUrl && !(el.image instanceof HTMLImageElement)) {
          const img = new window.Image();
          img.onload = () => {
            renderAllElements();
          };
          img.src = el.imageDataUrl;
          return { ...el, image: img };
        }
        return el;
      });

      setElements(safeElements);
      elementsRef.current = safeElements;
      setRedoStack([]);

      // If dataUrl snapshot is provided, draw it directly onto mainCanvas backing store
      if (dataUrl) {
        const bgImg = new window.Image();
        bgImg.onload = () => {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          // Render any vector elements on top
          if (safeElements.length > 0) {
            ctx.save();
            ctx.scale(dpr, dpr);
            for (let i = 0; i < safeElements.length; i++) {
              try {
                drawElement(ctx, safeElements[i]);
              } catch (err) {
                console.warn('Error drawing element:', err);
              }
            }
            ctx.restore();
          }
        };
        bgImg.onerror = () => {
          renderAllElements(safeElements);
        };
        bgImg.src = dataUrl;
      } else {
        renderAllElements(safeElements);
      }
    },
    loadElements: (newElements: CanvasElement[]) => {
      const safeElements = (newElements || []).map((el) => {
        if (el.imageDataUrl && !(el.image instanceof HTMLImageElement)) {
          const img = new window.Image();
          img.onload = () => {
            renderAllElements();
          };
          img.src = el.imageDataUrl;
          return { ...el, image: img };
        }
        return el;
      });
      setElements(safeElements);
      elementsRef.current = safeElements;
      setRedoStack([]);
      renderAllElements(safeElements);
    },
    clearCanvas: () => {
      setElements([]);
      elementsRef.current = [];
      setRedoStack([]);
      renderAllElements([]);
    },
  }));

  // Sync initialElements when provided by parent
  useEffect(() => {
    if (initialElements && initialElements.length > 0) {
      setElements(initialElements);
      elementsRef.current = initialElements;
      renderAllElements(initialElements);
    }
  }, [initialElements, renderAllElements]);

  // Resize canvases strictly to parent container while preserving DPI and avoiding unnecessary buffer resets
  const renderSelectionOverlay = useCallback((selectedId: string | null, customElements?: CanvasElement[]) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = lastSizeRef.current;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width || width * dpr, canvas.height || height * dpr);
    ctx.restore();

    if (!selectedId) return;

    const list = customElements || elementsRef.current;
    const el = list.find((item) => item.id === selectedId);
    if (!el) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    const bounds = getElementBounds(el);
    const pad = 6;
    const boxX = bounds.minX - pad;
    const boxY = bounds.minY - pad;
    const boxW = bounds.width + pad * 2;
    const boxH = bounds.height + pad * 2;

    // Draw dashed bounding box
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.setLineDash([]);

    // Draw handles
    const handles = getHandlesForElement(el);
    const handleSize = 8;
    for (const h of handles) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  const handleSelectTool = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool !== 'select') {
      setSelectedElementId(null);
      selectedElementIdRef.current = null;
      renderSelectionOverlay(null);
      if (tool === 'text') {
        setCanvasCursor('text');
      } else {
        setCanvasCursor('crosshair');
      }
    } else {
      setCanvasCursor('default');
    }
  };

  const handleDeleteSelected = useCallback(() => {
    if (!selectedElementIdRef.current) return;
    const currentId = selectedElementIdRef.current;
    const beforeSnapshot = cloneElements(elementsRef.current);
    const remaining = elementsRef.current.filter((el) => el.id !== currentId);
    setUndoStack((prev) => [...prev, beforeSnapshot]);
    setRedoStack([]);
    setElements(remaining);
    elementsRef.current = remaining;
    setSelectedElementId(null);
    selectedElementIdRef.current = null;
    renderSelectionOverlay(null);
    renderAllElements(remaining);

    if (onSave) {
      const canvas = mainCanvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL('image/png'), remaining);
      }
    }
  }, [onSave, renderAllElements, renderSelectionOverlay]);

  // Resize canvases strictly to parent container while preserving DPI and avoiding unnecessary buffer resets
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const mainCanvas = mainCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!container || !mainCanvas || !previewCanvas) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    if (width <= 0 || height <= 0) return;

    // Skip resizing if dimensions are unchanged to prevent canvas context reset
    if (lastSizeRef.current.width === width && lastSizeRef.current.height === height) {
      return;
    }

    lastSizeRef.current = { width, height };
    const dpr = window.devicePixelRatio || 1;

    mainCanvas.width = Math.floor(width * dpr);
    mainCanvas.height = Math.floor(height * dpr);
    mainCanvas.style.width = `${width}px`;
    mainCanvas.style.height = `${height}px`;

    previewCanvas.width = Math.floor(width * dpr);
    previewCanvas.height = Math.floor(height * dpr);
    previewCanvas.style.width = `${width}px`;
    previewCanvas.style.height = `${height}px`;

    const mainCtx = mainCanvas.getContext('2d');
    if (mainCtx) {
      mainCtx.scale(dpr, dpr);
    }

    const previewCtx = previewCanvas.getContext('2d');
    if (previewCtx) {
      previewCtx.scale(dpr, dpr);
    }

    renderAllElements();
    if (selectedElementIdRef.current) {
      renderSelectionOverlay(selectedElementIdRef.current);
    }
  }, [renderAllElements, renderSelectionOverlay]);

  useEffect(() => {
    handleResize();
    const observer = new ResizeObserver(() => {
      handleResize();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Compute pointer position in CSS coordinates
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 1. Pointer Down: Selection or start stroke/shape
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // If text input is open, commit first
    if (textInput) {
      commitText();
      return;
    }

    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'select') {
      // 1. Check if clicking on a resize handle of the currently selected element
      if (selectedElementIdRef.current) {
        const currentSel = elementsRef.current.find((item) => item.id === selectedElementIdRef.current);
        if (currentSel) {
          const handle = hitTestHandles(currentSel, x, y);
          if (handle) {
            dragActionRef.current = 'resize';
            resizeHandleRef.current = handle;
            dragStartRef.current = { x, y };
            hasMovedRef.current = false;
            snapshotBeforeActionRef.current = cloneElements(elementsRef.current);

            // Normalize box dimensions if applicable
            if (
              currentSel.widthBox !== undefined &&
              currentSel.heightBox !== undefined &&
              currentSel.x !== undefined &&
              currentSel.y !== undefined
            ) {
              const bounds = getElementBounds(currentSel);
              currentSel.x = bounds.minX;
              currentSel.y = bounds.minY;
              currentSel.widthBox = bounds.width;
              currentSel.heightBox = bounds.height;
            }

            try {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            } catch {}
            return;
          }
        }
      }

      // 2. Hit-test elements from top to bottom
      let hitIndex = -1;
      for (let i = elementsRef.current.length - 1; i >= 0; i--) {
        if (hitTestElement(elementsRef.current[i], x, y)) {
          hitIndex = i;
          break;
        }
      }

      if (hitIndex >= 0) {
        const hitEl = elementsRef.current[hitIndex];
        setSelectedElementId(hitEl.id);
        selectedElementIdRef.current = hitEl.id;
        dragActionRef.current = 'move';
        resizeHandleRef.current = null;
        dragStartRef.current = { x, y };
        hasMovedRef.current = false;
        snapshotBeforeActionRef.current = cloneElements(elementsRef.current);

        // Normalize box dimensions if applicable
        if (
          hitEl.widthBox !== undefined &&
          hitEl.heightBox !== undefined &&
          hitEl.x !== undefined &&
          hitEl.y !== undefined
        ) {
          const bounds = getElementBounds(hitEl);
          hitEl.x = bounds.minX;
          hitEl.y = bounds.minY;
          hitEl.widthBox = bounds.width;
          hitEl.heightBox = bounds.height;
        }

        renderSelectionOverlay(hitEl.id);

        try {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
      } else {
        // Clicked empty canvas -> Deselect
        setSelectedElementId(null);
        selectedElementIdRef.current = null;
        dragActionRef.current = null;
        resizeHandleRef.current = null;
        snapshotBeforeActionRef.current = null;
        renderSelectionOverlay(null);
      }
      return;
    }

    if (activeTool === 'text') {
      setTextInput({ x, y, value: '' });
      return;
    }

    // Capture pointer so drawing continues smoothly even if cursor slides outside bounds
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignored for environments where setPointerCapture isn't supported
    }

    isDrawingRef.current = true;
    lastPointRef.current = { x, y };
    setRedoStack([]);

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      activeElementRef.current = {
        id: `el_${Date.now()}`,
        tool: activeTool,
        points: [{ x, y }],
        color: selectedColor,
        width: strokeWidth,
      };

      // Draw initial point directly onto main canvas
      const mainCanvas = mainCanvasRef.current;
      if (mainCanvas) {
        const ctx = mainCanvas.getContext('2d');
        if (ctx) {
          ctx.save();
          if (activeTool === 'highlighter') {
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = selectedColor;
          } else if (activeTool === 'eraser') {
            ctx.fillStyle = '#ffffff';
          } else {
            ctx.fillStyle = selectedColor;
          }
          ctx.beginPath();
          const radius = activeTool === 'highlighter'
            ? strokeWidth * 1.25
            : activeTool === 'eraser'
            ? strokeWidth * 1.75
            : Math.max(1, strokeWidth / 2);
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    } else if (activeTool === 'rect' || activeTool === 'circle') {
      activeElementRef.current = {
        id: `el_${Date.now()}`,
        tool: activeTool,
        x,
        y,
        widthBox: 0,
        heightBox: 0,
        color: selectedColor,
        width: strokeWidth,
      };
    } else if (activeTool === 'line' || activeTool === 'arrow') {
      activeElementRef.current = {
        id: `el_${Date.now()}`,
        tool: activeTool,
        points: [{ x, y }, { x, y }],
        color: selectedColor,
        width: strokeWidth,
      };
    }
  };

  // 2. Pointer Move: Select drag/resize or drawing stroke
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'select') {
      // Case A: Hovering (not actively dragging)
      if (dragActionRef.current === null) {
        if (selectedElementIdRef.current) {
          const selEl = elementsRef.current.find((item) => item.id === selectedElementIdRef.current);
          if (selEl) {
            const handle = hitTestHandles(selEl, x, y);
            if (handle) {
              if (handle === 'nw' || handle === 'se') {
                setCanvasCursor('nwse-resize');
                return;
              } else if (handle === 'ne' || handle === 'sw') {
                setCanvasCursor('nesw-resize');
                return;
              } else if (handle === 'start' || handle === 'end') {
                setCanvasCursor('crosshair');
                return;
              }
            }
          }
        }

        // Check if hovering over any element
        let isOverElement = false;
        for (let i = elementsRef.current.length - 1; i >= 0; i--) {
          if (hitTestElement(elementsRef.current[i], x, y)) {
            isOverElement = true;
            break;
          }
        }
        setCanvasCursor(isOverElement ? 'move' : 'default');
        return;
      }

      // Case B: Actively dragging (move or resize)
      const targetEl = elementsRef.current.find((item) => item.id === selectedElementIdRef.current);
      if (!targetEl) return;

      const dx = x - dragStartRef.current.x;
      const dy = y - dragStartRef.current.y;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        hasMovedRef.current = true;
      }

      if (dragActionRef.current === 'move') {
        if (targetEl.x !== undefined && targetEl.y !== undefined) {
          targetEl.x += dx;
          targetEl.y += dy;
        }
        if (targetEl.points && targetEl.points.length > 0) {
          for (const p of targetEl.points) {
            p.x += dx;
            p.y += dy;
          }
        }
        dragStartRef.current = { x, y };
        renderAllElements();
        renderSelectionOverlay(targetEl.id);
        return;
      }

      if (dragActionRef.current === 'resize' && resizeHandleRef.current) {
        const h = resizeHandleRef.current;
        if (h === 'se') {
          if (targetEl.widthBox !== undefined && targetEl.heightBox !== undefined) {
            targetEl.widthBox = Math.max(15, targetEl.widthBox + dx);
            targetEl.heightBox = Math.max(15, targetEl.heightBox + dy);
          }
        } else if (h === 'sw') {
          if (targetEl.widthBox !== undefined && targetEl.heightBox !== undefined && targetEl.x !== undefined) {
            const newW = targetEl.widthBox - dx;
            if (newW >= 15) {
              targetEl.x += dx;
              targetEl.widthBox = newW;
            }
            targetEl.heightBox = Math.max(15, targetEl.heightBox + dy);
          }
        } else if (h === 'ne') {
          if (targetEl.widthBox !== undefined && targetEl.heightBox !== undefined && targetEl.y !== undefined) {
            targetEl.widthBox = Math.max(15, targetEl.widthBox + dx);
            const newH = targetEl.heightBox - dy;
            if (newH >= 15) {
              targetEl.y += dy;
              targetEl.heightBox = newH;
            }
          }
        } else if (h === 'nw') {
          if (
            targetEl.widthBox !== undefined &&
            targetEl.heightBox !== undefined &&
            targetEl.x !== undefined &&
            targetEl.y !== undefined
          ) {
            const newW = targetEl.widthBox - dx;
            if (newW >= 15) {
              targetEl.x += dx;
              targetEl.widthBox = newW;
            }
            const newH = targetEl.heightBox - dy;
            if (newH >= 15) {
              targetEl.y += dy;
              targetEl.heightBox = newH;
            }
          }
        } else if (h === 'start' && targetEl.points && targetEl.points.length >= 2) {
          targetEl.points[0].x += dx;
          targetEl.points[0].y += dy;
        } else if (h === 'end' && targetEl.points && targetEl.points.length >= 2) {
          targetEl.points[1].x += dx;
          targetEl.points[1].y += dy;
        }

        dragStartRef.current = { x, y };
        renderAllElements();
        renderSelectionOverlay(targetEl.id);
        return;
      }
      return;
    }

    if (!isDrawingRef.current || !activeElementRef.current) return;

    const current = activeElementRef.current;

    // Freehand drawing tools: Draw incrementally directly onto mainCanvas without clearing anything
    if (current.tool === 'pen' || current.tool === 'highlighter' || current.tool === 'eraser') {
      const prev = lastPointRef.current || { x, y };
      const dx = x - prev.x;
      const dy = y - prev.y;

      // Skip negligible micro-movements
      if (dx * dx + dy * dy < 1.5) return;

      const mainCanvas = mainCanvasRef.current;
      if (mainCanvas) {
        const ctx = mainCanvas.getContext('2d');
        if (ctx) {
          ctx.save();
          if (current.tool === 'highlighter') {
            ctx.globalAlpha = 0.35;
            ctx.strokeStyle = current.color;
            ctx.lineWidth = current.width * 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          } else if (current.tool === 'eraser') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = current.width * 3.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          } else {
            ctx.strokeStyle = current.color;
            ctx.lineWidth = current.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          }

          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.restore();
        }
      }

      current.points?.push({ x, y });
      lastPointRef.current = { x, y };
    }
    // Shape tools: Clear only the transparent preview overlay and draw current preview
    else if (current.tool === 'rect' || current.tool === 'circle' || current.tool === 'line' || current.tool === 'arrow') {
      const previewCanvas = previewCanvasRef.current;
      if (!previewCanvas) return;
      const pCtx = previewCanvas.getContext('2d');
      if (!pCtx) return;

      const { width, height } = lastSizeRef.current;
      pCtx.clearRect(0, 0, width, height);

      if (current.tool === 'rect' || current.tool === 'circle') {
        if (current.x !== undefined && current.y !== undefined) {
          current.widthBox = x - current.x;
          current.heightBox = y - current.y;
        }
      } else if (current.tool === 'line' || current.tool === 'arrow') {
        if (current.points && current.points.length >= 2) {
          current.points[1] = { x, y };
        }
      }

      drawElement(pCtx, current);
    }
  };

  // 3. Pointer Up / Cancel: Commit active element to elements list or complete drag/resize
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}

      if (hasMovedRef.current && snapshotBeforeActionRef.current) {
        const beforeSnapshot = snapshotBeforeActionRef.current;
        setUndoStack((prev) => [...prev, beforeSnapshot]);
        setRedoStack([]);
        setElements([...elementsRef.current]);

        if (onSave) {
          const canvas = mainCanvasRef.current;
          if (canvas) {
            onSave(canvas.toDataURL('image/png'), elementsRef.current);
          }
        }
      }

      dragActionRef.current = null;
      resizeHandleRef.current = null;
      snapshotBeforeActionRef.current = null;
      hasMovedRef.current = false;
      return;
    }

    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    const current = activeElementRef.current;
    activeElementRef.current = null;

    if (!current) return;

    // If it was a shape, clear the previewCanvas and draw the finished shape onto mainCanvas permanently
    if (current.tool === 'rect' || current.tool === 'circle' || current.tool === 'line' || current.tool === 'arrow') {
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        const pCtx = previewCanvas.getContext('2d');
        if (pCtx) {
          pCtx.clearRect(0, 0, lastSizeRef.current.width, lastSizeRef.current.height);
        }
      }

      const mainCanvas = mainCanvasRef.current;
      if (mainCanvas) {
        const mCtx = mainCanvas.getContext('2d');
        if (mCtx) {
          drawElement(mCtx, current);
        }
      }
    }

    const beforeSnapshot = cloneElements(elementsRef.current);
    setUndoStack((prev) => [...prev, beforeSnapshot]);
    setRedoStack([]);

    const updated = [...elementsRef.current, current];
    setElements(updated);
    elementsRef.current = updated;

    if (onSave) {
      const canvas = mainCanvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL('image/png'), updated);
      }
    }
  };

  // Commit text element
  const commitText = () => {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }

    const newEl: CanvasElement = {
      id: `el_text_${Date.now()}`,
      tool: 'text',
      x: textInput.x,
      y: textInput.y + 16,
      text: textInput.value.trim(),
      color: selectedColor,
      width: strokeWidth,
    };

    const beforeSnapshot = cloneElements(elementsRef.current);
    setUndoStack((prev) => [...prev, beforeSnapshot]);
    setRedoStack([]);

    const updated = [...elementsRef.current, newEl];
    setElements(updated);
    elementsRef.current = updated;

    const mainCanvas = mainCanvasRef.current;
    if (mainCanvas) {
      const ctx = mainCanvas.getContext('2d');
      if (ctx) {
        drawElement(ctx, newEl);
      }
    }

    setTextInput(null);

    if (onSave) {
      const canvas = mainCanvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL('image/png'), updated);
      }
    }
  };

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) {
      // Fallback if elements exist but undoStack is empty
      if (elementsRef.current.length > 0) {
        const beforeSnapshot = cloneElements(elementsRef.current);
        const remaining = elementsRef.current.slice(0, -1);
        setRedoStack((prev) => [...prev, beforeSnapshot]);
        setElements(remaining);
        elementsRef.current = remaining;
        setSelectedElementId(null);
        selectedElementIdRef.current = null;
        renderSelectionOverlay(null);
        renderAllElements(remaining);
        if (onSave) {
          const canvas = mainCanvasRef.current;
          if (canvas) onSave(canvas.toDataURL('image/png'), remaining);
        }
      }
      return;
    }

    const prevSnapshot = undoStack[undoStack.length - 1];
    const currentSnapshot = cloneElements(elementsRef.current);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, currentSnapshot]);

    setElements(prevSnapshot);
    elementsRef.current = prevSnapshot;
    renderAllElements(prevSnapshot);

    if (selectedElementIdRef.current && prevSnapshot.some((el) => el.id === selectedElementIdRef.current)) {
      renderSelectionOverlay(selectedElementIdRef.current, prevSnapshot);
    } else {
      setSelectedElementId(null);
      selectedElementIdRef.current = null;
      renderSelectionOverlay(null);
    }

    if (onSave) {
      const canvas = mainCanvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL('image/png'), prevSnapshot);
      }
    }
  }, [undoStack, onSave, renderAllElements, renderSelectionOverlay]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextSnapshot = redoStack[redoStack.length - 1];
    const currentSnapshot = cloneElements(elementsRef.current);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, currentSnapshot]);

    setElements(nextSnapshot);
    elementsRef.current = nextSnapshot;
    renderAllElements(nextSnapshot);

    if (selectedElementIdRef.current && nextSnapshot.some((el) => el.id === selectedElementIdRef.current)) {
      renderSelectionOverlay(selectedElementIdRef.current, nextSnapshot);
    } else {
      setSelectedElementId(null);
      selectedElementIdRef.current = null;
      renderSelectionOverlay(null);
    }

    if (onSave) {
      const canvas = mainCanvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL('image/png'), nextSnapshot);
      }
    }
  }, [redoStack, onSave, renderAllElements, renderSelectionOverlay]);

  const handleClear = () => {
    if (elementsRef.current.length === 0) return;
    if (window.confirm('Clear the entire whiteboard canvas?')) {
      const currentSnapshot = cloneElements(elementsRef.current);
      setUndoStack((prev) => [...prev, currentSnapshot]);
      setRedoStack([]);
      setElements([]);
      elementsRef.current = [];
      setSelectedElementId(null);
      selectedElementIdRef.current = null;
      renderSelectionOverlay(null);
      renderAllElements([]);

      if (onSave) {
        const canvas = mainCanvasRef.current;
        if (canvas) {
          onSave(canvas.toDataURL('image/png'), []);
        }
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const { width, height } = lastSizeRef.current;
        const maxDim = Math.min(width || 600, height || 400) * 0.5;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const scale = Math.min(maxDim / w, maxDim / h);
          w *= scale;
          h *= scale;
        }

        const startX = ((width || 600) - w) / 2;
        const startY = ((height || 400) - h) / 2;

        const imgEl: CanvasElement = {
          id: `el_img_${Date.now()}`,
          tool: 'rect',
          image: img,
          imageDataUrl: event.target?.result as string,
          x: startX,
          y: startY,
          widthBox: w,
          heightBox: h,
          color: '#000000',
          width: 1,
        };

        const beforeSnapshot = cloneElements(elementsRef.current);
        setUndoStack((prev) => [...prev, beforeSnapshot]);
        setRedoStack([]);

        const updated = [...elementsRef.current, imgEl];
        setElements(updated);
        elementsRef.current = updated;

        const mainCanvas = mainCanvasRef.current;
        if (mainCanvas) {
          const ctx = mainCanvas.getContext('2d');
          if (ctx) {
            drawElement(ctx, imgEl);
          }
        }

        setActiveTool('select');
        setSelectedElementId(imgEl.id);
        selectedElementIdRef.current = imgEl.id;
        renderSelectionOverlay(imgEl.id, updated);

        if (onSave) {
          const canvas = mainCanvasRef.current;
          if (canvas) {
            onSave(canvas.toDataURL('image/png'), updated);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Keyboard shortcuts (Delete, Backspace, Escape, V for select, P for pen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        textInput !== null
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIdRef.current) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.key === 'Escape') {
        if (selectedElementIdRef.current) {
          setSelectedElementId(null);
          selectedElementIdRef.current = null;
          renderSelectionOverlay(null);
        }
      } else if (e.key === 'v' || e.key === 'V') {
        handleSelectTool('select');
      } else if (e.key === 'p' || e.key === 'P') {
        handleSelectTool('pen');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [textInput, handleDeleteSelected, renderSelectionOverlay]);

  const handleExport = () => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    const dataUrl = mainCanvas.toDataURL('image/png');

    if (onSave) {
      onSave(dataUrl, elementsRef.current);
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `SmartBoard_${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col h-full w-full bg-white select-none overflow-hidden touch-none ${className || ''}`}
    >
      {/* Top Floating Whiteboard Toolbar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-lg transition-all flex-wrap max-w-[95%]">
        {/* Drawing & Selection Tools */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5">
          <button
            onClick={() => handleSelectTool('select')}
            title="Select & Move (V)"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'select' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MousePointer2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSelectTool('pen')}
            title="Pen Tool (P)"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'pen' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Pen className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSelectTool('highlighter')}
            title="Highlighter Tool"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'highlighter' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSelectTool('eraser')}
            title="Eraser Tool"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'eraser' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eraser className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSelectTool('text')}
            title="Text Tool"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'text' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* Shapes */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5">
          <button
            onClick={() => handleSelectTool('rect')}
            title="Rectangle"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'rect' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSelectTool('circle')}
            title="Circle"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'circle' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSelectTool('line')}
            title="Line"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'line' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSelectTool('arrow')}
            title="Arrow"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'arrow' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MoveRight className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              title={`Select color: ${c}`}
              className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                selectedColor === c ? 'scale-125 ring-2 ring-[#0091ff] ring-offset-1 border-slate-400' : 'border-slate-300 hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5">
          {STROKE_WIDTHS.map((s) => (
            <button
              key={s.label}
              onClick={() => setStrokeWidth(s.width)}
              title={`Line width: ${s.width}px`}
              className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                strokeWidth === s.width ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Actions: Delete Selected, Undo, Redo, Image, Clear, Export, Fullscreen */}
        <div className="flex items-center gap-1">
          {selectedElementId && (
            <button
              onClick={handleDeleteSelected}
              title="Delete Selected Object (Del / Backspace)"
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 bg-rose-50/70 border border-rose-200 transition-all cursor-pointer animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0 && elements.length === 0}
            title="Undo"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Insert Image"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            onClick={handleClear}
            title="Clear Whiteboard"
            className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleExport}
            title="Download Canvas PNG"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Canvas Layer Container */}
      <div className="relative flex-1 w-full h-full">
        {/* Layer 1: Base Persistent Canvas (Solid white background, committed strokes) */}
        <canvas
          ref={mainCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ cursor: canvasCursor }}
          className="absolute inset-0 w-full h-full touch-none"
        />

        {/* Layer 2: Shape & Tool Active Preview Canvas (Transparent, clears only active preview) */}
        <canvas
          ref={previewCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none touch-none"
        />
      </div>

      {/* Inline Text Input overlay when typing on board */}
      {textInput && (
        <div
          style={{ position: 'absolute', left: textInput.x, top: textInput.y }}
          className="z-30 flex items-center gap-1 bg-white p-1 rounded-lg border border-blue-400 shadow-md"
        >
          <input
            autoFocus
            type="text"
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitText();
              if (e.key === 'Escape') setTextInput(null);
            }}
            placeholder="Type note & press Enter"
            className="text-sm px-2 py-0.5 outline-none font-bold text-slate-800"
          />
          <button
            onClick={commitText}
            className="px-2 py-0.5 bg-[#214d7d] text-white text-xs font-bold rounded"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
});

WhiteboardCanvas.displayName = 'WhiteboardCanvas';
