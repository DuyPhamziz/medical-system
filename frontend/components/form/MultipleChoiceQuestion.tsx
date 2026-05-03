import React from 'react';
import { 
  FormControl, 
  FormControlLabel, 
  Checkbox, 
  FormGroup, 
  Typography, 
  Box, 
  FormHelperText,
  TextField 
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface Option {
  optionId: string;
  content: string;
}

interface MultipleChoiceQuestionProps {
  questionId: string;
  content: string;
  options: Option[];
  required?: boolean;
  allowOther?: boolean;
  config?: {
    helperText?: string;
    minSelection?: number;
    maxSelection?: number;
    validationMessage?: string;
  };
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ 
  questionId, content, options = [], required, allowOther, config = {} 
}) => {
  const { control, watch } = useFormContext();
  const selectedValues = watch(`answers.${questionId}`) || [];
  const isOtherSelected = selectedValues.includes('other');

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        {content} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      <Controller
        name={`answers.${questionId}`}
        control={control}
        rules={{
          validate: (value) => {
            const selectedCount = value?.length || 0;
            if (required && selectedCount === 0) 
              return config.validationMessage || 'Vui lòng chọn ít nhất một đáp án';
            
            if (config.minSelection && selectedCount > 0 && selectedCount < config.minSelection) 
              return config.validationMessage || `Vui lòng chọn ít nhất ${config.minSelection} đáp án`;
              
            if (config.maxSelection && selectedCount > config.maxSelection) 
              return config.validationMessage || `Chỉ được chọn tối đa ${config.maxSelection} đáp án`;
              
            return true;
          }
        }}
        render={({ field, fieldState: { error } }) => {
          const currentSelected = field.value || [];
          
          const handleChange = (optionId: string) => {
            const newValues = currentSelected.includes(optionId)
              ? currentSelected.filter((v: string) => v !== optionId)
              : [...currentSelected, optionId];
            field.onChange(newValues);
          };

          return (
            <FormControl error={!!error} component="fieldset" variant="standard">
              <FormGroup>
                {options.map((opt) => (
                  <FormControlLabel
                    key={opt.optionId}
                    control={
                      <Checkbox
                        checked={currentSelected.includes(opt.optionId)}
                        onChange={() => handleChange(opt.optionId)}
                      />
                    }
                    label={opt.content}
                  />
                ))}
                {allowOther && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentSelected.includes('other')}
                        onChange={() => handleChange('other')}
                      />
                    }
                    label="Khác (ghi rõ)"
                  />
                )}
              </FormGroup>
              <FormHelperText>{error ? error.message : config.helperText}</FormHelperText>
            </FormControl>
          );
        }}
      />
      {allowOther && isOtherSelected && (
        <Controller
          name={`answers.${questionId}_other`}
          control={control}
          rules={{ required: isOtherSelected ? 'Vui lòng nhập giá trị' : false }}
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

export default MultipleChoiceQuestion;
