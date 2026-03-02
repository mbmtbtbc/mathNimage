const RESERVED = ["x", "y", "t", "sin", "cos", "tan", "abs"];

export function extractParameters(expr: string): string[] {
  const tokens = expr.match(/[a-zA-Z]+/g) || [];

  const unique = new Set(tokens);

  return [...unique].filter(
    (token) => !RESERVED.includes(token)
  );
}