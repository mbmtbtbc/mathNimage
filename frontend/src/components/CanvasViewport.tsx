import { useEffect, useRef } from "react";
import { Renderer } from "../engines/renderer/Renderer";

export default function CanvasViewport() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    Renderer.init(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
      }}
    />
  );
}