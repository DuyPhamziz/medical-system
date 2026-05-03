import React, { useCallback, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Slider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface BodyMapMarkerDTO {
  x: number; // 0-100%
  y: number; // 0-100%
  level: number; // 1-10
  regionCode?: string;
  side?: 'LEFT' | 'RIGHT' | 'BILATERAL';
  note?: string;
  markedAt?: string;
}

interface BodyMapQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    bodyMapType?: 'front' | 'back' | 'both'; // Body side to display
    showSideSelection?: boolean;
    allowMultipleMarkers?: boolean;
  };
  defaultValue?: BodyMapMarkerDTO[];
}

const BODY_MAP_SVG = `
<svg viewBox="0 0 200 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Head -->
  <circle cx="100" cy="50" r="25" fill="none" stroke="#999" stroke-width="2"/>
  
  <!-- Neck -->
  <rect x="92" y="75" width="16" height="20" fill="none" stroke="#999" stroke-width="2"/>
  
  <!-- Torso -->
  <rect x="75" y="95" width="50" height="80" fill="none" stroke="#999" stroke-width="2" rx="5"/>
  
  <!-- Left Arm -->
  <rect x="30" y="100" width="45" height="15" fill="none" stroke="#999" stroke-width="2" rx="7"/>
  
  <!-- Right Arm -->
  <rect x="125" y="100" width="45" height="15" fill="none" stroke="#999" stroke-width="2" rx="7"/>
  
  <!-- Left Hand -->
  <rect x="20" y="115" width="10" height="20" fill="none" stroke="#999" stroke-width="2" rx="3"/>
  
  <!-- Right Hand -->
  <rect x="170" y="115" width="10" height="20" fill="none" stroke="#999" stroke-width="2" rx="3"/>
  
  <!-- Pelvis -->
  <path d="M 75 175 Q 100 185 125 175" fill="none" stroke="#999" stroke-width="2"/>
  
  <!-- Left Leg -->
  <rect x="80" y="175" width="15" height="100" fill="none" stroke="#999" stroke-width="2" rx="7"/>
  
  <!-- Right Leg -->
  <rect x="105" y="175" width="15" height="100" fill="none" stroke="#999" stroke-width="2" rx="7"/>
  
  <!-- Left Foot -->
  <rect x="75" y="275" width="25" height="15" fill="none" stroke="#999" stroke-width="2" rx="3"/>
  
  <!-- Right Foot -->
  <rect x="100" y="275" width="25" height="15" fill="none" stroke="#999" stroke-width="2" rx="3"/>
</svg>
`;

/**
 * Body map question component
 * Allows users to click on body areas to mark pain or symptom locations
 * Supports pain level selection and notes
 */
export const BodyMapQuestion: React.FC<BodyMapQuestionProps> = ({
  questionId,
  content,
  required = false,
  config = {},
  defaultValue = [],
}) => {
  const { control } = useFormContext();
  const [selectedMarker, setSelectedMarker] = useState<BodyMapMarkerDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempMarker, setTempMarker] = useState<Partial<BodyMapMarkerDTO>>({
    x: 50,
    y: 50,
    level: 5,
    side: 'BILATERAL',
  });

  const handleBodyClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!config.allowMultipleMarkers) return;

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setTempMarker({
      x: Math.round(x),
      y: Math.round(y),
      level: 5,
      side: 'BILATERAL',
      markedAt: new Date().toISOString(),
    });
    setDialogOpen(true);
  };

  const addMarker = (field: any) => {
    if (!tempMarker.x || !tempMarker.y || !tempMarker.level) {
      return;
    }

    const newMarker: BodyMapMarkerDTO = {
      x: tempMarker.x,
      y: tempMarker.y,
      level: tempMarker.level,
      side: tempMarker.side as 'LEFT' | 'RIGHT' | 'BILATERAL',
      note: tempMarker.note,
      markedAt: tempMarker.markedAt || new Date().toISOString(),
    };

    const currentMarkers = (field.value as BodyMapMarkerDTO[]) || [];
    field.onChange([...currentMarkers, newMarker]);
    setDialogOpen(false);
    setTempMarker({ x: 50, y: 50, level: 5, side: 'BILATERAL' });
  };

  const removeMarker = (field: any, index: number) => {
    const updated = ((field.value as BodyMapMarkerDTO[]) || []).filter(
      (_, i) => i !== index
    );
    field.onChange(updated);
  };

  return (
    <Controller
      name={`answers.${questionId}`}
      control={control}
      defaultValue={defaultValue}
      rules={{ required: required ? 'This field is required' : false }}
      render={({ field }) => (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {content}
            {required && <span style={{ color: 'red' }}>*</span>}
          </Typography>

          {config.allowMultipleMarkers && (
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
              Click on body areas to mark symptoms or pain locations
            </Typography>
          )}

          {/* Body Map SVG */}
          <div
            style={{
              width: '100%',
              maxWidth: '300px',
              margin: '0 auto',
              cursor: config.allowMultipleMarkers ? 'crosshair' : 'default',
            }}
            className="body-map-svg-container"
            onClick={(e) => {
              const svg = e.currentTarget.querySelector('svg');
              if (svg) {
                handleBodyClick({
                  clientX: e.clientX,
                  clientY: e.clientY,
                  currentTarget: svg
                } as any);
              }
            }}
            dangerouslySetInnerHTML={{ __html: BODY_MAP_SVG }}
          />

          {/* Display markers */}
          {((field.value as BodyMapMarkerDTO[]) || []).length > 0 && (
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Marked Locations:</Typography>
              {((field.value as BodyMapMarkerDTO[]) || []).map((marker, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="body2">
                      Level {marker.level}/10 {marker.side ? `(${marker.side})` : ''}
                    </Typography>
                    {marker.note && (
                      <Typography variant="caption" color="textSecondary">
                        {marker.note}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => removeMarker(field, index)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
          )}

          {/* Add Marker Dialog */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Mark Symptom Location</DialogTitle>
            <DialogContent sx={{ pt: 2, minWidth: 300 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography component="label" variant="body2" sx={{ mb: 1, display: 'block' }}>
                    Pain Level: {tempMarker.level}/10
                  </Typography>
                  <Slider
                    min={1}
                    max={10}
                    value={tempMarker.level || 5}
                    onChange={(_, value) => setTempMarker({ ...tempMarker, level: value as number })}
                    marks
                  />
                </Box>

                {config.showSideSelection && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Side:
                    </Typography>
                    <RadioGroup
                      value={tempMarker.side || 'BILATERAL'}
                      onChange={(e) =>
                        setTempMarker({
                          ...tempMarker,
                          side: e.target.value as 'LEFT' | 'RIGHT' | 'BILATERAL',
                        })
                      }
                    >
                      <FormControlLabel
                        value="LEFT"
                        control={<Radio size="small" />}
                        label="Left"
                      />
                      <FormControlLabel
                        value="RIGHT"
                        control={<Radio size="small" />}
                        label="Right"
                      />
                      <FormControlLabel
                        value="BILATERAL"
                        control={<Radio size="small" />}
                        label="Both"
                      />
                    </RadioGroup>
                  </Box>
                )}

                <TextField
                  label="Additional notes"
                  multiline
                  rows={2}
                  value={tempMarker.note || ''}
                  onChange={(e) => setTempMarker({ ...tempMarker, note: e.target.value })}
                  placeholder="e.g., Constant dull ache"
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => addMarker(field)} variant="contained">
                Add Marker
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      )}
    />
  );
};
