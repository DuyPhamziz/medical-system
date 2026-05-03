import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { v4 as uuidv4 } from 'uuid';
import { 
  PedigreeAnswerDTO, 
  PedigreeNodeDTO, 
  PedigreeEdgeDTO 
} from '@/types/form';
import { PedigreeNodeDialog } from './pedigree/PedigreeNodeDialog';
import { PedigreeRelationDialog } from './pedigree/PedigreeRelationDialog';

interface PedigreeQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    maxGenerations?: number;
    allowEditing?: boolean;
  };
  defaultValue?: PedigreeAnswerDTO;
  value?: PedigreeAnswerDTO;
  onChange?: (questionId: string, rIdx: number, key: string, val: any) => void;
}

export const PedigreeQuestion: React.FC<PedigreeQuestionProps> = ({
  questionId,
  content,
  required = false,
  config = {},
  defaultValue = { nodes: [], edges: [], version: 1, createdAt: new Date().toISOString() },
  value,
  onChange,
}) => {
  const formContext = useFormContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<PedigreeNodeDTO | null>(null);
  const [relationDialogOpen, setRelationDialogOpen] = useState(false);
  const [relationData, setRelationData] = useState({ fromNodeId: '', toNodeId: '', type: '' });

  const [tempNode, setTempNode] = useState<Partial<PedigreeNodeDTO>>({
    nodeId: `node_${uuidv4()}`,
    fullName: '',
    gender: 'M',
    isDeceased: false,
    isProband: false,
  });

  const handleSaveNode = (currentData: PedigreeAnswerDTO, fieldOnChange: (val: any) => void) => {
    if (!tempNode.fullName) return;

    const newNode: PedigreeNodeDTO = {
      nodeId: tempNode.nodeId || `node_${uuidv4()}`,
      fullName: tempNode.fullName,
      gender: tempNode.gender as string,
      yearOfBirth: tempNode.yearOfBirth,
      yearOfDeath: tempNode.yearOfDeath,
      isDeceased: tempNode.isDeceased || false,
      isProband: tempNode.isProband || false,
      diseases: tempNode.diseases || [],
      x: 0,
      y: 0,
    };

    const updatedNodes = editingNode
      ? currentData.nodes.map((n) => (n.nodeId === editingNode.nodeId ? newNode : n))
      : [...currentData.nodes, newNode];

    fieldOnChange({ ...currentData, nodes: updatedNodes });
    setDialogOpen(false);
    setEditingNode(null);
  };

  const handleAddRelation = (currentData: PedigreeAnswerDTO, fieldOnChange: (val: any) => void) => {
    if (!relationData.fromNodeId || !relationData.toNodeId || !relationData.type) return;

    const newEdge: PedigreeEdgeDTO = {
      edgeId: `edge_${uuidv4()}`,
      fromNodeId: relationData.fromNodeId,
      toNodeId: relationData.toNodeId,
      relationType: relationData.type,
    };

    fieldOnChange({
      ...currentData,
      edges: [...(currentData.edges || []), newEdge],
    });

    setRelationDialogOpen(false);
    setRelationData({ fromNodeId: '', toNodeId: '', type: '' });
  };

  const renderContent = (pedigreeData: PedigreeAnswerDTO, fieldOnChange: (val: any) => void) => (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        {content}
        {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      {config.allowEditing !== false && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => {
              setEditingNode(null);
              setTempNode({
                nodeId: `node_${uuidv4()}`,
                fullName: '',
                gender: 'M',
                isDeceased: false,
                isProband: false,
              });
              setDialogOpen(true);
            }}
          >
            Add Person
          </Button>
          <Button
            variant="outlined"
            onClick={() => setRelationDialogOpen(true)}
            disabled={pedigreeData.nodes.length < 2}
          >
            Add Relationship
          </Button>
        </Stack>
      )}

      {/* Nodes Display */}
      {pedigreeData.nodes.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Family Members ({pedigreeData.nodes.length})
          </Typography>
          {pedigreeData.nodes.map((node) => (
            <Box
              key={node.nodeId}
              sx={{
                p: 1.5,
                mb: 1,
                backgroundColor: node.isProband ? '#e3f2fd' : '#fafafa',
                border: node.isProband ? '2px solid #1976d2' : '1px solid #e0e0e0',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {node.fullName}
                  {node.isProband && <Chip label="Index Case" size="small" sx={{ ml: 1 }} />}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                  <Chip label={node.gender || 'Unknown'} size="small" variant="outlined" />
                  {node.yearOfBirth && (
                    <Typography variant="caption" color="textSecondary">
                      b. {node.yearOfBirth}
                      {node.yearOfDeath && ` - d. ${node.yearOfDeath}`}
                    </Typography>
                  )}
                </Stack>
                {node.diseases && node.diseases.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                    {node.diseases.map((disease, idx) => (
                      <Chip key={idx} label={disease} size="small" color="error" variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Box>
              {config.allowEditing !== false && (
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setEditingNode(node);
                      setTempNode(node);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      fieldOnChange({
                        ...pedigreeData,
                        nodes: pedigreeData.nodes.filter((n) => n.nodeId !== node.nodeId),
                        edges: (pedigreeData.edges || []).filter(
                          (e) => e.fromNodeId !== node.nodeId && e.toNodeId !== node.nodeId
                        ),
                      });
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Relationships Display */}
      {pedigreeData.edges && pedigreeData.edges.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Relationships ({pedigreeData.edges.length})
          </Typography>
          {pedigreeData.edges.map((edge) => {
            const fromNode = pedigreeData.nodes.find((n) => n.nodeId === edge.fromNodeId);
            const toNode = pedigreeData.nodes.find((n) => n.nodeId === edge.toNodeId);
            return (
              <Chip
                key={edge.edgeId}
                label={`${fromNode?.fullName} → ${toNode?.fullName} (${edge.relationType})`}
                onDelete={
                  config.allowEditing !== false
                    ? () => {
                        fieldOnChange({
                          ...pedigreeData,
                          edges: pedigreeData.edges.filter((e) => e.edgeId !== edge.edgeId),
                        });
                      }
                    : undefined
                }
                sx={{ mr: 1, mb: 1 }}
              />
            );
          })}
        </Box>
      )}

      <PedigreeNodeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={() => handleSaveNode(pedigreeData, fieldOnChange)}
        tempNode={tempNode}
        setTempNode={setTempNode}
        isEditing={!!editingNode}
      />

      <PedigreeRelationDialog
        open={relationDialogOpen}
        onClose={() => setRelationDialogOpen(false)}
        onSave={() => handleAddRelation(pedigreeData, fieldOnChange)}
        nodes={pedigreeData.nodes}
        relationData={relationData}
        setRelationData={setRelationData}
      />
    </Paper>
  );

  if (!formContext) {
    const pedigreeData = value || defaultValue;
    const manualChange = (val: PedigreeAnswerDTO) => {
      if (onChange) {
        onChange(questionId, 0, "valueJson", JSON.stringify(val));
      }
    };
    return renderContent(pedigreeData, manualChange);
  }

  return (
    <Controller
      name={`answers.${questionId}`}
      control={formContext.control}
      defaultValue={defaultValue}
      rules={{ required: required ? 'This field is required' : false }}
      render={({ field }) => {
        const pedigreeData = (field.value as PedigreeAnswerDTO) || { nodes: [], edges: [] };
        return renderContent(pedigreeData, field.onChange);
      }}
    />
  );
};
