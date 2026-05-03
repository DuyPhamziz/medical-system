'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

/**
 * ClinicalScaleSelector - Dialog to select and insert clinical scales into forms
 * Shows available scales, allows filtering by category, and inserts selected scale
 */
interface ClinicalScaleInfo {
  scaleId: string;
  name: string;
  description: string;
  category: string;
  totalQuestions: number;
  minScore: number;
  maxScore: number;
}

interface Props {
  open: boolean;
  formId: string;
  sectionId: string;
  onClose: () => void;
  onInsertSuccess?: (response: any) => void;
  onInsertError?: (error: string) => void;
}

export default function ClinicalScaleSelector({
  open,
  formId,
  sectionId,
  onClose,
  onInsertSuccess,
  onInsertError,
}: Props) {
  const [scales, setScales] = useState<ClinicalScaleInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScale, setSelectedScale] = useState<ClinicalScaleInfo | null>(null);
  const [category, setCategory] = useState<string>('');
  const [inserting, setInserting] = useState(false);

  const categories = ['DEPRESSION', 'ANXIETY', 'SLEEP', 'COMPOSITE', 'COGNITIVE'];

  // Fetch clinical scales
  useEffect(() => {
    if (!open) return;

    const fetchScales = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = category
          ? `/api/clinical-scales?category=${category}`
          : `/api/clinical-scales`;

        const response = await axios.get(url);
        setScales(response.data);
        setSelectedScale(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load clinical scales');
      } finally {
        setLoading(false);
      }
    };

    fetchScales();
  }, [open, category]);

  // Insert scale into form
  const handleInsert = useCallback(async () => {
    if (!selectedScale || !formId || !sectionId) return;

    setInserting(true);
    setError(null);

    try {
      const response = await axios.post(`/api/clinical-scales`, {
        scaleId: selectedScale.scaleId,
        sectionId: sectionId,
      }, {
        params: { formId }
      });

      onInsertSuccess?.(response.data);
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to insert scale';
      setError(message);
      onInsertError?.(message);
    } finally {
      setInserting(false);
    }
  }, [selectedScale, formId, sectionId, onInsertSuccess, onInsertError, onClose]);

  const getCategoryColor = (cat: string) => {
    const colorMap: Record<string, any> = {
      DEPRESSION: 'error',
      ANXIETY: 'warning',
      SLEEP: 'info',
      COMPOSITE: 'success',
      COGNITIVE: 'secondary',
    };
    return colorMap[cat] || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Insert Clinical Scale</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Category Filter */}
        <TextField
          select
          fullWidth
          label="Filter by Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Scales List */}
        {!loading && scales.length > 0 && (
          <List sx={{ border: '1px solid #e0e0e0', borderRadius: 1, maxHeight: 400, overflow: 'auto' }}>
            {scales.map((scale) => (
              <ListItemButton
                key={scale.scaleId}
                selected={selectedScale?.scaleId === scale.scaleId}
                onClick={() => setSelectedScale(scale)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <strong>{scale.name}</strong>
                      <Chip
                        label={scale.category}
                        size="small"
                        color={getCategoryColor(scale.category)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        {scale.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {scale.totalQuestions} questions • Score: {scale.minScore}-{scale.maxScore}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {/* Empty State */}
        {!loading && scales.length === 0 && (
          <Typography color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
            No clinical scales available
          </Typography>
        )}

        {/* Selected Scale Details */}
        {selectedScale && !loading && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected: <strong>{selectedScale.name}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedScale.description}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Questions: {selectedScale.totalQuestions} • Score Range: {selectedScale.minScore}-{selectedScale.maxScore}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleInsert}
          variant="contained"
          disabled={!selectedScale || inserting || loading}
        >
          {inserting ? 'Inserting...' : 'Insert Scale'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
