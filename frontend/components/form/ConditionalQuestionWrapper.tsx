import React, { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, Box } from '@mui/material';
import { evaluateCondition } from '@/lib/logic-evaluator';

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

export const ConditionalQuestionWrapper: React.FC<ConditionalQuestionWrapperProps> = ({
  children,
  logicRules = [],
  questionId,
  onVisibilityChange,
}) => {
  const { control, getValues } = useFormContext();
  const [isVisible, setIsVisible] = useState(true);
  const [shouldBeRequired, setShouldBeRequired] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Extract dependencies from logic rules to watch only necessary fields
  const dependencies = React.useMemo(() => {
    const deps = new Set<string>();
    logicRules.forEach(rule => {
      const matches = rule.condition.match(/\{\{([^}]+)\}\}/g);
      if (matches) {
        matches.forEach(m => deps.add(`answers.${m.replace(/\{\{|\}\}/g, '')}`));
      }
    });
    return Array.from(deps);
  }, [logicRules]);

  // Watch only specific dependencies instead of all form values
  const watchedValues = useWatch({ 
    control, 
    name: dependencies.length > 0 ? (dependencies as any) : undefined 
  });

  // Evaluate logic rules
  useEffect(() => {
    if (!logicRules || logicRules.length === 0) {
      if (!isVisible) {
        setIsVisible(true);
        if (onVisibilityChange) onVisibilityChange(true);
      }
      return;
    }

    const allAnswers = getValues('answers') || {};
    let finalVisibility = true; // Default to visible

    const visibilityRule = logicRules.find(r => r.action === 'SHOW' || r.action === 'HIDE');

    if (visibilityRule) {
      const conditionMet = evaluateCondition(visibilityRule.condition, allAnswers);
      if (visibilityRule.action === 'SHOW') {
        finalVisibility = conditionMet;
      } else if (visibilityRule.action === 'HIDE') {
        finalVisibility = !conditionMet;
      }
    }

    // Handle other actions like alerts or requirements if visible
    let alertMsg: string | null = null;
    let nextShouldBeRequired = false;

    if(finalVisibility) {
      for (const rule of logicRules) {
        const conditionMet = evaluateCondition(rule.condition, allAnswers);
        if (conditionMet) {
          if (rule.action === 'REQUIRE') nextShouldBeRequired = true;
          if (rule.action === 'ALERT' && rule.message) alertMsg = rule.message;
        }
      }
    }
    
    // Only update state if values changed to prevent unnecessary re-renders
    if (finalVisibility !== isVisible) {
      setIsVisible(finalVisibility);
      if (onVisibilityChange) {
        onVisibilityChange(finalVisibility);
      }
    }

    if (nextShouldBeRequired !== shouldBeRequired) {
      setShouldBeRequired(nextShouldBeRequired);
    }

    if (alertMsg !== alertMessage) {
      setAlertMessage(alertMsg);
    }
  }, [watchedValues, logicRules, getValues, onVisibilityChange, isVisible, shouldBeRequired, alertMessage]);

  if (!isVisible) {
    return null;
  }

  return (
    <Box>
      {alertMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}
      {/* TODO: Pass shouldBeRequired to the child component if needed */}
      {children}
    </Box>
  );
};
