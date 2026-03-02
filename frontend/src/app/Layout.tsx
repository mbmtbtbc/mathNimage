import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CanvasViewport from "../components/CanvasViewport";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, position: "relative" }}>
        <CanvasViewport />
        <Outlet />
      </div>
    </div>
  );
}