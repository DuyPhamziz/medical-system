import React from 'react';
import { 
  FormControl, 
  FormControlLabel, 
  RadioGroup, 
  Radio, 
  Typography, 
  Box, 
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  TextField
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface Option {
  optionId: string;
  content: string;
}

interface SingleChoiceQuestionProps {
  questionId: string;
  content: string;
  options: Option[];
  required?: boolean;
  allowOther?: boolean;
  config?: {
    displayMode?: 'RADIO' | 'DROPDOWN';
    helperText?: string;
    validationMessage?: string;
  };
}

const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({ 
  questionId, content, options = [], required, allowOther, config = {} 
}) => {
  const { control, watch } = useFormContext();
  const selectedValue = watch(`answers.${questionId}`);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        {content} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      <Controller
        name={`answers.${questionId}`}
        control={control}
        rules={{ required: required ? (config.validationMessage || 'Vui lòng chọn một đáp án') : false }}
        render={({ field, fieldState: { error } }) => (
          <FormControl error={!!error} fullWidth>
            {config.displayMode === 'DROPDOWN' ? (
              <>
                <InputLabel id={`label-${questionId}`}>Chọn đáp án</InputLabel>
                <Select
                  {...field}
                  labelId={`label-${questionId}`}
                  label="Chọn đáp án"
                  value={field.value || ''}
                >
                  {options.map((opt) => (
                    <MenuItem key={opt.optionId} value={opt.optionId}>
                      {opt.content}
                    </MenuItem>
                  ))}
                  {allowOther && <MenuItem value="other">Khác (ghi rõ)</MenuItem>}
                </Select>
              </>
            ) : (
              <RadioGroup {...field} value={field.value || ''}>
                {options.map((opt) => (
                  <FormControlLabel
                    key={opt.optionId}
                    value={opt.optionId}
                    control={<Radio />}
                    label={opt.content}
                  />
                ))}
                {allowOther && (
                  <FormControlLabel
                    value="other"
                    control={<Radio />}
                    label="Khác (ghi rõ)"
                  />
                )}
              </RadioGroup>
            )}
            <FormHelperText>{error ? error.message : config.helperText}</FormHelperText>
          </FormControl>
        )}
      />
      {allowOther && selectedValue === 'other' && (
        <Controller
          name={`answers.${questionId}_other`}
          control={control}
          rules={{ required: selectedValue === 'other' ? 'Vui lòng nhập giá trị' : false }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              placeholder="Nhập giá trị khác"
              error={!!error}
              helperText={error?.message}
              sx={{ mt: 1 }}
            />
          )}
        />
      )}
    </Box>
  );
};

export default SingleChoiceQuestion;
