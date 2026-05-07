import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';
import { FormQuestion } from '@/types/form';
import { ConditionalQuestionWrapper } from './ConditionalQuestionWrapper';

// Dynamically import question components to reduce initial bundle size
// SSR enabled so components render on first paint (no client-side flash)
const TextQuestion = dynamic(() => import('./TextQuestion'));
const NumberQuestion = dynamic(() => import('./NumberQuestion'));
const DateQuestion = dynamic(() => import('./DateQuestion'));
const SingleChoiceQuestion = dynamic(() => import('./SingleChoiceQuestion'));
const MultipleChoiceQuestion = dynamic(() => import('./MultipleChoiceQuestion'));
const ScaleQuestion = dynamic(() => import('./ScaleQuestion'));

const MatrixQuestion = dynamic(() => import('./MatrixQuestion').then(m => ({ default: m.MatrixQuestion })));
const FileUploadQuestion = dynamic(() => import('./FileUploadQuestion').then(m => ({ default: m.FileUploadQuestion })));
const BodyMapQuestion = dynamic(() => import('./BodyMapQuestion').then(m => ({ default: m.BodyMapQuestion })));
const PedigreeQuestion = dynamic(() => import('./PedigreeQuestion').then(m => ({ default: m.PedigreeQuestion })));
const ClinicalScaleQuestion = dynamic(() => import('./ClinicalScaleQuestion').then(m => ({ default: m.ClinicalScaleQuestion })));
const ScoredQuestion = dynamic(() => import('./ScoredQuestion').then(m => ({ default: m.ScoredQuestion })));
const RepeatableGroupQuestion = dynamic(() => import('./RepeatableGroupQuestion').then(m => ({ default: m.RepeatableGroupQuestion })));
const IdentityQuestion = dynamic(() => import('./IdentityQuestion').then(m => ({ default: m.IdentityQuestion })));
const LookupQuestion = dynamic(() => import('./LookupQuestion').then(m => ({ default: m.LookupQuestion })));
const CalculatedDisplayQuestion = dynamic(() => import('./CalculatedDisplayQuestion').then(m => ({ default: m.CalculatedDisplayQuestion })));
const TimeSeriesTrackingQuestion = dynamic(() => import('./TimeSeriesTrackingQuestion').then(m => ({ default: m.TimeSeriesTrackingQuestion })));
const DynamicTableQuestion = dynamic(() => import('./DynamicTableQuestion').then(m => ({ default: m.DynamicTableQuestion })));

interface DynamicQuestionProps {
  question: FormQuestion;
  onVisibilityChange?: (isVisible: boolean) => void;
}

/**
 * Dynamic question renderer
 * Routes to correct component based on question type
 * Handles conditional logic wrapping
 */
export const DynamicQuestion: React.FC<DynamicQuestionProps> = React.memo(({
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
    const subQuestions = question.subQuestions || [];

    const renderSubQuestions = (parentOptionId?: string) => {
      const filtered = parentOptionId 
        ? subQuestions.filter(sq => sq.parentOptionId === parentOptionId)
        : subQuestions.filter(sq => !sq.parentOptionId);
        
      if (filtered.length === 0) return null;
      
      return (
        <Box sx={{ ml: 4, mt: 2, pl: 2, borderLeft: '2px solid #f1f5f9' }}>
          {filtered.map(sq => (
            <DynamicQuestion key={sq.questionId} question={sq} />
          ))}
        </Box>
      );
    };

    switch (question.questionType.toLowerCase()) {
      case 'text':
        return (
          <>
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
            {renderSubQuestions()}
          </>
        );

      case 'number':
        return (
          <>
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
            {renderSubQuestions()}
          </>
        );

      case 'date':
        return (
          <>
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
            {renderSubQuestions()}
          </>
        );

      case 'datetime':
        return (
          <>
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
            {renderSubQuestions()}
          </>
        );

      case 'single_choice':
        return (
          <SingleChoiceQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            options={question.options}
            allowOther={question.allowOther}
            subQuestions={question.subQuestions}
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
            subQuestions={question.subQuestions}
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
          <>
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
            {renderSubQuestions()}
          </>
        );

      case 'matrix':
        return (
          <MatrixQuestion
            content={question.content}
            required={question.required}
            options={question.options}
            config={config}
          />
        );

      case 'dynamic_table':
        return (
          <DynamicTableQuestion
            questionId={question.questionId!}
            content={question.content}
            required={question.required}
            config={config}
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
});
