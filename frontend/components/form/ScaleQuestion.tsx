import React from 'react';
import { Slider, Typography, Box, FormHelperText } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface ScaleQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    minValue?: number;
    maxValue?: number;
    minLabel?: string;
    maxLabel?: string;
    helperText?: string;
  };
}

const ScaleQuestion: React.FC<ScaleQuestionProps> = ({ questionId, content, required, config = {} }) => {
  const { control } = useFormContext();
  const min = config.minValue ?? 1;
  const max = config.maxValue ?? 10;

  return (
    <Box sx={{ mb: 3, px: 2 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        {content} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      <Controller
        name={`answers.${questionId}`}
        control={control}
        rules={{ required: required ? 'Vui lòng chọn giá trị trên thang đo' : false }}
        render={({ field, fieldState: { error } }) => (
          <Box sx={{ mt: 4 }}>
            <Slider
              {...field}
              value={field.value || min}
              min={min}
              max={max}
              step={1}
              marks={[
                { value: min, label: config.minLabel || String(min) },
                { value: max, label: config.maxLabel || String(max) }
              ]}
              valueLabelDisplay="auto"
            />
            <FormHelperText error={!!error}>{error ? error.message : config.helperText}</FormHelperText>
          </Box>
        )}
      />
    </Box>
  );
};

export default ScaleQuestion;
