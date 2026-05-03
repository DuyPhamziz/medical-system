import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  TextField,
  Stack,
} from '@mui/material';
import { MatrixConfig } from './config/MatrixConfig';
import { CalculatedConfig } from './config/CalculatedConfig';
import { LogicRulesConfig } from './config/LogicRulesConfig';

interface ConfigEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  initialConfig?: any;
  questionType: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export const FormConfigEditor: React.FC<ConfigEditorProps> = ({
  open,
  onClose,
  onSave,
  initialConfig = {},
  questionType,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [config, setConfig] = useState(initialConfig);
  const [matrixRows, setMatrixRows] = useState<any[]>(initialConfig.matrixRows || []);
  const [logicRules, setLogicRules] = useState<any[]>(initialConfig.logicRules || []);
  const [formula, setFormula] = useState(initialConfig.formula || '');
  const [newRowLabel, setNewRowLabel] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');

  const handleAddMatrixRow = (label: string) => {
    if (!label.trim()) return;
    setMatrixRows([...matrixRows, { rowId: `row_${Date.now()}`, label }]);
    setNewRowLabel('');
  };

  const handleAddLogicRule = (condition: string) => {
    if (!condition.trim()) return;
    setLogicRules([...logicRules, { ruleId: `rule_${Date.now()}`, condition, action: 'SHOW' }]);
    setNewRuleCondition('');
  };

  const handleSave = () => {
    const updatedConfig = {
      ...config,
      ...(questionType === 'MATRIX' && { matrixRows }),
      ...(questionType === 'CALCULATED' && { formula }),
      ...((questionType === 'TEXT' || questionType === 'SINGLE_CHOICE') && { logicRules }),
    };
    onSave(updatedConfig);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configure {questionType} Question</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mt: 2, mb: 2 }}>
          {questionType === 'MATRIX' && (
            <>
              <Tab label="Matrix Rows" />
              <Tab label="Display" />
            </>
          )}
          {questionType === 'CALCULATED' && (
            <>
              <Tab label="Formula" />
              <Tab label="Thresholds" />
            </>
          )}
          {(questionType === 'TEXT' || questionType === 'SINGLE_CHOICE') && (
            <Tab label="Logic Rules" />
          )}
          <Tab label="Advanced" />
        </Tabs>

        {questionType === 'MATRIX' && (
          <MatrixConfig
            tabValue={tabValue}
            matrixRows={matrixRows}
            onAddRow={handleAddMatrixRow}
            onDeleteRow={(id) => setMatrixRows(matrixRows.filter((r) => r.rowId !== id))}
            newRowLabel={newRowLabel}
            setNewRowLabel={setNewRowLabel}
            config={config}
            setConfig={setConfig}
          />
        )}

        {questionType === 'CALCULATED' && (
          <CalculatedConfig
            tabValue={tabValue}
            formula={formula}
            setFormula={setFormula}
            config={config}
            setConfig={setConfig}
          />
        )}

        {(questionType === 'TEXT' || questionType === 'SINGLE_CHOICE') && tabValue === 0 && (
          <LogicRulesConfig
            logicRules={logicRules}
            onAddRule={handleAddLogicRule}
            onDeleteRule={(id) => setLogicRules(logicRules.filter((r) => r.ruleId !== id))}
            onUpdateRule={(id, field, val) =>
              setLogicRules(logicRules.map((r) => (r.ruleId === id ? { ...r, [field]: val } : r)))
            }
            newRuleCondition={newRuleCondition}
            setNewRuleCondition={setNewRuleCondition}
          />
        )}

        <TabPanel value={tabValue} index={questionType === 'MATRIX' ? 2 : (questionType === 'CALCULATED' ? 2 : 1)}>
          <Stack spacing={2}>
            <TextField
              label="Additional JSON Config"
              multiline
              rows={4}
              value={JSON.stringify(config, null, 2)}
              onChange={(e) => {
                try {
                  setConfig(JSON.parse(e.target.value));
                } catch (err) {}
              }}
              fullWidth
            />
          </Stack>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};
