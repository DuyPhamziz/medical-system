import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
} from '@mui/material';
import { PedigreeNodeDTO } from '@/types/form';

interface PedigreeRelationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  nodes: PedigreeNodeDTO[];
  relationData: { fromNodeId: string; toNodeId: string; type: string };
  setRelationData: (data: { fromNodeId: string; toNodeId: string; type: string }) => void;
}

const RELATION_TYPES = [
  'PARENT',
  'CHILD',
  'SIBLING',
  'SPOUSE',
  'EX_SPOUSE',
  'GRANDPARENT',
  'COUSIN',
];

export const PedigreeRelationDialog: React.FC<PedigreeRelationDialogProps> = ({
  open,
  onClose,
  onSave,
  nodes,
  relationData,
  setRelationData,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Relationship</DialogTitle>
      <DialogContent sx={{ pt: 2, minWidth: 400 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              From Person
            </Typography>
            <RadioGroup
              value={relationData.fromNodeId}
              onChange={(e) => setRelationData({ ...relationData, fromNodeId: e.target.value })}
            >
              {nodes.map((node) => (
                <FormControlLabel
                  key={node.nodeId}
                  value={node.nodeId}
                  control={<Radio size="small" />}
                  label={node.fullName}
                />
              ))}
            </RadioGroup>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              To Person
            </Typography>
            <RadioGroup
              value={relationData.toNodeId}
              onChange={(e) => setRelationData({ ...relationData, toNodeId: e.target.value })}
            >
              {nodes.map((node) => (
                <FormControlLabel
                  key={node.nodeId}
                  value={node.nodeId}
                  control={<Radio size="small" />}
                  label={node.fullName}
                />
              ))}
            </RadioGroup>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Relationship Type
            </Typography>
            <RadioGroup
              value={relationData.type}
              onChange={(e) => setRelationData({ ...relationData, type: e.target.value })}
            >
              {RELATION_TYPES.map((type) => (
                <FormControlLabel
                  key={type}
                  value={type}
                  control={<Radio size="small" />}
                  label={type}
                />
              ))}
            </RadioGroup>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
