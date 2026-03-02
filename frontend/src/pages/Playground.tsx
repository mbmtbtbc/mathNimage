import { useState, useEffect } from "react";
import { useVisualProgramStore } from "../store/visualProgramStore";
import { Renderer } from "../engines/renderer/Renderer";

export default function Playground() {
  const setProgram = useVisualProgramStore((s) => s.setProgram);
  const program = useVisualProgramStore((s) => s.program);

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

      {program &&
  Object.entries(program.parameters).map(
    ([name, value]) => (
      <div key={name}>
        <label>{name}</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);

            const updated = {
              ...program.parameters,
              [name]: v,
            };

            setProgram({
              ...program,
              parameters: updated,
            });
          }}
        />
      </div>
    )
  )}

  <select
  onChange={(e) =>
    program &&
    setProgram({
      ...program,
      style: { name: e.target.value },
    })
  }
>
  <option value="default">Default</option>
  <option value="neon">Neon</option>
  <option value="terrain">Terrain</option>
  <option value="contour">Contour</option>
</select>

<select
  onChange={(e) => Renderer.setPostFX(e.target.value)}
>
  <option value="none">None</option>
  <option value="bloom">Bloom</option>
  <option value="sketch">Sketch</option>
  <option value="watercolor">Watercolor</option>
</select>

      <p style={{ opacity: 0.7 }}>
        Variables: x, y, t
      </p>
    </div>
  );
}