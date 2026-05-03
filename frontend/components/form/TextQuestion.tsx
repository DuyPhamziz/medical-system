import React from 'react';
import { TextField, Typography, Box } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface TextQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    placeholder?: string;
    helperText?: string;
    minLength?: number;
    maxLength?: number;
    textMode?: 'SHORT' | 'PARAGRAPH';
    validationPattern?: string;
    validationMessage?: string;
  };
}

const TextQuestion: React.FC<TextQuestionProps> = ({ questionId, content, required, config = {} }) => {
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
          minLength: config.minLength ? { value: config.minLength, message: config.validationMessage || `Tối thiểu ${config.minLength} ký tự` } : undefined,
          maxLength: config.maxLength ? { value: config.maxLength, message: config.validationMessage || `Tối đa ${config.maxLength} ký tự` } : undefined,
          pattern: config.validationPattern ? { value: new RegExp(config.validationPattern), message: config.validationMessage || 'Định dạng không hợp lệ' } : undefined,
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            fullWidth
            variant="outlined"
            multiline={config.textMode === 'PARAGRAPH'}
            rows={config.textMode === 'PARAGRAPH' ? 4 : 1}
            placeholder={config.placeholder}
            helperText={error ? error.message : config.helperText}
            error={!!error}
            value={field.value || ''}
          />
        )}
      />
    </Box>
  );
};

export default TextQuestion;
