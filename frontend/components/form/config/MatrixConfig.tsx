import React from 'react';
import {
  Stack,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface MatrixConfigProps {
  matrixRows: any[];
  onAddRow: (label: string) => void;
  onDeleteRow: (id: string) => void;
  newRowLabel: string;
  setNewRowLabel: (label: string) => void;
  config: any;
  setConfig: (config: any) => void;
  tabValue: number;
}

export const MatrixConfig: React.FC<MatrixConfigProps> = ({
  matrixRows,
  onAddRow,
  onDeleteRow,
  newRowLabel,
  setNewRowLabel,
  config,
  setConfig,
  tabValue,
}) => {
  if (tabValue === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="subtitle2">Define Matrix Rows</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Row label (e.g., Fatigue)"
            value={newRowLabel}
            onChange={(e) => setNewRowLabel(e.target.value)}
            fullWidth
          />
          <Button
            startIcon={<AddIcon />}
            onClick={() => onAddRow(newRowLabel)}
            variant="contained"
          >
            Add
          </Button>
        </Box>

        {matrixRows.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Row Label</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matrixRows.map((row) => (
                <TableRow key={row.rowId}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onDeleteRow(row.rowId)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Stack>
    );
  }

  if (tabValue === 1) {
    return (
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Answer Mode
          </Typography>
          <Chip
            label="Single Selection (Radio)"
            onClick={() => setConfig({ ...config, answerMode: 'SINGLE' })}
            color={config.answerMode === 'SINGLE' ? 'primary' : 'default'}
            variant={config.answerMode === 'SINGLE' ? 'filled' : 'outlined'}
            sx={{ mr: 1 }}
          />
          <Chip
            label="Multiple Selection (Checkbox)"
            onClick={() => setConfig({ ...config, answerMode: 'MULTIPLE' })}
            color={config.answerMode === 'MULTIPLE' ? 'primary' : 'default'}
            variant={config.answerMode === 'MULTIPLE' ? 'filled' : 'outlined'}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Randomize
          </Typography>
          <Chip
            label="Randomize Rows"
            onClick={() => setConfig({ ...config, randomizeRows: !config.randomizeRows })}
            color={config.randomizeRows ? 'success' : 'default'}
            variant={config.randomizeRows ? 'filled' : 'outlined'}
            sx={{ mr: 1 }}
          />
        </Box>
      </Stack>
    );
  }

  return null;
};
