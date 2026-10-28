import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles, Move } from 'lucide-react';
import { GraphData } from '../types.ts';

interface GraphVisualizerProps {
  graphData: GraphData;
  title?: string;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ graphData, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport window in math coordinate space
  const [rangeX, setRangeX] = useState<[number, number]>([-8, 8]);
  const [rangeY, setRangeY] = useState<[number, number]>([-6, 6]);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; rx: [number, number]; ry: [number, number] }>({
    clientX: 0,
    clientY: 0,
    rx: [-8, 8],
    ry: [-6, 6],
  });

  // Custom expression input if student wants to experiment
  const [activeExpression, setActiveExpression] = useState(graphData.expression || 'x^2 - 4');

  useEffect(() => {
    if (graphData.expression) {
      setActiveExpression(graphData.expression);
      if (graphData.domain) {
        setRangeX(graphData.domain);
        const span = Math.abs(graphData.domain[1] - graphData.domain[0]);
        setRangeY([-span * 0.4, span * 0.6]);
      }
    }
  }, [graphData]);

  // Safe expression evaluator for function f(x)
  const evaluateF = useCallback(
    (x: number): number | null => {
      try {
        let expr = activeExpression
          .replace(/\^/g, '**')
          .replace(/\bsin\b/g, 'Math.sin')
          .replace(/\bcos\b/g, 'Math.cos')
          .replace(/\btan\b/g, 'Math.tan')
          .replace(/\bsqrt\b/g, 'Math.sqrt')
          .replace(/\babs\b/g, 'Math.abs')
          .replace(/\bln\b/g, 'Math.log')
          .replace(/\blog\b/g, 'Math.log10')
          .replace(/\bpi\b/gi, 'Math.PI')
          .replace(/\be\b/g, 'Math.E');

        // Handle implicit multiplication like 2x, 5x, (x-1)(x+2)
        expr = expr.replace(/(\d)\s*([a-zA-Z(])/g, '$1 * $2');
        expr = expr.replace(/([)])\s*([(x])/g, '$1 * $2');

        // Create restricted evaluation function
        const fn = new Function('x', `"use strict"; return (${expr});`);
        const result = fn(x);
        if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
          return null;
        }
        return result;
      } catch {
        return null;
      }
    },
    [activeExpression]
  );

  // Draw coordinate plane and graph
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const [minX, maxX] = rangeX;
    const [minY, maxY] = rangeY;

    // Coordinate conversion functions
    const toCanvasX = (mathX: number) => ((mathX - minX) / (maxX - minX)) * width;
    const toCanvasY = (mathY: number) => height - ((mathY - minY) / (maxY - minY)) * height;
    const toMathX = (cCanvasX: number) => minX + (cCanvasX / width) * (maxX - minX);
    const toMathY = (cCanvasY: number) => minY + ((height - cCanvasY) / height) * (maxY - minY);

    // Clear background
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, width, height);

    // Compute grid step
    const spanX = maxX - minX;
    let step = 1;
    if (spanX > 40) step = 10;
    else if (spanX > 20) step = 5;
    else if (spanX > 8) step = 2;
    else if (spanX <= 4) step = 0.5;

    // Grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';

    const firstGridX = Math.floor(minX / step) * step;
    for (let gx = firstGridX; gx <= maxX; gx += step) {
      const cx = toCanvasX(gx);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      if (Math.abs(gx) > 0.001) {
        ctx.fillText(gx.toFixed(step < 1 ? 1 : 0), cx + 4, toCanvasY(0) + 12);
      }
    }

    const firstGridY = Math.floor(minY / step) * step;
    for (let gy = firstGridY; gy <= maxY; gy += step) {
      const cy = toCanvasY(gy);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      if (Math.abs(gy) > 0.001) {
        ctx.fillText(gy.toFixed(step < 1 ? 1 : 0), toCanvasX(0) + 6, cy - 4);
      }
    }

    // Axes lines
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#475569';

    // X Axis
    const originY = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    const originX = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('x', width - 14, originY - 6);
    ctx.fillText('y', originX + 8, 14);
    ctx.fillText('0', originX - 12, originY + 12);

    // Plot Curve f(x)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#818cf8'; // Indigo-400
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 8;

    let isDrawing = false;
    const pixelStep = 2;

    for (let px = 0; px <= width; px += pixelStep) {
      const mathX = toMathX(px);
      const mathY = evaluateF(mathX);

      if (mathY !== null && !isNaN(mathY) && isFinite(mathY)) {
        const py = toCanvasY(mathY);
        // Avoid crazy asymptotes jumping across screen
        if (py >= -height * 2 && py <= height * 3) {
          if (!isDrawing) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            isDrawing = true;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          if (isDrawing) {
            ctx.stroke();
            isDrawing = false;
          }
        }
      } else {
        if (isDrawing) {
          ctx.stroke();
          isDrawing = false;
        }
      }
    }
    if (isDrawing) {
      ctx.stroke();
    }
    ctx.restore();

    // Plot Key Points (Roots, Vertex, Intercepts)
    if (graphData.keyPoints && graphData.keyPoints.length > 0) {
      graphData.keyPoints.forEach((pt) => {
        const cx = toCanvasX(pt.x);
        const cy = toCanvasY(pt.y);

        if (cx >= -20 && cx <= width + 20 && cy >= -20 && cy <= height + 20) {
          // Glow outer
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
          ctx.fill();

          // Core point
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#f43f5e';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Label
          ctx.fillStyle = '#fecdd3';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText(
            `${pt.label} (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`,
            cx + 8,
            cy - 6
          );
        }
      });
    }

    // Hover Crosshair
    if (hoverCoord) {
      const hx = toCanvasX(hoverCoord.x);
      const hy = toCanvasY(hoverCoord.y);

      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx, height);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(width, hy);
      ctx.stroke();

      // Dot on hover point
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.restore();
    }
  }, [rangeX, rangeY, hoverCoord, activeExpression, evaluateF, graphData.keyPoints]);

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 320 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `320px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Zoom controls
  const handleZoom = (factor: number) => {
    setRangeX(([min, max]) => {
      const mid = (min + max) / 2;
      const span = (max - min) * factor;
      return [mid - span / 2, mid + span / 2];
    });
    setRangeY(([min, max]) => {
      const mid = (min + max) / 2;
      const span = (max - min) * factor;
      return [mid - span / 2, mid + span / 2];
    });
  };

  const handleReset = () => {
    if (graphData.domain) {
      setRangeX(graphData.domain);
      const span = Math.abs(graphData.domain[1] - graphData.domain[0]);
      setRangeY([-span * 0.4, span * 0.6]);
    } else {
      setRangeX([-8, 8]);
      setRangeY([-6, 6]);
    }
  };

  // Mouse move and hover calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseCanvasX = e.clientX - rect.left;
    const mouseCanvasY = e.clientY - rect.top;

    const [minX, maxX] = rangeX;
    const [minY, maxY] = rangeY;
    const mathX = minX + (mouseCanvasX / rect.width) * (maxX - minX);

    if (isDragging) {
      const dx = ((e.clientX - dragStartRef.current.clientX) / rect.width) * (maxX - minX);
      const dy = ((e.clientY - dragStartRef.current.clientY) / rect.height) * (maxY - minY);
      setRangeX([dragStartRef.current.rx[0] - dx, dragStartRef.current.rx[1] - dx]);
      setRangeY([dragStartRef.current.ry[0] + dy, dragStartRef.current.ry[1] + dy]);
      return;
    }

    // Inspect curve point
    const curveY = evaluateF(mathX);
    if (curveY !== null) {
      setHoverCoord({ x: mathX, y: curveY });
    } else {
      const mathY = minY + ((rect.height - mouseCanvasY) / rect.height) * (maxY - minY);
      setHoverCoord({ x: mathX, y: mathY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      rx: [...rangeX],
      ry: [...rangeY],
    };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" ref={containerRef}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">
            {title || 'Interactive Graphical Visualization'}
          </span>
          <span className="text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-mono">
            y = {activeExpression}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleZoom(0.75)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.33)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-[320px] bg-slate-950 overflow-hidden cursor-crosshair select-none">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setHoverCoord(null);
            setIsDragging(false);
          }}
          className="w-full h-full block"
        />

        {/* Floating coordinate tooltip */}
        {hoverCoord && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg shadow-lg backdrop-blur-md pointer-events-none text-xs font-mono text-slate-200 flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>x: <strong className="text-white">{hoverCoord.x.toFixed(2)}</strong></span>
            <span>y: <strong className="text-indigo-300">{hoverCoord.y.toFixed(2)}</strong></span>
          </div>
        )}

        <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] text-slate-500 flex items-center gap-1.5 bg-slate-950/60 px-2 py-0.5 rounded">
          <Move className="w-3 h-3" /> Drag to pan • Hover to trace
        </div>
      </div>

      {/* Function expression editor footer */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <span className="text-slate-500 font-mono text-[11px]">f(x) =</span>
          <input
            type="text"
            value={activeExpression}
            onChange={(e) => setActiveExpression(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono outline-none"
            placeholder="e.g. x^2 - 4*x + 3"
          />
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Supports polynomials, sin, cos, sqrt, abs
        </span>
      </div>
    </div>
  );
};
