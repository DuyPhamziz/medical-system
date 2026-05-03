import React from 'react';
import { Stack, Typography, TextField } from '@mui/material';

interface CalculatedConfigProps {
  formula: string;
  setFormula: (formula: string) => void;
  config: any;
  setConfig: (config: any) => void;
  tabValue: number;
}

export const CalculatedConfig: React.FC<CalculatedConfigProps> = ({
  formula,
  setFormula,
  config,
  setConfig,
  tabValue,
}) => {
  if (tabValue === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="subtitle2">Formula Expression</Typography>
        <Typography variant="caption" color="textSecondary">
          Use {"{{questionId}}"} to reference other answers. Example: {"{{q1}} + {{q2}} * 2"}
        </Typography>
        <TextField
          multiline
          rows={4}
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder='e.g., {{weight}} / ({{height}} * {{height}}) * 10000'
          fullWidth
        />
        <TextField
          label="Description"
          value={config.description || ''}
          onChange={(e) => setConfig({ ...config, description: e.target.value })}
          placeholder="What does this formula calculate?"
        />
      </Stack>
    );
  }

  if (tabValue === 1) {
    return (
      <Stack spacing={2}>
        <Typography variant="subtitle2">Interpretation Thresholds</Typography>
        <TextField
          label="Min Threshold"
          type="number"
          value={config.minThreshold || 0}
          onChange={(e) =>
            setConfig({
              ...config,
              minThreshold: parseFloat(e.target.value),
            })
          }
        />
        <TextField
          label="Max Threshold"
          type="number"
          value={config.maxThreshold || 100}
          onChange={(e) =>
            setConfig({
              ...config,
              maxThreshold: parseFloat(e.target.value),
            })
          }
        />
        <TextField
          label="Normal Range Label"
          value={config.normalLabel || 'Normal Range'}
          onChange={(e) => setConfig({ ...config, normalLabel: e.target.value })}
        />
      </Stack>
    );
  }

  return null;
};
