export function evaluateCondition(expression: string, answers: any): boolean {
  try {
    // Replace {{questionId}} with actual values
    let evaluated = expression;

    const variableMatches = expression.match(/\{\{([^}]+)\}\}/g) || [];
    for (const match of variableMatches) {
      const questionId = match.replace(/\{\{|\}\}/g, '');
      const answer = answers[questionId];
      
      let value: any;
      if (typeof answer === 'object' && answer !== null && 'selectedOption' in answer) {
        if (answer.selectedOption === 'other') {
          value = answer.otherText;
        } else {
          value = answer.selectedOption;
        }
      } else {
        value = answer;
      }

      let replacementValue: string;
      if (value === null || value === undefined) {
        replacementValue = '""'; // Treat null/undefined as empty string for comparison
      } else {
        replacementValue = JSON.stringify(value);
      }

      evaluated = evaluated.split(match).join(replacementValue);
    }

    // Handle .includes special case if needed, but JS already has it for strings and arrays.
    // If we want to support a more user-friendly "contains" syntax, we could replace it here.

    // Simple evaluation using Function constructor (safer than eval)
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${evaluated}`)();
    return Boolean(result);
  } catch (error) {
    console.warn('Error evaluating condition:', expression, error);
    return true; // Default to show on error to prevent users from being blocked
  }
}
