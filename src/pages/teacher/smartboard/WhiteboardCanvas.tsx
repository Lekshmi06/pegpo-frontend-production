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
} from 'lucide-react';

export type ToolType = 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'line' | 'arrow';

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
  const [redoStack, setRedoStack] = useState<CanvasElement[][]>([]);

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

    if ((el.tool === 'pen' || el.tool === 'highlighter' || el.tool === 'eraser') && el.points && el.points.length > 0) {
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
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const headLength = Math.max(12, el.width * 3);

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (el.tool === 'text' && el.text && el.x !== undefined && el.y !== undefined) {
      ctx.font = `bold ${Math.max(16, el.width * 4)}px sans-serif`;
      ctx.fillText(el.text, el.x, el.y);
    } else if (el.image && el.x !== undefined && el.y !== undefined && el.widthBox && el.heightBox) {
      try {
        if (el.image instanceof HTMLImageElement && el.image.complete && el.image.naturalWidth > 0) {
          ctx.drawImage(el.image, el.x, el.y, el.widthBox, el.heightBox);
        }
      } catch (err) {
        console.warn('Failed to draw image element:', err);
      }
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
  }, [renderAllElements]);

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

  // 1. Pointer Down: Start stroke or shape
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // If text input is open, commit first
    if (textInput) {
      commitText();
      return;
    }

    const { x, y } = getCanvasCoords(e);

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

  // 2. Pointer Move: Incremental drawing for pen/eraser/highlighter, preview overlay for shapes
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !activeElementRef.current) return;

    const { x, y } = getCanvasCoords(e);
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

  // 3. Pointer Up / Cancel: Commit active element to elements list
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
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

    setElements((prev) => {
      const updated = [...prev, current];
      elementsRef.current = updated;
      return updated;
    });
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

    const mainCanvas = mainCanvasRef.current;
    if (mainCanvas) {
      const ctx = mainCanvas.getContext('2d');
      if (ctx) {
        drawElement(ctx, newEl);
      }
    }

    setElements((prev) => {
      const updated = [...prev, newEl];
      elementsRef.current = updated;
      return updated;
    });
    setTextInput(null);
  };

  const handleUndo = () => {
    if (elements.length === 0) return;
    const last = elements[elements.length - 1];
    const newElements = elements.slice(0, elements.length - 1);
    setRedoStack((prev) => [[last], ...prev]);
    setElements(newElements);
    elementsRef.current = newElements;
    renderAllElements(newElements);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    const newElements = [...elements, ...next];
    setRedoStack((prev) => prev.slice(1));
    setElements(newElements);
    elementsRef.current = newElements;
    renderAllElements(newElements);
  };

  const handleClear = () => {
    if (elements.length === 0) return;
    if (window.confirm('Clear the entire whiteboard canvas?')) {
      setRedoStack((prev) => [elements, ...prev]);
      setElements([]);
      elementsRef.current = [];
      renderAllElements([]);
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

        const mainCanvas = mainCanvasRef.current;
        if (mainCanvas) {
          const ctx = mainCanvas.getContext('2d');
          if (ctx) {
            drawElement(ctx, imgEl);
          }
        }

        setElements((prev) => {
          const updated = [...prev, imgEl];
          elementsRef.current = updated;
          return updated;
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5">
          <button
            onClick={() => setActiveTool('pen')}
            title="Pen Tool"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'pen' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Pen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('highlighter')}
            title="Highlighter Tool"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'highlighter' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('eraser')}
            title="Eraser Tool"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'eraser' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eraser className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('text')}
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
            onClick={() => setActiveTool('rect')}
            title="Rectangle"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'rect' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('circle')}
            title="Circle"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'circle' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('line')}
            title="Line"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTool === 'line' ? 'bg-[#214d7d] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('arrow')}
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

        {/* Actions: Undo, Redo, Image, Clear, Export, Fullscreen */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={elements.length === 0}
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
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
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
