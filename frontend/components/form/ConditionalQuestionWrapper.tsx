import React, { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, Box } from '@mui/material';
import { evaluateCondition } from '@/lib/logic-evaluator';
import { motion, AnimatePresence } from 'framer-motion';

interface ConditionalQuestionWrapperProps {
  children: React.ReactNode;
  logicRules?: Array<{
    condition: string;
    action: 'SHOW' | 'HIDE' | 'REQUIRE' | 'ALERT';
    targetQuestionId?: string;
    message?: string;
  }>;
  questionId?: string;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export const ConditionalQuestionWrapper: React.FC<ConditionalQuestionWrapperProps> = React.memo(({
  children,
  logicRules = [],
  questionId,
  onVisibilityChange,
}) => {
  const { control, getValues } = useFormContext();
  const visibleRef = useRef(true);
  const requiredRef = useRef(false);
  const alertRef = useRef<string | null>(null);
  const onVisibilityChangeRef = useRef(onVisibilityChange);
  onVisibilityChangeRef.current = onVisibilityChange;

  // Extract dependencies from logic rules to watch only necessary fields
  const dependencies = React.useMemo(() => {
    const deps = new Set<string>();
    for (let i = 0; i < logicRules.length; i++) {
      const rule = logicRules[i];
      const matches = rule.condition.match(/\{\{([^}]+)\}\}/g);
      if (matches) {
        for (let j = 0; j < matches.length; j++) {
          deps.add(`answers.${matches[j].replace(/\{\{|\}\}/g, '')}`);
        }
      }
    }
    return Array.from(deps);
  }, [logicRules]);

  // Watch only specific dependencies instead of all form values
  useWatch({
    control,
    name: dependencies.length > 0 ? (dependencies as any) : undefined
  });

  // Compute visibility state directly from form values on every render
  // using getValues() which is already reactive via useWatch triggering re-renders
  const { isVisible, shouldBeRequired, alertMessage } = React.useMemo(() => {
    if (!logicRules || logicRules.length === 0) {
      return { isVisible: true, shouldBeRequired: false, alertMessage: null as string | null };
    }

    const allAnswers = getValues('answers') || {};
    let finalVisibility = true;
    let alertMsg: string | null = null;
    let nextRequired = false;

    const visibilityRule = logicRules.find(r => r.action === 'SHOW' || r.action === 'HIDE');
    if (visibilityRule) {
      const conditionMet = evaluateCondition(visibilityRule.condition, allAnswers);
      finalVisibility = visibilityRule.action === 'SHOW' ? conditionMet : !conditionMet;
    }

    if (finalVisibility) {
      for (let i = 0; i < logicRules.length; i++) {
        const rule = logicRules[i];
        const conditionMet = evaluateCondition(rule.condition, allAnswers);
        if (conditionMet) {
          if (rule.action === 'REQUIRE') nextRequired = true;
          if (rule.action === 'ALERT' && rule.message) alertMsg = rule.message;
        }
      }
    }

    return { isVisible: finalVisibility, shouldBeRequired: nextRequired, alertMessage: alertMsg };
  }, [logicRules, getValues]);

  // Notify parent only when visibility actually changes (stable callback ref)
  useEffect(() => {
    if (visibleRef.current !== isVisible) {
      visibleRef.current = isVisible;
      onVisibilityChangeRef.current?.(isVisible);
    }
  }, [isVisible]);

  // Track required state change for future use
  useEffect(() => {
    requiredRef.current = shouldBeRequired;
  }, [shouldBeRequired]);

  useEffect(() => {
    alertRef.current = alertMessage;
  }, [alertMessage]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={questionId || 'unknown'}
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ overflow: 'hidden' }}
        >
          <Box sx={{ mb: 2 }}>
            {alertMessage && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {alertMessage}
              </Alert>
            )}
            {children}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}, (prevProps, nextProps) => {
  // Custom comparator: only re-render if logic rules or questionId actually changed
  if (prevProps.questionId !== nextProps.questionId) return false;
  if (prevProps.logicRules !== nextProps.logicRules) return false;
  if (prevProps.children !== nextProps.children) return false;
  return true;
});
