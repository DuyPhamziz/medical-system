import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
} from '@mui/material';
import { PedigreeNodeDTO } from '@/types/form';

interface PedigreeNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  tempNode: Partial<PedigreeNodeDTO>;
  setTempNode: (node: Partial<PedigreeNodeDTO>) => void;
  isEditing: boolean;
}

export const PedigreeNodeDialog: React.FC<PedigreeNodeDialogProps> = ({
  open,
  onClose,
  onSave,
  tempNode,
  setTempNode,
  isEditing,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEditing ? 'Edit Person' : 'Add Person'}</DialogTitle>
      <DialogContent sx={{ pt: 2, minWidth: 400 }}>
        <Stack spacing={2}>
          <TextField
            label="Full Name"
            required
            value={tempNode.fullName || ''}
            onChange={(e) => setTempNode({ ...tempNode, fullName: e.target.value })}
            fullWidth
          />
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Gender
            </Typography>
            <RadioGroup
              row
              value={tempNode.gender || 'M'}
              onChange={(e) => setTempNode({ ...tempNode, gender: e.target.value })}
            >
              <FormControlLabel value="M" control={<Radio size="small" />} label="Male" />
              <FormControlLabel value="F" control={<Radio size="small" />} label="Female" />
              <FormControlLabel value="OTHER" control={<Radio size="small" />} label="Other" />
            </RadioGroup>
          </Box>
          <TextField
            label="Year of Birth"
            type="number"
            value={tempNode.yearOfBirth || ''}
            onChange={(e) =>
              setTempNode({ ...tempNode, yearOfBirth: parseInt(e.target.value) || undefined })
            }
            slotProps={{ htmlInput: { min: 1900, max: new Date().getFullYear() } }}
          />
          {tempNode.isDeceased && (
            <TextField
              label="Year of Death"
              type="number"
              value={tempNode.yearOfDeath || ''}
              onChange={(e) =>
                setTempNode({
                  ...tempNode,
                  yearOfDeath: parseInt(e.target.value) || undefined,
                })
              }
            />
          )}
          <FormControlLabel
            control={
              <input
                type="checkbox"
                checked={tempNode.isDeceased || false}
                onChange={(e) =>
                  setTempNode({ ...tempNode, isDeceased: e.target.checked })
                }
              />
            }
            label="Deceased"
          />
          <FormControlLabel
            control={
              <input
                type="checkbox"
                checked={tempNode.isProband || false}
                onChange={(e) =>
                  setTempNode({ ...tempNode, isProband: e.target.checked })
                }
              />
            }
            label="Index Case (Proband)"
          />
          <TextField
            label="Diseases (comma-separated)"
            value={tempNode.diseases?.join(', ') || ''}
            onChange={(e) =>
              setTempNode({
                ...tempNode,
                diseases: e.target.value.split(',').map((d) => d.trim()),
              })
            }
            multiline
            rows={2}
            placeholder="e.g., Diabetes, Hypertension"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          {isEditing ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
