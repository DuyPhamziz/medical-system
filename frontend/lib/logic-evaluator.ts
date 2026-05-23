/**
 * Evaluate a logic expression safely without using `new Function()` or `eval`.
 * Supports: ===, !==, >, <, >=, <=, &&, ||, !, ==, +, -, *, /, includes(), strings/numbers in JSON format.
 */
function safeEval(expression: string): any {
  let expr = expression.trim();

  // Handle && first (lowest precedence among boolean operators)
  if (!isInsideParens(expr, '&&') && expr.includes('&&')) {
    const parts = splitTopLevel(expr, '&&');
    return parts.every(p => Boolean(safeEval(p.trim())));
  }

  // Handle ||
  if (!isInsideParens(expr, '||') && expr.includes('||')) {
    const parts = splitTopLevel(expr, '||');
    return parts.some(p => Boolean(safeEval(p.trim())));
  }

  // Handle addition/subtraction using left-to-right split
  const addSubMatch = expr.match(/^(.+?)\s*([+-])\s*(.+)$/);
  if (addSubMatch && !isInsideParens(expr, addSubMatch[2])) {
    const left = safeEval(addSubMatch[1]);
    const right = safeEval(addSubMatch[3]);
    const op = addSubMatch[2];
    if (op === '-') return Number(left) - Number(right);
    if (op === '+') return Number(left) + Number(right);
  }

  // Handle multiplication/division using left-to-right split (same priority)
  const mulDivMatch = expr.match(/^(.+?)\s*([*/])\s*(.+)$/);
  if (mulDivMatch && !isInsideParens(expr, mulDivMatch[2])) {
    const left = safeEval(mulDivMatch[1]);
    const right = safeEval(mulDivMatch[3]);
    const op = mulDivMatch[2];
    if (op === '*') return Number(left) * Number(right);
    if (op === '/') return Number(left) / Number(right);
  }

  // Handle simple comparison patterns without eval
  const comparePatterns: Array<{
    re: RegExp;
    op: (a: any, b: any) => boolean;
  }> = [
    { re: /^(.+?)\s*===\s*(.+)$/, op: (a, b) => a === b },
    { re: /^(.+?)\s*!==\s*(.+)$/, op: (a, b) => a !== b },
    { re: /^(.+?)\s*==\s*(.+)$/, op: (a, b) => a == b },
    { re: /^(.+?)\s*!=\s*(.+)$/, op: (a, b) => a != b },
    { re: /^(.+?)\s*>\s*(.+)$/, op: (a, b) => Number(a) > Number(b) },
    { re: /^(.+?)\s*<\s*(.+)$/, op: (a, b) => Number(a) < Number(b) },
    { re: /^(.+?)\s*>=\s*(.+)$/, op: (a, b) => Number(a) >= Number(b) },
    { re: /^(.+?)\s*<=\s*(.+)$/, op: (a, b) => Number(a) <= Number(b) },
  ];

  for (const { re, op } of comparePatterns) {
    const m = expr.match(re);
    if (m) {
      const left = parseLiteral(m[1].trim());
      const right = parseLiteral(m[2].trim());
      return op(left, right);
    }
  }

  // Handle .includes() calls
  const includesMatch = expr.match(/^(.+?)\.includes\((.+)\)$/);
  if (includesMatch) {
    const left = parseLiteral(includesMatch[1].trim());
    const right = parseLiteral(includesMatch[2].trim());
    if (Array.isArray(left)) return left.includes(right);
    if (typeof left === 'string') return left.includes(String(right));
    return false;
  }

  // Handle boolean literals
  if (expr === 'true') return true;
  if (expr === 'false') return false;

  // Handle simple NOT
  if (expr.startsWith('!')) {
    return !safeEval(expr.slice(1));
  }

  // Handle parenthesized expressions
  if (expr.startsWith('(') && expr.endsWith(')')) {
    return safeEval(expr.slice(1, -1));
  }

  return parseLiteral(expr);
}

function parseLiteral(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

function isInsideParens(expr: string, op: string): boolean {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') depth++;
    else if (expr[i] === ')') depth--;
    else if (depth === 0 && expr.slice(i, i + op.length) === op) {
      return false;
    }
  }
  return true;
}

function splitTopLevel(expr: string, op: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') depth++;
    else if (expr[i] === ')') depth--;
    else if (depth === 0 && expr.slice(i, i + op.length) === op) {
      parts.push(expr.slice(start, i));
      start = i + op.length;
      i += op.length - 1;
    }
  }
  parts.push(expr.slice(start));
  return parts;
}

export function evaluateCondition(expression: string, answers: Record<string, any>): boolean {
  try {
    let normalized = normalizeExpression(expression, answers);
    return Boolean(safeEval(normalized));
  } catch (error) {
    console.warn('Error evaluating condition:', expression, error);
    return true;
  }
}

export function evaluateFormula(formula: string, answers: Record<string, any>): number | null {
  try {
    let normalized = normalizeExpression(formula, answers);
    
    // Support special functions like AGE(birthdate)
    const ageMatch = normalized.match(/AGE\("(.+?)"\)/);
    if (ageMatch) {
      const birthDate = new Date(ageMatch[1]);
      if (isNaN(birthDate.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }

    // Replace CURRENT_YEAR
    normalized = normalized.replace(/CURRENT_YEAR/g, new Date().getFullYear().toString());

    const result = safeEval(normalized);
    return typeof result === 'number' ? result : null;
  } catch (error) {
    console.warn('Error evaluating formula:', formula, error);
    return null;
  }
}

function normalizeExpression(expression: string, answers: Record<string, any>): string {
  let normalized = expression
    .replace(/\bkhông\s+bằng\b/g, '!==')
    .replace(/\bbằng\b/g, '===')
    .replace(/\blớn\s+hơn\s+hoặc\s+bằng\b/g, '>=')
    .replace(/\bnhỏ\s+hơn\s+hoặc\s+bằng\b/g, '<=')
    .replace(/\blớn\s+hơn\b/g, '>')
    .replace(/\bnhỏ\s+hơn\b/g, '<');

  const variableMatches = normalized.match(/\{\{([^}]+)\}\}/g) || [];
  for (const match of variableMatches) {
    const questionId = match.replace(/\{\{|\}\}/g, '');
    const answer = answers[questionId];

    let value: any;
    if (typeof answer === 'object' && answer !== null && 'selectedOption' in answer) {
      value = answer.selectedOption === 'other' ? answer.otherText : answer.selectedOption;
    } else {
      value = answer;
    }

    const replacementValue = (value === null || value === undefined) ? '""' : JSON.stringify(value);
    normalized = normalized.split(match).join(replacementValue);
  }
  return normalized;
}

