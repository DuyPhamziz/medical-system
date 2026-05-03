import React, { useState, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';

interface FileUploadAnswerDTO {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  storageProvider?: string;
  checksum?: string;
}

interface FileUploadQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    maxFileSize?: number; // in MB
    acceptedFormats?: string[]; // e.g., ['pdf', 'jpg', 'png']
    multipleFiles?: boolean;
    acceptedMimeTypes?: string[];
    minFiles?: number;
    maxFiles?: number;
  };
  defaultValue?: FileUploadAnswerDTO | FileUploadAnswerDTO[];
}

const UPLOAD_ENDPOINT = '/api/forms/upload-url';
const MAX_FILE_SIZE_DEFAULT = 10; // MB

/**
 * File upload question component
 * Supports drag & drop, file preview, and presigned URL upload to cloud storage
 */
export const FileUploadQuestion: React.FC<FileUploadQuestionProps> = ({
  questionId,
  content,
  required = false,
  config = {},
  defaultValue = [],
}) => {
  const { control } = useFormContext();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxFileSize = (config.maxFileSize || MAX_FILE_SIZE_DEFAULT) * 1024 * 1024;
  const isMultiple = config.multipleFiles !== false;
  const acceptedTypes = config.acceptedMimeTypes || ['*'];

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds ${config.maxFileSize || MAX_FILE_SIZE_DEFAULT}MB limit`;
    }

    if (config.acceptedFormats && config.acceptedFormats.length > 0) {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !config.acceptedFormats.includes(fileExt)) {
        return `File format not accepted. Accepted: ${config.acceptedFormats.join(', ')}`;
      }
    }

    if (acceptedTypes[0] !== '*' && !acceptedTypes.includes(file.type)) {
      return `File type not accepted. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFile = useCallback(
    async (file: File, field: any) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (config.maxFiles && Array.isArray(field.value) && field.value.length >= config.maxFiles) {
        setError(`You can only upload a maximum of ${config.maxFiles} files`);
        return;
      }

      setUploading(true);
      setError(null);
      setUploadProgress(0);
// ... rest of method

      try {
        // Step 1: Get presigned URL from backend
        const presignedResponse = await fetch(UPLOAD_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            questionId,
          }),
        });

        if (!presignedResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const presignedData = await presignedResponse.json();
        const { uploadUrl, fileUrl } = presignedData;

        // Step 2: Upload file to presigned URL
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Success
            const uploadedFile: FileUploadAnswerDTO = {
              url: fileUrl,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              uploadedAt: new Date().toISOString(),
              storageProvider: presignedData.storageProvider,
              checksum: presignedData.checksum,
            };

            if (isMultiple) {
              const currentFiles = (field.value as FileUploadAnswerDTO[]) || [];
              field.onChange([...currentFiles, uploadedFile]);
            } else {
              field.onChange(uploadedFile);
            }

            setUploadProgress(0);
            setUploading(false);
          } else {
            throw new Error(`Upload failed with status ${xhr.status}`);
          }
        });

        xhr.addEventListener('error', () => {
          throw new Error('Upload failed');
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setUploading(false);
      }
    },
    [questionId, isMultiple, validateFile]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, field: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadFile(files[0], field);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const files = event.target.files;
    if (files && files[0]) {
      uploadFile(files[0], field);
    }
  };

  return (
    <Controller
      name={`answers.${questionId}`}
      control={control}
      defaultValue={defaultValue}
      rules={{ 
        required: required ? 'This field is required' : false,
        validate: (value) => {
          const count = Array.isArray(value) ? value.length : (value ? 1 : 0);
          if (required && count === 0) return 'Vui lòng tải lên ít nhất một file';
          if (config.minFiles && count > 0 && count < config.minFiles) 
            return `Vui lòng tải lên ít nhất ${config.minFiles} file`;
          if (config.maxFiles && count > config.maxFiles) 
            return `Chỉ được phép tải lên tối đa ${config.maxFiles} file`;
          return true;
        }
      }}
      render={({ field, fieldState: { error: fieldError } }) => (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {content}
            {required && <span style={{ color: 'red' }}>*</span>}
          </Typography>

          {(error || fieldError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || fieldError?.message}
            </Alert>
          )}

          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, field)}
            sx={{
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : '#ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backgroundColor: dragActive ? 'rgba(25, 103, 210, 0.05)' : 'transparent',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <input
              type="file"
              multiple={isMultiple}
              accept={config.acceptedFormats?.map((f) => `.${f}`).join(',')}
              onChange={(e) => handleFileSelect(e, field)}
              style={{ display: 'none' }}
              id={`file-input-${questionId}`}
              disabled={uploading}
            />

            <label
              htmlFor={`file-input-${questionId}`}
              style={{ display: 'block', cursor: uploading ? 'not-allowed' : 'pointer' }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                Drag & drop files here or click to select
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Max file size: {config.maxFileSize || MAX_FILE_SIZE_DEFAULT}MB
                {config.acceptedFormats && ` • Formats: ${config.acceptedFormats.join(', ')}`}
              </Typography>
            </label>
          </Box>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" sx={{ mt: 1 }}>
                {uploadProgress}%
              </Typography>
            </Box>
          )}

          {/* Display uploaded files */}
          {((isMultiple ? field.value as FileUploadAnswerDTO[] : [field.value]) || []).map(
            (file: FileUploadAnswerDTO | null, index: number) =>
              file && (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1}
                  sx={{ 
                    mt: 2, 
                    p: 1, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 1,
                    alignItems: 'center' 
                  }}
                >
                  {file.mimeType?.startsWith('image') ? (
                    <ImageIcon fontSize="small" />
                  ) : (
                    <DescriptionIcon fontSize="small" />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{file.fileName}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {(file.fileSize / 1024 / 1024).toFixed(2)}MB •{' '}
                      {new Date(file.uploadedAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (isMultiple) {
                        field.onChange(
                          (field.value as FileUploadAnswerDTO[]).filter((_, i) => i !== index)
                        );
                      } else {
                        field.onChange(null);
                      }
                    }}
                    disabled={uploading}
                  >
                    Remove
                  </Button>
                </Stack>
              )
          )}
        </Paper>
      )}
    />
  );
};
