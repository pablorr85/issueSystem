import React, { useState, useEffect } from 'react';
import { InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { TenantConfig, IssuePayload } from '../../services/types';
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
  StyledErrorText
} from './DynamicIssueForm.styles';

type CustomFieldValue = string | number | boolean;

export interface DynamicIssueFormProps {
  tenant: TenantConfig;
  onSubmit: (payload: IssuePayload) => Promise<void>;
  submitting: boolean;
}

export const DynamicIssueForm: React.FC<DynamicIssueFormProps> = ({ tenant, onSubmit, submitting }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [extraData, setExtraData] = useState<Record<string, CustomFieldValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize extraData fields based on tenant's CustomFields
  useEffect(() => {
    const initialExtra: Record<string, CustomFieldValue> = {};
    (tenant.custom_fields || []).forEach(field => {
      if (field.field_type === 'boolean') {
        initialExtra[field.name] = false;
      } else {
        initialExtra[field.name] = '';
      }
    });
    setExtraData(initialExtra);
    setErrors({});
  }, [tenant]);

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
      description: description.trim(),
      photo_url: photoUrl.trim() || undefined,
      extra_data: processedExtra
    };

    onSubmit(payload).then(() => {
      // Reset form on success
      setDescription('');
      setPhotoUrl('');
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
      <FormTitle variant="h5" component="h2">
        <TitleIcon />
        {t('dynamicIssueForm.title', { name: tenant.name })}
      </FormTitle>

      <FormContainer onSubmit={handleSubmit} noValidate>
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

        {/* Photo URL */}
        <StyledTextField
          label={t('dynamicIssueForm.photoLabel')}
          variant="outlined"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          disabled={submitting}
        />

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
                      {field.options?.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
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
          {submitting ? t('dynamicIssueForm.submitting') : t('dynamicIssueForm.button')}
        </SubmitButton>
      </FormContainer>
    </StyledCard>
  );
};
