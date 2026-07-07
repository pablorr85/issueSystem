import React, { useState, useRef, useEffect } from 'react';
import { InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TenantConfig, IssuePayload } from '../../services/types';
import { normalizeOptions } from '../../utils/options';
import {
  StyledCard,
  FormContainer,
  StyledTextField,
  StyledFormControl,
  SubmitButton,
  FormTitle,
  TitleIcon,
  DynamicFieldsContainer,
  SectionSubtitle,
  StyledCheckbox,
  StyledFormControlLabel,
  StyledErrorText,
  UploadZone,
  UploadIcon,
  PreviewContainer,
  PreviewImage,
  RemoveButton,
  UploadText,
  UploadCaption,
  HiddenInput,
  ButtonCircularProgress
} from './DynamicIssueForm.styles';

type CustomFieldValue = string | number | boolean;

export interface DynamicIssueFormProps {
  tenant: TenantConfig;
  onSubmit: (payload: IssuePayload) => Promise<void>;
  submitting: boolean;
}

const getInitialExtraData = (tenant: TenantConfig): Record<string, CustomFieldValue> => {
  const initialExtra: Record<string, CustomFieldValue> = {};
  (tenant.custom_fields || []).forEach(field => {
    if (field.field_type === 'boolean') {
      initialExtra[field.name] = false;
    } else {
      initialExtra[field.name] = '';
    }
  });
  return initialExtra;
};

