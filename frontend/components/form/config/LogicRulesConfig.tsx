import React from 'react';
import {
  Stack,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface LogicRulesConfigProps {
  logicRules: any[];
  onAddRule: (condition: string) => void;
  onDeleteRule: (id: string) => void;
  onUpdateRule: (id: string, field: string, value: any) => void;
  newRuleCondition: string;
  setNewRuleCondition: (condition: string) => void;
}

export const LogicRulesConfig: React.FC<LogicRulesConfigProps> = ({
  logicRules,
  onAddRule,
  onDeleteRule,
  onUpdateRule,
  newRuleCondition,
  setNewRuleCondition,
}) => {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Conditional Logic</Typography>
      <Typography variant="caption" color="textSecondary">
        Example condition: {"{{age}} >= 18 && {{has_consent}} == 'YES'"}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Condition (e.g., {{q1}} > 5)"
          value={newRuleCondition}
          onChange={(e) => setNewRuleCondition(e.target.value)}
          fullWidth
        />
        <Button
          startIcon={<AddIcon />}
          onClick={() => onAddRule(newRuleCondition)}
          variant="contained"
        >
          Add
        </Button>
      </Box>

      {logicRules.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Condition</TableCell>
              <TableCell>Action</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logicRules.map((rule) => (
              <TableRow key={rule.ruleId}>
                <TableCell sx={{ fontSize: '0.75rem' }}>{rule.condition}</TableCell>
                <TableCell>
                  <select
                    value={rule.action}
                    onChange={(e) => onUpdateRule(rule.ruleId, 'action', e.target.value)}
                    style={{ padding: '4px', fontSize: '0.75rem' }}
                  >
                    <option>SHOW</option>
                    <option>HIDE</option>
                    <option>REQUIRE</option>
                    <option>ALERT</option>
                  </select>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onDeleteRule(rule.ruleId)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
};
