import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';

interface ColumnConfig {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  placeholder?: string;
}

interface DynamicTableQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    columns: ColumnConfig[];
    helperText?: string;
  };
}

/**
 * Advanced Dynamic Table Question
 * Supports multiple columns with different input types
 * Used for medical tests, multiple medications, etc.
 */
export const DynamicTableQuestion: React.FC<DynamicTableQuestionProps> = ({
  questionId,
  content,
  required,
  config,
}) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `answers.${questionId}.valueJson`,
  });

  // Default columns if none provided
  const columns = config?.columns || [
    { id: 'col1', label: 'Tên', type: 'text' },
    { id: 'col2', label: 'Kết quả', type: 'text' },
    { id: 'col3', label: 'Đơn vị', type: 'text' },
    { id: 'col4', label: 'Ghi chú', type: 'text' },
  ];

  const handleAddRow = () => {
    const newRow = columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {});
    append(newRow);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        {content} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      {config?.helperText && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {config.helperText}
        </Typography>
      )}

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} sx={{ fontWeight: 'bold', color: '#64748b' }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ width: 50 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                {columns.map((col) => (
                  <TableCell key={col.id}>
                    <Controller
                      name={`answers.${questionId}.valueJson.${index}.${col.id}`}
                      control={control}
                      render={({ field: inputField }) => {
                        if (col.type === 'select' && col.options) {
                          return (
                            <Select
                              {...inputField}
                              size="small"
                              fullWidth
                              displayEmpty
                            >
                              <MenuItem value=""><em>Chọn...</em></MenuItem>
                              {col.options.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                              ))}
                            </Select>
                          );
                        }
                        return (
                          <TextField
                            {...inputField}
                            size="small"
                            fullWidth
                            type={col.type === 'number' ? 'number' : 'text'}
                            placeholder={col.placeholder}
                            variant="standard"
                            slotProps={{ input: { disableUnderline: false } }}
                          />
                        );
                      }}
                    />
                  </TableCell>
                ))}
                <TableCell align="right">
                  <IconButton size="small" onClick={() => remove(index)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                  Chưa có dữ liệu. Bấm "Thêm dòng" để nhập thông tin.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        startIcon={<AddIcon />}
        onClick={handleAddRow}
        sx={{ mt: 2, borderRadius: 2 }}
        variant="outlined"
        color="primary"
        size="small"
      >
        Thêm dòng
      </Button>
    </Box>
  );
};
