import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  Paper,
  Typography,
  Stack,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';

// Hàng (ví dụ: tính chất công việc) - được định nghĩa sẵn
interface MatrixRow {
  rowId: string;
  label: string;
}

// Lựa chọn cho mỗi ô (ví dụ: Nhẹ, Trung Bình, Nặng) - được định nghĩa sẵn
interface MatrixOption {
  optionId: string;
  label: string;
}

// Cột động do người dùng tạo (ví dụ: nghề nghiệp)
export interface DynamicColumn {
  id: string; // ID duy nhất cho cột
  label: string; // Tên nghề nghiệp do người dùng nhập
  values: Record<string, string>; // { [rowId]: optionId }
}

interface MatrixQuestionProps {
  content: string;
  required?: boolean;
  config?: {
    rows?: MatrixRow[];
    options?: MatrixOption[];
    answerMode?: 'SINGLE'; // Hiện tại chỉ hỗ trợ SINGLE
  };
  value?: DynamicColumn[];
  onChange?: (value: DynamicColumn[]) => void;
}

export const MatrixQuestion: React.FC<MatrixQuestionProps> = ({
  content,
  required = false,
  config = {},
  value = [],
  onChange,
}) => {
  const { rows = [], options = [] } = config;
  const [dynamicColumns, setDynamicColumns] = useState<DynamicColumn[]>([]);

  useEffect(() => {
    // This effect synchronizes the internal state with the `value` prop from the outside.
    // This is a standard pattern for controlled components that also need internal state
    // to manage transient user interactions (like adding a new, unsaved column).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDynamicColumns(value?.map(col => ({ ...col, id: col.id || uuidv4() })) || []);
  }, [value]);

  const triggerChange = useCallback((newColumns: DynamicColumn[]) => {
    if (onChange) {
      onChange(newColumns);
    }
  }, [onChange]);

  const handleAddColumn = () => {
    const newColumn: DynamicColumn = {
      id: uuidv4(),
      label: '',
      values: {},
    };
    const newColumns = [...dynamicColumns, newColumn];
    setDynamicColumns(newColumns);
    triggerChange(newColumns);
  };

  const handleRemoveColumn = (columnId: string) => {
    const newColumns = dynamicColumns.filter(col => col.id !== columnId);
    setDynamicColumns(newColumns);
    triggerChange(newColumns);
  };

  const handleColumnLabelChange = (columnId: string, newLabel: string) => {
    const newColumns = dynamicColumns.map(col =>
      col.id === columnId ? { ...col, label: newLabel } : col
    );
    setDynamicColumns(newColumns);
    triggerChange(newColumns);
  };

  const handleCellChange = (columnId: string, rowId: string, optionId: string) => {
    const newColumns = dynamicColumns.map(col => {
      if (col.id === columnId) {
        const newValues = { ...col.values, [rowId]: optionId };
        return { ...col, values: newValues };
      }
      return col;
    });
    setDynamicColumns(newColumns);
    triggerChange(newColumns);
  };

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        {content}
        {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      <Stack sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '25%', minWidth: 150, fontWeight: 600 }}>
                Tính chất
              </TableCell>
              {dynamicColumns.map((col, index) => (
                <TableCell key={col.id} sx={{ minWidth: 200 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TextField
                      variant="standard"
                      placeholder={`Nghề nghiệp ${index + 1}`}
                      value={col.label}
                      onChange={(e) => handleColumnLabelChange(col.id, e.target.value)}
                      fullWidth
                    />
                    <IconButton size="small" onClick={() => handleRemoveColumn(col.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              ))}
              <TableCell sx={{ width: '10%', padding: '0 8px' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddColumn}
                  size='small'
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Thêm Cột
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
                <TableCell></TableCell>
                {dynamicColumns.map((col) => (
                    <TableCell key={col.id} align="center" sx={{padding: '4px'}}>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                            {options.map((opt) => (
                                <Typography key={opt.optionId} variant="caption" sx={{width: '50px', textAlign: 'center'}}>{opt.label}</Typography>
                            ))}
                        </Stack>
                    </TableCell>
                ))}
                <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.rowId} hover>
                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                  {row.label}
                </TableCell>
                {dynamicColumns.map((col) => {
                  const selectedOption = col.values[row.rowId];
                  return (
                    <TableCell key={col.id} align="center">
                       <RadioGroup
                        row
                        value={selectedOption || ''}
                        onChange={(e) => handleCellChange(col.id, row.rowId, e.target.value)}
                        sx={{justifyContent: 'center'}}
                      >
                        {options.map((opt) => (
                            <Radio
                                key={opt.optionId}
                                value={opt.optionId}
                                sx={{width: '50px', padding: '2px', margin: '0'}}
                            />
                        ))}
                      </RadioGroup>
                    </TableCell>
                  );
                })}
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
};

