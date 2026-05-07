export type MatrixCellMode = "text" | "score";

export type MatrixScoreOption = {
  value: string;
  label: string;
  score: number;
};

export type MatrixRow = {
  rowId: string;
  label: string;
  description?: string;
};

export type MatrixColumn = {
  columnId: string;
  label: string;
  description?: string;
  mode?: MatrixCellMode;
  placeholder?: string;
  scoreOptions?: MatrixScoreOption[];
};

export type MatrixCellValue =
  | { mode: "text"; value: string }
  | { mode: "score"; value: string };

export type MatrixValue = {
  version: 2;
  rows: MatrixRow[];
  columns: MatrixColumn[];
  cells: Record<string, Record<string, MatrixCellValue>>;
};
