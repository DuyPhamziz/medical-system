import React from 'react';
import { Box, Typography } from '@mui/material';
import { FormQuestion } from '@/types/form';
import { ConditionalQuestionWrapper } from './ConditionalQuestionWrapper';

// Import all question components
import { MatrixQuestion } from './MatrixQuestion';
import { FileUploadQuestion } from './FileUploadQuestion';
import { BodyMapQuestion } from './BodyMapQuestion';
import { PedigreeQuestion } from './PedigreeQuestion';
import TextQuestion from './TextQuestion';
import NumberQuestion from './NumberQuestion';
import DateQuestion from './DateQuestion';
import SingleChoiceQuestion from './SingleChoiceQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import ScaleQuestion from './ScaleQuestion';
import { ClinicalScaleQuestion } from './ClinicalScaleQuestion';
import { ScoredQuestion } from './ScoredQuestion';
import { RepeatableGroupQuestion } from './RepeatableGroupQuestion';
import { IdentityQuestion } from './IdentityQuestion';
import { LookupQuestion } from './LookupQuestion';
import { CalculatedDisplayQuestion } from './CalculatedDisplayQuestion';
import { TimeSeriesTrackingQuestion } from './TimeSeriesTrackingQuestion';

interface DynamicQuestionProps {
  question: FormQuestion;
  onVisibilityChange?: (isVisible: boolean) => void;
}

/**
 * Dynamic question renderer
 * Routes to correct component based on question type
 * Handles conditional logic wrapping
 */
export const DynamicQuestion: React.FC<DynamicQuestionProps> = ({
  question,
  onVisibilityChange,
}) => {
  // Memoize config and logicRules to prevent unnecessary re-renders of children
  const { config, logicRules } = React.useMemo(() => {
    const configJson = (question as any).configJson;
    const cfg = configJson ? JSON.parse(configJson) : {};
    return {
      config: cfg,
      logicRules: cfg.logicRules || []
    };
  }, [question]);

  const renderQuestion = () => {
    switch (question.questionType.toLowerCase()) {
      case 'text':
        return (
          <TextQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              placeholder: question.placeholder || undefined,
              minLength: question.minLength || undefined,
              maxLength: question.maxLength || undefined,
              validationPattern: question.validationPattern || undefined,
              validationMessage: question.validationMessage || undefined,
              helperText: question.helperText || undefined,
              textMode: config.textMode, // SHORT or PARAGRAPH
            }}
          />
        );

      case 'number':
        return (
          <NumberQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              placeholder: question.placeholder || undefined,
              minValue: question.minValue || undefined,
              maxValue: question.maxValue || undefined,
              validationMessage: question.validationMessage || undefined,
              helperText: question.helperText || undefined,
            }}
          />
        );

      case 'date':
        return (
          <DateQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              helperText: question.helperText || undefined,
              minDate: config.minDate,
              maxDate: config.maxDate,
              validationMessage: question.validationMessage || undefined,
            }}
          />
        );

      case 'datetime':
        return (
          <DateQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              includeTime: true,
              helperText: question.helperText || undefined,
              minDate: config.minDate,
              maxDate: config.maxDate,
              validationMessage: question.validationMessage || undefined,
            }}
          />
        );

      case 'single_choice':
        return (
          <SingleChoiceQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            options={question.options}
            allowOther={question.allowOther}
            config={{
              displayMode: config.displayMode, // RADIO, DROPDOWN
              helperText: question.helperText || undefined,
              validationMessage: question.validationMessage || undefined,
            }}
          />
        );

      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            options={question.options}
            config={{
              helperText: question.helperText || undefined,
              minSelection: question.minLength || undefined,
              maxSelection: question.maxLength || undefined,
              validationMessage: question.validationMessage || undefined,
            }}
          />
        );

      case 'scale':
        return (
          <ScaleQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              minValue: question.scaleMin || 0,
              maxValue: question.scaleMax || 10,
              helperText: question.helperText || undefined,
            }}
          />
        );

      case 'matrix':
        const matrixRows = config.matrixRows;
        const matrixCellOptions = question.options
          ?.filter(o => {
            try {
              return JSON.parse(o.triggerLogic || '{}').type === 'column';
            } catch {
              return false;
            }
          })
          .map(opt => ({
            optionId: opt.optionId!,
            label: opt.content
          }));

        return (
          <MatrixQuestion
            content={question.content}
            required={question.required}
            config={{
              rows: matrixRows,
              options: matrixCellOptions,
            }}
          />
        );

      case 'file_upload':
        return (
          <FileUploadQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              maxFileSize: config.maxFileSize,
              acceptedFormats: config.acceptedFormats,
              acceptedMimeTypes: config.acceptedMimeTypes,
              multipleFiles: config.multipleFiles,
              minFiles: question.minLength || undefined,
              maxFiles: question.maxLength || undefined,
            }}
          />
        );

      case 'body_map':
        return (
          <BodyMapQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              bodyMapType: config.bodyMapType || 'front',
              showSideSelection: config.showSideSelection,
              allowMultipleMarkers: config.allowMultipleMarkers,
            }}
          />
        );

      case 'pedigree':
        return (
          <PedigreeQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              maxGenerations: config.maxGenerations,
              allowEditing: config.allowEditing !== false,
            }}
          />
        );

      case 'calculated':
        return (
          <CalculatedDisplayQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              formula: config.formula,
              unit: config.unit,
              decimalPlaces: config.decimalPlaces,
            }}
          />
        );

      case 'lookup':
        return (
          <LookupQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              lookupSource: config.lookupSource,
              placeholder: question.placeholder || undefined,
              multiple: config.multiple,
            }}
            value={undefined}
            onChange={() => {}}
          />
        );

      case 'time_series':
        return (
          <TimeSeriesTrackingQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              measurementLabel: config.measurementLabel,
              unit: config.unit,
              maxPoints: config.maxPoints,
              showChart: config.showChart,
            }}
            value={undefined}
            onChange={() => {}}
          />
        );

      case 'clinical_scale':
        return (
          <ClinicalScaleQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            scaleId={question.scaleId}
            config={{
              scaleName: config.scaleName,
              items: config.items,
            }}
            value={undefined}
            onChange={() => {}}
          />
        );

      case 'scored':
        return (
          <ScoredQuestion
            question={question}
            repeatIndex={0}
            selectedOptionId={undefined}
            onChange={() => {}}
          />
        );

      case 'repeatable_group':
        return (
          <RepeatableGroupQuestion
            question={question}
            repeatIndex={0}
            value={[]}
            onChange={() => {}}
          />
        );

      case 'identity':
        return (
          <IdentityQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={{
              fields: config.fields,
            }}
            value={undefined}
            onChange={() => {}}
          />
        );

      default:
        return (
          <Box sx={{ p: 2, backgroundColor: '#fff3cd', borderRadius: 1 }}>
            <Typography variant="body2">
              Question type &apos;{question.questionType}&apos; not supported yet
            </Typography>
          </Box>
        );
    }
  };

  return (
    <ConditionalQuestionWrapper
      logicRules={logicRules}
      questionId={question.questionId}
      onVisibilityChange={onVisibilityChange}
    >
      {renderQuestion()}
    </ConditionalQuestionWrapper>
  );
};
