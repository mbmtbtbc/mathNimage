import { useEffect } from "react";
import { Renderer } from "../engines/renderer/Renderer";

export default function Fractals() {
  useEffect(() => {
    Renderer.setFractalMode();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        padding: 40,
        color: "white",
      }}
    >
      <h2>Fractal Explorer</h2>
      <p>Scroll to zoom (coming next).</p>
    </div>
  );
}