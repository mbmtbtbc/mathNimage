import { useState, useEffect } from "react";
import { useVisualProgramStore } from "../store/visualProgramStore";

export default function Playground() {
  const setProgram = useVisualProgramStore((s) => s.setProgram);

  const [equation, setEquation] = useState("sin(x*10+t)");
  const [debouncedEquation, setDebouncedEquation] =
    useState(equation);

  /* ⭐ debounce typing */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEquation(equation);
    }, 300);

    return () => clearTimeout(timer);
  }, [equation]);

  /* ⭐ update GPU only after pause */
  useEffect(() => {
    setProgram({
      id: "playground",
      mode: "equation",
      equation: {
        expression: debouncedEquation,
        variables: [],
      },
      parameters: {},
      style: { name: "default" },
    });
  }, [debouncedEquation, setProgram]);

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        padding: 40,
        color: "white",
      }}
    >
      <h2>Equation Playground</h2>

      <input
        value={equation}
        onChange={(e) => setEquation(e.target.value)}
        style={{
          width: 400,
          padding: 10,
          fontSize: 18,
          background: "#111",
          color: "white",
          border: "1px solid #444",
        }}
      />

      <p style={{ opacity: 0.7 }}>
        Variables: x, y, t
      </p>
    </div>
  );
}