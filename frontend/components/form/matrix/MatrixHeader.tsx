import React from "react";
import { MatrixRow, MatrixColumn, MatrixScoreOption } from "./types";

interface MatrixHeaderProps {
  rows: MatrixRow[];
  columns: MatrixColumn[];
  scoreOptions: MatrixScoreOption[];
}

export const MatrixHeader = React.memo(function MatrixHeader({
  rows,
  columns,
  scoreOptions,
}: MatrixHeaderProps) {
  return (
    <div className="matrix-header-row">
      <div className="matrix-corner-cell">
        <span className="matrix-corner-title">Hạng mục</span>
        <span className="matrix-corner-subtitle">Chọn mức độ hoặc nhập ngắn</span>
      </div>
      {columns.map((column) => {
        const labels = column.mode === "text" ? ["Trả lời ngắn"] : (column.scoreOptions ?? scoreOptions).map((option) => option.label);
        return (
          <div key={column.columnId} className="matrix-header-cell">
            <div className="matrix-header-title">{column.label}</div>
            {column.description ? <div className="matrix-header-description">{column.description}</div> : null}
            <div className="matrix-header-meta">
              <span className={`matrix-mode-pill ${column.mode === "text" ? "matrix-mode-pill-text" : "matrix-mode-pill-score"}`}>
                {column.mode === "text" ? "Trả lời ngắn" : `${labels.length} mức độ`}
              </span>
              <span className="matrix-mode-hint">{labels.join(" · ")}</span>
            </div>
          </div>
        );
      })}
      {rows.length === 0 ? <div className="matrix-header-empty" /> : null}
    </div>
  );
});
