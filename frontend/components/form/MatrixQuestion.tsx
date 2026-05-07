import React, { useEffect, useMemo, useRef, useState } from "react";
import { MatrixRow, MatrixColumn, MatrixValue, MatrixCellMode } from "./matrix/types";
import { 
  normalizeRows, 
  normalizeColumns, 
  normalizeScoreOptions, 
  normalizeMatrixValue 
} from "./matrix/utils";
import { MatrixHeader } from "./matrix/MatrixHeader";
import { MatrixRowView } from "./matrix/MatrixRowView";
import styles from "./MatrixQuestion.module.css";

interface MatrixQuestionProps {
  content: string;
  required?: boolean;
  options?: any[];
  config?: {
    rows?: MatrixRow[];
    columns?: MatrixColumn[];
    defaultCellMode?: MatrixCellMode;
    scoreOptions?: any[];
  };
  value?: unknown;
  onChange?: (value: MatrixValue) => void;
}

export const MatrixQuestion: React.FC<MatrixQuestionProps> = ({
  content,
  required = false,
  options = [],
  config = {},
  value,
  onChange,
}) => {
  const rows = useMemo(() => normalizeRows(config.rows, options), [config.rows, options]);
  const columns = useMemo(
    () => normalizeColumns(config.columns, options, config.defaultCellMode ?? "score", config.scoreOptions),
    [config.columns, options, config.defaultCellMode, config.scoreOptions],
  );
  const scoreOptions = useMemo(() => normalizeScoreOptions(config.scoreOptions), [config.scoreOptions]);

  const normalizedIncomingValue = useMemo(
    () => normalizeMatrixValue(value, rows, columns),
    [value, rows, columns],
  );

  const [matrixValue, setMatrixValue] = useState<MatrixValue>(normalizedIncomingValue);
  const syncingFromPropsRef = useRef(true);

  useEffect(() => {
    syncingFromPropsRef.current = true;
    setMatrixValue(normalizedIncomingValue);
  }, [normalizedIncomingValue]);

  useEffect(() => {
    if (syncingFromPropsRef.current) {
      syncingFromPropsRef.current = false;
      return;
    }

    onChange?.({
      version: 2,
      rows,
      columns,
      cells: matrixValue.cells,
    });
  }, [columns, matrixValue, onChange, rows]);

  const handleTextChange = (rowId: string, columnId: string, nextValue: string) => {
    setMatrixValue((prev) => ({
      ...prev,
      rows,
      columns,
      cells: {
        ...prev.cells,
        [rowId]: {
          ...(prev.cells[rowId] ?? {}),
          [columnId]: { mode: "text", value: nextValue },
        },
      },
    }));
  };

  const handleScoreChange = (rowId: string, columnId: string, nextValue: string) => {
    setMatrixValue((prev) => ({
      ...prev,
      rows,
      columns,
      cells: {
        ...prev.cells,
        [rowId]: {
          ...(prev.cells[rowId] ?? {}),
          [columnId]: { mode: "score", value: nextValue },
        },
      },
    }));
  };

  const isEmpty = rows.length === 0 || columns.length === 0;

  return (
    <div className={styles.matrixShell}>
      <div className={styles.matrixHead}>
        <div>
          <div className={styles.matrixTitle}>
            {content}
            {required && <span className={styles.matrixRequired}>*</span>}
          </div>
          <div className={styles.matrixDescription}>Bảng có thể kết hợp ô trả lời ngắn và ô chấm điểm 3 mức độ.</div>
        </div>
        <div className={styles.matrixLegend}>
          <span className={`${styles.matrixLegendChip} ${styles.matrixLegendChipText}`}>Ô trả lời ngắn</span>
          <span className={`${styles.matrixLegendChip} ${styles.matrixLegendChipScore}`}>Ô chấm điểm</span>
        </div>
      </div>

      {isEmpty ? (
        <div className={styles.matrixEmptyState}>
          <strong>Chưa có hàng hoặc cột.</strong>
          <span>Hãy cấu hình hàng và cột trong phần chỉnh sửa câu hỏi.</span>
        </div>
      ) : (
        <div className={styles.matrixGridWrapper}>
          <div
            className={styles.matrixGrid}
            style={{
              gridTemplateColumns: `minmax(240px, 1.2fr) repeat(${columns.length}, minmax(220px, 1fr))`,
            }}
          >
            <MatrixHeader rows={rows} columns={columns} scoreOptions={scoreOptions} />
            {rows.map((row) => (
              <MatrixRowView
                key={row.rowId}
                row={row}
                columns={columns}
                scoreOptions={scoreOptions}
                value={matrixValue}
                onTextChange={handleTextChange}
                onScoreChange={handleScoreChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