export const DynamicIssueForm: React.FC<DynamicIssueFormProps> = ({ tenant, onSubmit, submitting }) => {
  const { t } = useTranslation();
  const [prevTenant, setPrevTenant] = useState<TenantConfig>(tenant);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extraData, setExtraData] = useState<Record<string, CustomFieldValue>>(() => getInitialExtraData(tenant));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onZoneClick = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (tenant !== prevTenant) {
    setPrevTenant(tenant);
    setExtraData(getInitialExtraData(tenant));
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
    setTitle('');
  }

  const handleExtraChange = (name: string, value: CustomFieldValue) => {
    setExtraData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = t('dynamicIssueForm.titleRequired');
    }

    if (!description.trim()) {
      newErrors.description = t('dynamicIssueForm.descriptionRequired');
    }

    (tenant.custom_fields || []).forEach(field => {
      const value = extraData[field.name];
      if (field.required) {
        if (value === undefined || value === null || value === '') {
          newErrors[field.name] = t('dynamicIssueForm.fieldRequired', { name: field.name });
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Convert types for dynamic fields if necessary (e.g. number)
    const processedExtra: Record<string, CustomFieldValue> = {};
    (tenant.custom_fields || []).forEach(field => {
      const val = extraData[field.name];
      if (field.field_type === 'number' && val !== '') {
        processedExtra[field.name] = Number(val);
      } else {
        processedExtra[field.name] = val;
      }
    });

    const payload: IssuePayload = {
      tenant_id: tenant.id,
      title: title.trim(),
      description: description.trim(),
      image: imageFile,
      extra_data: processedExtra
    };

    onSubmit(payload).then(() => {
      // Reset form on success
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      const resetExtra: Record<string, CustomFieldValue> = {};
      (tenant.custom_fields || []).forEach(field => {
        if (field.field_type === 'boolean') {
          resetExtra[field.name] = false;
        } else {
          resetExtra[field.name] = '';
        }
      });
      setExtraData(resetExtra);
    });
  };

  return (
    <StyledCard className="animate-fade-in">
      <FormTitle variant="h5" as="h2">
        <TitleIcon />
        {t('dynamicIssueForm.title', { name: tenant.name })}
      </FormTitle>

      <FormContainer onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <StyledTextField
          label={t('dynamicIssueForm.titleLabel')}
          variant="outlined"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors(prev => {
                const next = { ...prev };
                delete next.title;
                return next;
              });
            }
          }}
          disabled={submitting}
          error={!!errors.title}
          helperText={errors.title}
          required
          slotProps={{
            htmlInput: { 'data-testid': 'title-input', maxLength: 100 }
          }}
        />

        {/* Description */}
        <StyledTextField
          label={t('dynamicIssueForm.descriptionLabel')}
          variant="outlined"
          multiline
          rows={3}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) {
              setErrors(prev => {
                const next = { ...prev };
                delete next.description;
                return next;
              });
            }
          }}
          disabled={submitting}
          error={!!errors.description}
          helperText={errors.description}
          required
        />

        {/* File input and upload zone with preview */}
        <div>
          <HiddenInput
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            accept="image/*"
            capture="environment"
            data-testid="file-input"
          />
          
          {!imagePreview ? (
            <UploadZone
              $isDragActive={isDragActive}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={onZoneClick}
              data-testid="upload-zone"
            >
              <UploadIcon>
                <CloudUploadIcon />
              </UploadIcon>
              <UploadText variant="body1">
                {t('dynamicIssueForm.dragDropText', 'Drag and drop an image here, or click to browse')}
              </UploadText>
              <UploadCaption variant="caption">
                {t('dynamicIssueForm.fileSizeLimit', 'Supports PNG, JPG, GIF up to 5MB')}
              </UploadCaption>
            </UploadZone>
          ) : (
            <PreviewContainer data-testid="preview-container">
              <PreviewImage src={imagePreview} alt="Selected preview" />
              <RemoveButton
                onClick={removeSelectedImage}
                data-testid="remove-image-button"
              >
                <DeleteIcon />
              </RemoveButton>
            </PreviewContainer>
          )}
        </div>

        {/* Dynamic Fields */}
        {(tenant.custom_fields || []).length > 0 && (
          <DynamicFieldsContainer>
            <SectionSubtitle variant="subtitle1">
              {t('dynamicIssueForm.detailsHeader')}
            </SectionSubtitle>

            {(tenant.custom_fields || []).map(field => {
              const hasError = !!errors[field.name];
              const helperText = errors[field.name];

              if (field.field_type === 'boolean') {
                return (
                  <StyledFormControlLabel
                    key={field.name}
                    control={
                      <StyledCheckbox
                        checked={!!extraData[field.name]}
                        onChange={(e) => handleExtraChange(field.name, e.target.checked)}
                        disabled={submitting}
                      />
                    }
                    label={`${field.name}${field.required ? ' *' : ''}`}
                  />
                );
              }

              if (field.field_type === 'select') {
                return (
                  <StyledFormControl key={field.name} error={hasError} required={field.required}>
                    <InputLabel id={`label-${field.name}`}>{field.name}</InputLabel>
                    <Select
                      labelId={`label-${field.name}`}
                      value={extraData[field.name] || ''}
                      label={field.name}
                      onChange={(e) => handleExtraChange(field.name, e.target.value)}
                      disabled={submitting}
                      inputProps={{ 'data-testid': `select-${field.name}` }}
                    >
                      <MenuItem value="">
                        <em>{t('dynamicIssueForm.none')}</em>
                      </MenuItem>
                      {normalizeOptions(field.options).map(({ value, label }) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                      ))}
                    </Select>
                    {hasError && (
                      <StyledErrorText>
                        ⚠️ {helperText}
                      </StyledErrorText>
                    )}
                  </StyledFormControl>
                );
              }

              return (
                <StyledTextField
                  key={field.name}
                  label={field.name}
                  type={field.field_type === 'number' ? 'number' : 'text'}
                  value={extraData[field.name] || ''}
                  onChange={(e) => handleExtraChange(field.name, e.target.value)}
                  disabled={submitting}
                  error={hasError}
                  helperText={helperText}
                  required={field.required}
                />
              );
            })}
          </DynamicFieldsContainer>
        )}

        <SubmitButton
          type="submit"
          variant="contained"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <ButtonCircularProgress size={20} color="inherit" />
              {t('dynamicIssueForm.submitting')}
            </>
          ) : (
            t('dynamicIssueForm.button')
          )}
        </SubmitButton>
      </FormContainer>
    </StyledCard>
  );
};
