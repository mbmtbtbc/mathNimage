Design Principles----------------
1. Single Responsibility
Each module does ONE thing.
No cross-logic mixing.

2. GPU First
All visuals must ultimately be computed in shaders.
Not CPU pixel loops but Fragment shaders
Rule: If it affects pixels → it belongs in a shader.

3. Stateless Rendering
Renderer should not know UI logic.

4. Deterministic Outputs
Same input = same image.
Needed for sharing links, reproducibility, debugging

5. Extensibility Over Cleverness
Future feature addition must NOT require rewriting engines.



Modules--------------------
MODULE 1 — UI Layer
Responsibility-navigation, controls, user input, state management
NEVER DOES-math evaluation, rendering logic, shader code

MODULE 2 — Shader Engine
Responsibility-compile shaders, manage uniforms, render frames, animation loop
Inputs-equationCode, parameters, time, resolution
Outputs-rendered frame

MODULE 3 — Equation Engine
Responsibility-parse equations, validate syntax, convert to GLSL-compatible math
Output-GLSL snippet, metadata (variables used)

MODULE 4 — Style Engine
Responsibility-Post processing ONLY.
Receives rendered texture and applies filters (sketch, watercolor, terrain). Does NOT regenerate images.

MODULE 5 — Fractal Engine
Specialized renderer mode.
Owns complex plane math, zoom precision, iteration logic
Uses Shader Engine internally.

MODULE 6 — Audio Engine
Responsibilities-FFT analysis, parameter modulation, equation-to-audio synthesis
Outputs parameter updates only.

MODULE 7 — Image Decoder (Backend)
Responsibilities-analyze uploaded images, suggest equation families
Does NOT render images.





Data Flow Contracts(Defines interfaces between modules.)-----------------
Equation → Shader Contract
type ShaderProgram = {
  glslCode: string
  uniforms: string[]
}
Renderer Input
type RenderParams = {
  time: number
  resolution: [number, number]
  parameters: Record<string, number>
}
Style Contract
type StylePass = {
  name: string
  shader: string
}

This prevents future coupling problems.



Navigation Architecture-------------------------

Define routes:

/               → Home
/generate       → NLP generation
/playground     → Equation playground
/fractals       → Fractal explorer
/audio          → Audio lab
/decode         → Image analyzer
/gallery        → Shared outputs

Each route is an independent feature module.



State Management Plan--------------------------------
Use: Zustand
Global state ONLY for:

currentEquation
parameters
style
animationState
audioState

Renderer reads ONLY from this store.

Rule:
UI never imports shaders directly.




Master Dataflow Pipeline---------------------------------
User Interaction
        ↓
Input Interpreter
        ↓
Equation Engine
        ↓
Parameter System
        ↓
Shader Engine (GPU)
        ↓
Style Engine (Post Processing)
        ↓
Canvas Output
        ↓
Export / Share


1️⃣ User Interaction Layer

Source of all data.

Examples:
typing equation
NLP prompt
uploading image
playing audio
zooming fractal

Output:
UserIntent

Example:

{
  "mode": "playground",
  "equation": "sin(x^2+y^2)",
  "style": "sketch"
}

2️⃣ Input Interpreter
This normalizes different inputs into ONE format.
Why?
Because inputs come from:
NLP text
equations
image decoder
audio analysis

We convert ALL of them into:
VisualProgram
Unified Format

type VisualProgram = {
  equation: string
  parameters: Record<string, number>
  style: string
  animation?: boolean
}

This is the central contract of your system.
Everything downstream only understands this.


3️⃣ Equation Engine
Receives:
VisualProgram.equation

Tasks:
validate math
parse expression
convert → GLSL

Output:
ShaderProgram

Example:
float value = sin(x*x + y*y);

4️⃣ Parameter System
Combines parameters from multiple sources:
sliders
audio FFT
animation timer
fractal zoom

Produces:
UniformState

Example:

{
  "time": 2.31,
  "zoom": 4.2,
  "frequency": 8.0
}

5️⃣ Shader Engine (GPU CORE)

Receives:
ShaderProgram + UniformState

GPU executes:
fragment shader per pixel

Outputs:
Rendered Texture

This step runs ~60 times/sec.

6️⃣ Style Engine (Post Processing)

Input:
Rendered Texture

Applies shader passes:
Sketch filter
Watercolor
Terrain shading

Output:
Final Frame

7️⃣ Canvas Output
Displayed to user.
Optional actions-save image, share link, animate

🧩 SPECIALIZED PIPELINES--------------------------------


🎨 A. NLP Generation Pipeline
Text Prompt
   ↓
Prompt Interpreter
   ↓
VisualProgram
   ↓
MASTER PIPELINE


🖼 B. Image Decode Pipeline (Backend)
Image Upload
   ↓
Backend Analysis
   ↓
Suggested Equations
   ↓
VisualProgram
   ↓
MASTER PIPELINE

Backend never renders images.


🔊 C. Audio Pipeline
Audio Input
   ↓
FFT Analysis
   ↓
Parameter Updates
   ↓
UniformState
   ↓
Shader Engine

Audio modifies parameters only.


🔬 D. Fractal Pipeline
Zoom Input
   ↓
Complex Plane Mapper
   ↓
Uniform Updates
   ↓
Fractal Shader

Same renderer, different shader mode.


🧱 FINAL DATAFLOW DIAGRAM 
Input Sources
 ├ Text
 ├ Equation
 ├ Image
 ├ Audio
 └ UI Controls
        ↓
   Input Interpreter
        ↓
    VisualProgram
        ↓
   Equation Engine
        ↓
   Shader Engine (GPU)
        ↓
   Style Engine
        ↓
     Canvas