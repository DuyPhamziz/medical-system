'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import axios from 'axios';

/**
 * ClinicalScaleScore - Display and calculate scores from completed scales
 * Shows score, interpretation, severity, clinical note, and recommendations
 */
interface ScoreResponse {
  score: number;
  interpretation: string;
  severity: string;
  clinicalNote: string;
  recommendations: string[];
}

interface Props {
  scaleId: string;
  scaleName: string;
  maxScore: number;
  answers: Record<string, number>;
  onScoreCalculated?: (response: ScoreResponse) => void;
  autoCalculate?: boolean;
}

export default function ClinicalScaleScore({
  scaleId,
  scaleName,
  maxScore,
  answers,
  onScoreCalculated,
  autoCalculate = true,
}: Props) {
  const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate score from answers
  const calculateScore = useCallback(async () => {
    if (!scaleId || Object.keys(answers).length === 0) {
      setError('No answers provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/clinical-scales/${scaleId}/calculate-score`,
        { answers }
      );

      setScoreData(response.data);
      onScoreCalculated?.(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to calculate score';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [scaleId, answers, onScoreCalculated]);

  // Auto-calculate on mount if enabled
  React.useEffect(() => {
    if (autoCalculate && Object.keys(answers).length > 0) {
      calculateScore();
    }
  }, [autoCalculate, answers, calculateScore]);

  const getSeverityColor = (severity: string) => {
    const colorMap: Record<string, any> = {
      NORMAL: 'success',
      MILD: 'info',
      MODERATE: 'warning',
      SEVERE: 'error',
      UNKNOWN: 'default',
    };
    return colorMap[severity] || 'default';
  };

  const getSeverityBgColor = (severity: string) => {
    const colorMap: Record<string, string> = {
      NORMAL: '#e8f5e9',
      MILD: '#e3f2fd',
      MODERATE: '#fff3e0',
      SEVERE: '#ffebee',
      UNKNOWN: '#f5f5f5',
    };
    return colorMap[severity] || '#f5f5f5';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
        {!autoCalculate && (
          <Button onClick={calculateScore} size="small" sx={{ ml: 2 }}>
            Retry
          </Button>
        )}
      </Alert>
    );
  }

  if (!scoreData) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography color="textSecondary">
          {autoCalculate ? 'Complete all questions to see score' : 'No score calculated yet'}
        </Typography>
        {!autoCalculate && (
          <Button onClick={calculateScore} variant="outlined" sx={{ mt: 2 }}>
            Calculate Score
          </Button>
        )}
      </Box>
    );
  }

  const scorePercentage = (scoreData.score / maxScore) * 100;

  return (
    <Card sx={{ mt: 3, backgroundColor: getSeverityBgColor(scoreData.severity) }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">{scaleName} Results</Typography>
            <Chip
              label={scoreData.severity}
              color={getSeverityColor(scoreData.severity)}
              variant="outlined"
            />
          </Box>
        }
      />
      <CardContent>
        {/* Score Display */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2">Total Score</Typography>
            <Typography variant="h5" color={getSeverityColor(scoreData.severity)}>
              {scoreData.score} / {maxScore}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(scorePercentage, 100)}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {/* Interpretation */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Interpretation: <strong>{scoreData.interpretation}</strong>
          </Typography>
        </Box>

        {/* Clinical Note */}
        {scoreData.clinicalNote && (
          <Alert severity={getSeverityColor(scoreData.severity)} sx={{ mb: 2 }}>
            <Typography variant="body2">{scoreData.clinicalNote}</Typography>
          </Alert>
        )}

        {/* Recommendations */}
        {scoreData.recommendations && scoreData.recommendations.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Clinical Recommendations:
            </Typography>
            <List sx={{ py: 0 }}>
              {scoreData.recommendations.map((rec, idx) => (
                <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                  <ListItemText
                    primary={<Typography variant="body2">{rec}</Typography>}
                    sx={{
                      ml: 2,
                      '&:before': {
                        content: '"•"',
                        mr: 1,
                        ml: -2,
                        display: 'inline',
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Manual Recalculate */}
        {!autoCalculate && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button onClick={calculateScore} variant="outlined" size="small">
              Recalculate Score
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
