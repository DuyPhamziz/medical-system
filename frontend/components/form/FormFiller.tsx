import React, { useCallback, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Button, Container, LinearProgress, Stack, Typography, Alert, Card } from '@mui/material';
import { DynamicQuestion } from './DynamicQuestion';
import { FormQuestion, FormSection } from '@/types/form';
import apiClient from '@/lib/axios';
import { useNotificationStore } from '@/store/notification.store';

interface FormFillerProps {
  form: {
    formId: string;
    title: string;
    description?: string;
    sections: Array<{
      sectionId: string;
      title: string;
      description?: string;
      questions: FormQuestion[];
    }>;
  };
  onSubmitSuccess?: (sessionId: string) => void;
  onSubmitError?: (error: string) => void;
}

/**
 * Main form display and fill component
 * Renders all sections and questions dynamically based on type
 * Handles form submission with validation
 */
export const FormFiller: React.FC<FormFillerProps> = ({
  form,
  onSubmitSuccess,
  onSubmitError,
}) => {
  const { show } = useNotificationStore();
  const methods = useForm<any>({
    defaultValues: {
      answers: {},
    },
    mode: 'onChange',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({});

  // Flatten all questions from all sections
  const allQuestions = useMemo(() => {
    return form.sections.flatMap((section) => section.questions);
  }, [form.sections]);

  // Calculate progress using watch instead of getValues for reactivity
  const watchedAnswers = methods.watch('answers');
  const progress = useMemo(() => {
    const visibleQuestions = allQuestions.filter(
      (q) => q.questionId && visibilityMap[q.questionId] !== false
    );

    const answeredRequired = visibleQuestions.filter((q) => {
      if (!q.required) return true;
      const answer = q.questionId ? watchedAnswers?.[q.questionId] : undefined;
      return answer && (Array.isArray(answer) ? answer.length > 0 : Boolean(answer));
    });

    if (visibleQuestions.length === 0) return 0;
    return Math.round((answeredRequired.length / visibleQuestions.length) * 100);
  }, [allQuestions, visibilityMap, watchedAnswers]);

  // Handle visibility change for conditional questions
  const handleVisibilityChange = useCallback(
    (questionId: string, isVisible: boolean) => {
      setVisibilityMap((prev) => {
        if (prev[questionId] === isVisible) return prev;
        return {
          ...prev,
          [questionId]: isVisible,
        };
      });
    },
    []
  );

  // Submit form
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Prepare answers for submission with correct type mapping
      const answers = Object.entries(data.answers || {}).flatMap(([questionId, value]) => {
        const question = allQuestions.find((q) => q.questionId === questionId);
        if (!question) return [];

        // Support for repeating groups or simple values
        const valueArray = Array.isArray(value) ? value : [value];

        return valueArray.map((val, idx) => {
          const answer: any = {
            questionId,
            repeatIndex: idx,
          };

          const type = question.questionType.toLowerCase();

          if (type === 'number' || type === 'scale') {
            answer.valueNumber = val;
          } else if (type === 'date' || type === 'datetime') {
            answer.valueDate = val;
          } else if (type === 'single_choice') {
            answer.optionId = val;
          } else if (
            ['multiple_choice', 'matrix', 'pedigree', 'body_map', 'file_upload', 'time_series', 'lookup'].includes(type)
          ) {
            answer.valueJson = typeof val === 'string' ? val : JSON.stringify(val);
          } else {
            answer.valueText = val?.toString();
          }

          return answer;
        });
      });

      // Post to backend
      const response = await apiClient.post(`/api/forms/${form.formId}/submit`, {
        answers,
      });

      setSubmitSuccess(true);
      show({
        type: 'success',
        title: 'Thành công',
        message: 'Biểu mẫu đã được lưu thành công vào hồ sơ bệnh nhân.',
      });

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data.sessionId);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Không thể lưu biểu mẫu. Vui lòng kiểm tra lại kết nối.';
      setSubmitError(errorMessage);
      show({
        type: 'error',
        title: 'Lỗi hệ thống',
        message: errorMessage,
      });

      if (onSubmitError) {
        onSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" color="success.main" sx={{ mb: 1 }}>
              ✓ Form Submitted Successfully
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Thank you for completing the form. Your responses have been recorded.
            </Typography>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <FormProvider {...methods}>
      <Container maxWidth="md">
        <Box sx={{ py: 3 }}>
          {/* Form Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              {form.title}
            </Typography>
            {form.description && (
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {form.description}
              </Typography>
            )}

            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Progress
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
            </Box>
          </Box>

          {/* Error Message */}
          {submitError && (
            <Alert severity="error" onClose={() => setSubmitError(null)} sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          {/* Form Sections */}
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              {form.sections.map((section, sectionIndex) => (
                <Box key={section.sectionId}>
                  {/* Section Header */}
                  <Box sx={{ mb: 2, pb: 2, borderBottom: '2px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {sectionIndex + 1}. {section.title}
                    </Typography>
                    {section.description && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {section.description}
                      </Typography>
                    )}
                  </Box>

                  {/* Section Questions */}
                  <Stack spacing={2}>
                    {section.questions.map((question) => (
                      <Box key={question.questionId}>
                        <DynamicQuestion
                          question={question}
                          onVisibilityChange={(isVisible) =>
                            handleVisibilityChange(question.questionId!, isVisible)
                          }
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>

            {/* Form Actions */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting || progress < 100}
                sx={{ minWidth: 150 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={() => methods.reset()}
              >
                Clear
              </Button>
            </Box>

            {/* Validation Summary */}
            {progress < 100 && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3cd', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  ℹ️ Please complete all required questions to submit the form.
                </Typography>
              </Box>
            )}
          </form>
        </Box>
      </Container>
    </FormProvider>
  );
};
