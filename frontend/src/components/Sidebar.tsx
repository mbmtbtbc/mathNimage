import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: 220,
        background: "#111",
        color: "white",
        padding: 20,
      }}
    >
      <h3>Math Visual</h3>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link to="/">Home</Link>
        <Link to="/generate">Generate</Link>
        <Link to="/playground">Playground</Link>
        <Link to="/fractals">Fractals</Link>
        <Link to="/audio">Audio Lab</Link>
        <Link to="/decode">Decode</Link>
      </nav>
    </div>
  );
}