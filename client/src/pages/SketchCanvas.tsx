import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, X, Paintbrush, Trash2, Undo2, Redo2, Timer, Image } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { StatusBar } from "@/components/StatusBar";
import { HomeIndicator } from "@/components/HomeIndicator";
import { getStoredPrompt, type Prompt } from "@/lib/prompts";
import { apiRequest } from "@/lib/queryClient";

const COLORS = [
  { value: "#ffffff", border: "#9FA9BB" },
  { value: "#17171c", border: "#534d6a" },
  { value: "#ffd53d", border: "#ffd53d" },
  { value: "#9cc8fd", border: "#9cc8fd" },
  { value: "#a6f687", border: "#a6f687" },
  { value: "#fd9c9c", border: "#fd9c9c" },
];

const BRUSH_WIDTH = 4;
const TOTAL_SECONDS = 180;
const CANVAS_W = 327;
const CANVAS_H = 342;

interface Point { x: number; y: number }
interface Stroke { color: string; width: number; points: Point[] }

export const SketchCanvas = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [selectedColor, setSelectedColor] = useState("#17171c");
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [timerActive, setTimerActive] = useState(true);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isDrawing = useRef(false);
  const currentPoints = useRef<Point[]>([]);
  const strokesRef = useRef<Stroke[]>([]);

  // Keep ref in sync
  strokesRef.current = strokes;

  useEffect(() => {
    setPrompt(getStoredPrompt());
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!timerActive) return;
    if (secondsLeft <= 0) {
      finishDrawing();
      return;
    }
    const id = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, timerActive]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Redraw all strokes on canvas
  const redrawAll = useCallback((strokeList: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokeList) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    redrawAll(strokes);
  }, [strokes, redrawAll]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawing.current = true;
    currentPoints.current = [getPos(e)];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getPos(e);
    currentPoints.current.push(pos);
    // Draw the latest segment directly for smooth live drawing
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pts = currentPoints.current;
    if (pts.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = BRUSH_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const pts = [...currentPoints.current];
    currentPoints.current = [];
    if (pts.length === 0) return;
    // Single dot
    if (pts.length === 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, BRUSH_WIDTH / 2, 0, Math.PI * 2);
        ctx.fillStyle = selectedColor;
        ctx.fill();
      }
    }
    const newStroke: Stroke = { color: selectedColor, width: BRUSH_WIDTH, points: pts };
    setStrokes(prev => [...prev, newStroke]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    setStrokes(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack(r => [...r, last]);
      return prev.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setStrokes(s => [...s, last]);
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStack([]);
  };

  const finishDrawing = async () => {
    setTimerActive(false);
    setIsSaving(true);
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
    const elapsed = TOTAL_SECONDS - secondsLeft;
    const strokeCount = strokesRef.current.length;
    const promptWord = prompt?.word ?? "";

    // Clean up old cached accuracy scores before writing the new sketch id
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sketchScore_")) {
        localStorage.removeItem(key);
      }
    }

    try {
      const res = await apiRequest("POST", "/api/sketches", {
        dataUrl,
        prompt: promptWord,
        strokeCount,
        timeElapsed: elapsed,
      });
      const sketch = await res.json();
      localStorage.setItem("lastSketchId", sketch.id);
    } catch (err) {
      console.error("Failed to save sketch to server, falling back to localStorage:", err);
      localStorage.setItem("sketchDataUrl", dataUrl);
      localStorage.setItem("sketchStats", JSON.stringify({ strokeCount, timeElapsed: elapsed }));
    }

    setIsSaving(false);
    setLocation("/game/sketch/recap");
  };

  return (
    <MobileShell>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/home")}
          data-testid="button-back"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <ArrowLeft size={20} color="#282145" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-2">
          <Paintbrush size={22} color="#282145" strokeWidth={2} />
          <span
            className="text-[20px] font-bold text-black"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Quick Sketch
          </span>
        </div>

        <button
          onClick={() => setLocation("/home")}
          data-testid="button-close"
          className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
        >
          <X size={20} color="#282145" strokeWidth={2.5} />
        </button>
      </div>

      {/* Timer */}
      <div className="flex justify-center mt-1 flex-shrink-0">
        <div className="flex items-center gap-3 bg-[#17171c] rounded-[16px] px-3 py-1">
          <Timer size={28} color="#f6f7f8" strokeWidth={2} />
          <span
            className="text-[#f6f7f8] text-[28px] font-bold uppercase tracking-wide"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            data-testid="text-timer"
          >
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Prompt label */}
      {prompt && (
        <div className="flex justify-center mt-2 flex-shrink-0">
          <div
            className="flex items-center gap-2 px-4 py-[6px] rounded-full"
            style={{ background: "#f0f1fd", border: "1.5px solid #8174e0" }}
          >
            <span
              className="text-[#282145] text-[13px] font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Draw:
            </span>
            <span
              className="text-[#282145] text-[14px] font-bold"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              data-testid="text-prompt-label"
            >
              {prompt.word}
            </span>
          </div>
        </div>
      )}

      {/* Drawing Canvas */}
      <div className="flex-shrink-0 px-4 mt-3" style={{ height: 376 }}>
        <div
          className="rounded-[32px] bg-white overflow-hidden w-full h-full"
          style={{
            border: "1px solid rgba(171,173,174,0.1)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            data-testid="canvas-sketch"
            className="w-full h-full touch-none cursor-crosshair"
            style={{ display: "block" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
      </div>

      {/* Tools row */}
      <div className="flex items-center justify-center gap-8 mt-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            data-testid="button-image"
            className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
          >
            <Image size={22} color="#282145" strokeWidth={2} />
          </button>
          <button
            onClick={handleClear}
            data-testid="button-clear"
            className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB]"
          >
            <Trash2 size={22} color="#282145" strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            data-testid="button-undo"
            className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB] disabled:opacity-40"
          >
            <Undo2 size={22} color="#282145" strokeWidth={2} />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            data-testid="button-redo"
            className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-white border border-[#9FA9BB] disabled:opacity-40"
          >
            <Redo2 size={22} color="#282145" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Color palette */}
      <div className="flex items-center justify-between px-4 mt-3 flex-shrink-0">
        {COLORS.map((c) => {
          const isSelected = selectedColor === c.value;
          return (
            <button
              key={c.value}
              data-testid={`color-swatch-${c.value.replace("#", "")}`}
              onClick={() => setSelectedColor(c.value)}
              className="rounded-full flex-shrink-0 transition-transform active:scale-90"
              style={{
                width: 42,
                height: 42,
                background: c.value,
                border: isSelected
                  ? `4px solid ${c.border}`
                  : `2px solid ${c.value === "#ffffff" ? "#e0e0e0" : c.value}`,
                boxShadow: isSelected ? `0 0 0 2px ${c.border}` : "none",
              }}
            />
          );
        })}
      </div>

      {/* Done button */}
      <div className="flex justify-center mt-3 flex-shrink-0">
        <motion.button
          onClick={finishDrawing}
          disabled={isSaving}
          data-testid="button-done"
          className="bg-[#282145] h-[42px] w-[130px] rounded-[30px] flex items-center justify-center disabled:opacity-60"
          style={{ boxShadow: "0px 4px 0px black" }}
          whileTap={{ scale: 0.96 }}
        >
          <span
            className="text-white text-[20px] font-bold tracking-[0.15px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {isSaving ? "Saving…" : "Done"}
          </span>
        </motion.button>
      </div>

      <HomeIndicator />
    </MobileShell>
  );
};
