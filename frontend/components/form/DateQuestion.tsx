import React from 'react';
import { TextField, Typography, Box } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface DateQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    helperText?: string;
    includeTime?: boolean;
    minDate?: string;
    maxDate?: string;
    validationMessage?: string;
  };
}

const DateQuestion: React.FC<DateQuestionProps> = ({ questionId, content, required, config = {} }) => {
  const { control } = useFormContext();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        {content} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      <Controller
        name={`answers.${questionId}`}
        control={control}
        rules={{ 
          required: required ? 'Trường này là bắt buộc' : false,
          min: config.minDate ? { value: config.minDate, message: config.validationMessage || `Ngày tối thiểu là ${config.minDate}` } : undefined,
          max: config.maxDate ? { value: config.maxDate, message: config.validationMessage || `Ngày tối đa là ${config.maxDate}` } : undefined,
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            type={config.includeTime ? "datetime-local" : "date"}
            fullWidth
            variant="outlined"
            slotProps={{ 
              inputLabel: { shrink: true },
              htmlInput: {
                min: config.minDate,
                max: config.maxDate,
              }
            }}
            helperText={error ? error.message : config.helperText}
            error={!!error}
            value={field.value || ''}
          />
        )}
      />
    </Box>
  );
};

export default DateQuestion;
