import React from 'react';
import { TextField, Typography, Box } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface NumberQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    placeholder?: string;
    helperText?: string;
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    validationMessage?: string;
  };
}

const NumberQuestion: React.FC<NumberQuestionProps> = ({ questionId, content, required, config = {} }) => {
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
          min: config.minValue !== undefined ? { value: config.minValue, message: config.validationMessage || `Giá trị tối thiểu là ${config.minValue}` } : undefined,
          max: config.maxValue !== undefined ? { value: config.maxValue, message: config.validationMessage || `Giá trị tối đa là ${config.maxValue}` } : undefined,
          validate: (val) => {
            if (val === null || val === undefined || val === '') return true;
            const strVal = val.toString();
            if (config.minLength && strVal.length < config.minLength) 
              return config.validationMessage || `Số chữ số tối thiểu là ${config.minLength}`;
            if (config.maxLength && strVal.length > config.maxLength) 
              return config.validationMessage || `Số chữ số tối đa là ${config.maxLength}`;
            return true;
          }
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            type="number"
            fullWidth
            variant="outlined"
            placeholder={config.placeholder}
            helperText={error ? error.message : config.helperText}
            error={!!error}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
          />
        )}
      />
    </Box>
  );
};

export default NumberQuestion;
