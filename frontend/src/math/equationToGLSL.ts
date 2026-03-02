export function validateEquation(expr: string): boolean {
  // balanced parentheses check
  let balance = 0;

  for (const char of expr) {
    if (char === "(") balance++;
    if (char === ")") balance--;

    if (balance < 0) return false;
  }

  return balance === 0;
}

export function equationToGLSL(expr: string): string {
  let glsl = expr;

  // remove spaces
  glsl = glsl.replace(/\s+/g, "");

  // variables
  glsl = glsl.replace(/\bx\b/g, "uv.x");
  glsl = glsl.replace(/\by\b/g, "uv.y");
  glsl = glsl.replace(/\bt\b/g, "u_time");

  // ⭐ convert integers → floats (20 → 20.0)
  glsl = glsl.replace(/\b(\d+)\b/g, "$1.0");

  return glsl;
}