import { useVisualProgramStore } from "../store/visualProgramStore";
export default function Home() {
  const setProgram = useVisualProgramStore((s) => s.setProgram);

  return (
    <div style={{ position: "relative", zIndex: 1, padding: 40 }}>
      <h1>Math Visual Engine</h1>

      <button
        onClick={() =>
          setProgram({
            id: "wave",
            mode: "equation",
            equation: {
              expression: "sin(x*20 + t)",
              variables: [],
            },
            parameters: {},
            style: { name: "default" },
          })
        }
      >
        Wave
      </button>

      <button
        onClick={() =>
          setProgram({
            id: "grid",
            mode: "equation",
            equation: {
              expression:
                "sin(x*10 + t)*cos(y*10)",
              variables: [],
            },
            parameters: {},
            style: { name: "default" },
          })
        }
      >
        Grid
      </button>
    </div>
  );
}