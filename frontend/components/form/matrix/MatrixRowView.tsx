import React from "react";
import { MatrixRow, MatrixColumn, MatrixScoreOption, MatrixValue } from "./types";

interface MatrixRowViewProps {
  row: MatrixRow;
  columns: MatrixColumn[];
  scoreOptions: MatrixScoreOption[];
  value: MatrixValue;
  onTextChange: (rowId: string, columnId: string, nextValue: string) => void;
  onScoreChange: (rowId: string, columnId: string, nextValue: string) => void;
}

export const MatrixRowView = React.memo(function MatrixRowView({
  row,
  columns,
  scoreOptions,
  value,
  onTextChange,
  onScoreChange,
}: MatrixRowViewProps) {
  const rowCells = value.cells[row.rowId] ?? {};

  return (
    <div className="matrix-row">
      <div className="matrix-row-label">
        <span className="matrix-row-title">{row.label}</span>
        {row.description ? <span className="matrix-row-description">{row.description}</span> : null}
      </div>
      {columns.map((column) => {
        const cell = rowCells[column.columnId];
        const isTextMode = column.mode === "text";
        if (isTextMode) {
          return (
            <div key={column.columnId} className="matrix-cell matrix-cell-text" data-column-label={column.label}>
              <input
                type="text"
                className="matrix-text-input"
                placeholder={column.placeholder || "Nhập câu trả lời ngắn"}
                value={cell?.mode === "text" ? cell.value : ""}
                onChange={(event) => onTextChange(row.rowId, column.columnId, event.target.value)}
              />
            </div>
          );
        }

        const options = column.scoreOptions ?? scoreOptions;
        const currentValue = cell?.mode === "score" ? cell.value : "";

        return (
          <div key={column.columnId} className="matrix-cell matrix-cell-score" data-column-label={column.label}>
            <div
              className="matrix-score-group"
              role="radiogroup"
              aria-label={`${row.label} - ${column.label}`}
              style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
            >
              {options.map((option) => {
                const selected = currentValue === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`matrix-score-option ${selected ? "matrix-score-option-selected" : ""}`}
                    onClick={() => onScoreChange(row.rowId, column.columnId, selected ? "" : option.value)}
                    aria-pressed={selected}
                  >
                    <span className="matrix-score-option-label">{option.label}</span>
                    <span className="matrix-score-option-score">{option.score}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
});
