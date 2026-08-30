"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { IconPen } from "./icons";

export interface SignaturePadHandle {
  isEmpty: () => boolean;
  toDataURL: () => string;
  clear: () => void;
}

const SignaturePad = forwardRef<
  SignaturePadHandle,
  { heightClass?: string; onChange?: () => void }
>(function SignaturePad({ heightClass = "h-45", onChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const [hasStroke, setHasStroke] = useState(false);

    useImperativeHandle(ref, () => ({
      isEmpty: () => !hasStroke,
      toDataURL: () => canvasRef.current!.toDataURL("image/png"),
      clear: () => {
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
        setHasStroke(false);
        onChange?.();
      },
    }));

    const pos = (e: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    };

    const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
      drawing.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      const ctx = canvasRef.current!.getContext("2d")!;
      const { x, y } = pos(e);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#2b2926";
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      const ctx = canvasRef.current!.getContext("2d")!;
      const { x, y } = pos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasStroke(true);
      onChange?.();
    };

    const onPointerUp = () => {
      drawing.current = false;
    };

    return (
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={700}
          height={360}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={`w-full touch-none rounded-xl border-2 border-dashed border-stone-300 bg-white ${heightClass}`}
        />
        {!hasStroke && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-stone-400">
            <IconPen width={26} height={26} />
            <span className="text-[13px]">こちらに指またはペンでご署名ください</span>
          </div>
        )}
      </div>
    );
  },
);

export default SignaturePad;
