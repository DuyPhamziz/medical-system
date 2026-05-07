import { v4 as uuidv4 } from "uuid";
import { 
  MatrixRow, 
  MatrixColumn, 
  MatrixScoreOption, 
  MatrixValue, 
  MatrixCellMode, 
  MatrixCellValue 
} from "./types";

export const DEFAULT_MATRIX_SCORE_OPTIONS: MatrixScoreOption[] = [
  { value: "1", label: "Nhẹ", score: 1 },
  { value: "2", label: "Trung bình", score: 2 },
  { value: "3", label: "Nặng", score: 3 },
];

export function parseJson(raw: unknown): unknown {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  return raw;
}

export function normalizeRows(rows?: MatrixRow[], options: any[] = []): MatrixRow[] {
  if (rows && rows.length > 0) {
    return rows.map((row, index) => ({
      rowId: row.rowId || `row-${index + 1}-${uuidv4()}`,
      label: row.label || `Hàng ${index + 1}`,
      description: row.description,
    }));
  }

  // Fallback to options logic (legacy)
  return options
    .filter((option) => {
      const logic = parseJson(option.triggerLogic) as any;
      return logic?.type === 'row';
    })
    .map((option, index) => {
      const logic = parseJson(option.triggerLogic) as any;
      return {
        rowId: option.optionId || `row-${index + 1}`,
        label: option.content || `Hàng ${index + 1}`,
        description: logic?.description,
      };
    });
}

export function normalizeScoreOptions(scoreOptions?: MatrixScoreOption[]): MatrixScoreOption[] {
  const source = scoreOptions && scoreOptions.length > 0 ? scoreOptions : DEFAULT_MATRIX_SCORE_OPTIONS;
  return source.map((option, index) => ({
    value: String(option.value ?? index + 1),
    label: option.label || DEFAULT_MATRIX_SCORE_OPTIONS[index]?.label || `Mức ${index + 1}`,
    score: Number.isFinite(option.score) ? option.score : index + 1,
  }));
}

export function normalizeColumns(
  columns?: MatrixColumn[], 
  options: any[] = [],
  defaultCellMode: MatrixCellMode = "score", 
  scoreOptions?: MatrixScoreOption[]
): MatrixColumn[] {
  const normalizedScoreOptions = normalizeScoreOptions(scoreOptions);

  if (columns && columns.length > 0) {
    return columns.map((column, index) => ({
      columnId: column.columnId || `column-${index + 1}-${uuidv4()}`,
      label: column.label || `Cột ${index + 1}`,
      description: column.description,
      mode: column.mode || defaultCellMode,
      placeholder: column.placeholder,
      scoreOptions: normalizeScoreOptions(column.scoreOptions?.length ? column.scoreOptions : normalizedScoreOptions),
    }));
  }

  // Fallback to options logic (legacy)
  return options
    .filter((option) => {
      const logic = parseJson(option.triggerLogic) as any;
      return logic?.type === 'column';
    })
    .map((option, index) => {
      const logic = parseJson(option.triggerLogic) as any;
      return {
        columnId: option.optionId || `column-${index + 1}`,
        label: option.content || `Cột ${index + 1}`,
        description: logic?.description,
        mode: logic?.cellMode || defaultCellMode,
        placeholder: logic?.placeholder,
        scoreOptions: normalizeScoreOptions(logic?.scoreOptions || normalizedScoreOptions),
      };
    });
}

export function emptyCells(rows: MatrixRow[], columns: MatrixColumn[]): MatrixValue["cells"] {
  return rows.reduce<Record<string, Record<string, MatrixCellValue>>>((rowAcc, row) => {
    rowAcc[row.rowId] = columns.reduce<Record<string, MatrixCellValue>>((columnAcc, column) => {
      columnAcc[column.columnId] = {
        mode: column.mode === "text" ? "text" : "score",
        value: "",
      };
      return columnAcc;
    }, {});
    return rowAcc;
  }, {});
}

export function normalizeMatrixValue(rawValue: unknown, rows: MatrixRow[], columns: MatrixColumn[]): MatrixValue {
  const cells = emptyCells(rows, columns);
  const parsed = parseJson(rawValue);

  if (Array.isArray(parsed)) {
    parsed.forEach((legacyColumn, columnIndex) => {
      const columnId = legacyColumn?.columnId || legacyColumn?.id || legacyColumn?.optionId || `legacy-${columnIndex + 1}`;
      const legacyValues = legacyColumn?.values && typeof legacyColumn.values === "object" ? legacyColumn.values : {};
      Object.entries(legacyValues).forEach(([rowId, legacyCellValue]) => {
        if (!cells[rowId]) {
          cells[rowId] = {};
        }
        cells[rowId][columnId] = {
          mode: typeof legacyCellValue === "string" && legacyCellValue.length <= 64 ? "score" : "text",
          value: legacyCellValue == null ? "" : String(legacyCellValue),
        };
      });
    });

    return {
      version: 2,
      rows,
      columns,
      cells,
    };
  }

  if (parsed && typeof parsed === "object") {
    const matrixObject = parsed as Partial<MatrixValue> & {
      cells?: Record<string, Record<string, unknown>>;
    };

    const incomingCells = matrixObject.cells ?? {};
    Object.entries(incomingCells).forEach(([rowId, rowCells]) => {
      if (!cells[rowId]) {
        cells[rowId] = {};
      }

      Object.entries(rowCells ?? {}).forEach(([columnId, cellValue]) => {
        if (cellValue && typeof cellValue === "object") {
          const normalizedCell = cellValue as Partial<MatrixCellValue>;
          cells[rowId][columnId] = {
            mode: normalizedCell.mode === "text" ? "text" : "score",
            value: normalizedCell.value == null ? "" : String(normalizedCell.value),
          };
          return;
        }

        cells[rowId][columnId] = {
          mode: "score",
          value: cellValue == null ? "" : String(cellValue),
        };
      });
    });

    return {
      version: matrixObject.version ?? 2,
      rows,
      columns,
      cells,
    };
  }

  return {
    version: 2,
    rows,
    columns,
    cells,
  };
}
