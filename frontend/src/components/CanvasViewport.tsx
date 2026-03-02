export default function CanvasViewport() {
  return (
    <div
      id="canvas-root"
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
        zIndex: 0,
      }}
    />
  );
}