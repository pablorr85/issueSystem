import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogContent,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateIssue } from '../../services/api';
import type { Issue, Operator, TenantConfig, CustomField } from '../../services/types';
import { IssueComments } from '../IssueComments/IssueComments';
import {
  StyledDialog,
  StyledDialogTitle,
  FormContainer,
  StyledTextField,
  StyledFormControl,
  StyledDialogActions,
  UploadZone,
  PreviewContainer,
  PreviewImage,
  RemoveButton,
  CustomFieldsHeader,
  ExtraFieldsContainer,
  CheckboxLabelSpan,
  HiddenFileInput,
  UploadTitle,
  CancelButton,
  SaveButton,
  LightboxOverlay,
  LightboxImage,
  LightboxCloseButton
} from './EditIssueModal.styles';

export interface EditIssueModalProps {
  open: boolean;
  issue: Issue;
  tenant: TenantConfig;
  operators: Operator[];
  onClose: () => void;
  onSuccess: (updatedIssue: Issue) => void;
}

export const EditIssueModal: React.FC<EditIssueModalProps> = ({
  open,
  issue,
  tenant,
  operators,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState<string>(issue.description);
  const [statusVal, setStatusVal] = useState<string>(issue.status);
  const [assignedTo, setAssignedTo] = useState<string>(
    issue.assigned_to !== null && issue.assigned_to !== undefined ? String(issue.assigned_to) : ''
  );
  
  // Dynamic fields state
  const [extraData, setExtraData] = useState<Record<string, unknown>>(issue.extra_data || {});
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(issue.image || null);
  const [imageChanged, setImageChanged] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [prevIssueId, setPrevIssueId] = useState<number>(issue.id);

  if (issue.id !== prevIssueId) {
    setPrevIssueId(issue.id);
    setDescription(issue.description);
    setStatusVal(issue.status);
    setAssignedTo(issue.assigned_to !== null && issue.assigned_to !== undefined ? String(issue.assigned_to) : '');
    setExtraData(issue.extra_data || {});
    setImageFile(null);
    setImagePreview(issue.image || null);
    setImageChanged(false);
    setError(null);
  }

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleDynamicFieldChange = (name: string, value: unknown) => {
    setExtraData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
    setImageChanged(true);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const removeSelectedImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    setImageChanged(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      setError(t('dynamicIssueForm.descriptionRequired', 'Description is required.'));
      return;
    }

    setSaving(true);
    setError(null);

    const operatorId = assignedTo === '' ? null : Number(assignedTo);

    try {
      const payload: {
        description: string;
        status: string;
        assigned_to: number | null;
        extra_data: Record<string, unknown>;
        image?: File | null;
      } = {
        description,
        status: statusVal,
        assigned_to: operatorId,
        extra_data: extraData
      };

      if (imageChanged) {
        payload.image = imageFile;
      }

      const updated = await updateIssue(issue.id, payload);
      setSaving(false);
      onSuccess(updated);
    } catch (err: unknown) {
      console.error(err);
      setError(t('dashboard.errorUpdate', 'Failed to update issue. Please try again.'));
      setSaving(false);
    }
  };

  const customFields: CustomField[] = tenant.custom_fields || [];

  return (
    <StyledDialog open={open} onClose={onClose} aria-labelledby="edit-issue-dialog-title">
      <StyledDialogTitle id="edit-issue-dialog-title">
        <EditIcon sx={{ color: 'var(--primary)' }} />
        {t('dashboard.editIssue', 'Edit Issue')} #{issue.id}
      </StyledDialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 1, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <FormContainer>
          {/* Description field */}
          <StyledTextField
            label={t('dashboard.tableDescription', 'Description') + ' *'}
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            fullWidth
            variant="outlined"
            slotProps={{
              htmlInput: { 'data-testid': 'edit-description-input' }
            }}
          />
          
          {/* Photo/Evidence Upload */}
          <div>
            <CustomFieldsHeader variant="subtitle2" style={{ marginBottom: '8px' }}>
              {t('dynamicIssueForm.photoLabel', 'Evidence Photo')}
            </CustomFieldsHeader>
            
            <HiddenFileInput
              type="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              accept="image/*"
              capture="environment"
              data-testid="edit-file-input"
            />
            
            {!imagePreview ? (
              <UploadZone
                onClick={() => fileInputRef.current?.click()}
                data-testid="edit-upload-zone"
              >
                <CloudUploadIcon sx={{ color: 'var(--primary)', fontSize: 32, mb: 1 }} />
                <UploadTitle variant="body2">
                  {t('dynamicIssueForm.dragDropText', 'Click to upload or capture photo')}
                </UploadTitle>
              </UploadZone>
            ) : (
              <PreviewContainer 
                data-testid="edit-preview-container" 
                style={{ cursor: 'zoom-in' }}
                onClick={() => setLightboxImage(imagePreview)}
              >
                <PreviewImage src={imagePreview} alt="Selected preview" />
                <RemoveButton
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedImage(e);
                  }}
                  data-testid="edit-remove-image-button"
                >
                  <DeleteIcon />
                </RemoveButton>
              </PreviewContainer>
            )}
          </div>

          {/* Status field */}
          <StyledFormControl fullWidth variant="outlined">
            <InputLabel id="edit-status-label">{t('dashboard.tableStatus', 'Status')}</InputLabel>
            <Select
              labelId="edit-status-label"
              value={statusVal}
              label={t('dashboard.tableStatus', 'Status')}
              onChange={(e) => setStatusVal(e.target.value as string)}
              disabled={saving}
              inputProps={{ 'data-testid': 'edit-status-select' }}
            >
              <MenuItem value="pending">{t('dashboard.filterPending', 'Pending')}</MenuItem>
              <MenuItem value="in_progress">{t('dashboard.filterInProgress', 'In Progress')}</MenuItem>
              <MenuItem value="resolved">{t('dashboard.filterResolved', 'Resolved')}</MenuItem>
              <MenuItem value="blocked">{t('dashboard.filterBlocked', 'Blocked')}</MenuItem>
            </Select>
          </StyledFormControl>

          {/* Operator field */}
          <StyledFormControl fullWidth variant="outlined">
            <InputLabel id="edit-operator-label">{t('dashboard.tableAssignOperator', 'Assign Operator')}</InputLabel>
            <Select
              labelId="edit-operator-label"
              value={assignedTo}
              label={t('dashboard.tableAssignOperator', 'Assign Operator')}
              onChange={(e) => setAssignedTo(e.target.value as string)}
              disabled={saving}
              displayEmpty
              inputProps={{ 'data-testid': 'edit-operator-select' }}
            >
              <MenuItem value="">
                <em>{t('dashboard.unassigned', 'Unassigned')}</em>
              </MenuItem>
              {operators.map((op) => (
                <MenuItem key={op.id} value={String(op.id)}>
                  {op.username}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>

          {/* Render Dynamic Custom Fields */}
          {customFields.length > 0 && (
            <div>
              <CustomFieldsHeader variant="subtitle2">
                {t('dynamicIssueForm.detailsHeader', 'Tenant Specific Details')}
              </CustomFieldsHeader>
              
              <ExtraFieldsContainer>
                {customFields.map((field) => {
                  const label = field.name.replace(/_/g, ' ') + (field.required ? ' *' : '');
                  const currentVal = extraData[field.name];
 
                  if (field.field_type === 'boolean') {
                    return (
                      <FormControlLabel
                        key={field.name}
                        control={
                          <Switch
                            checked={!!currentVal}
                            onChange={(e) => handleDynamicFieldChange(field.name, e.target.checked)}
                            disabled={saving}
                            color="primary"
                          />
                        }
                        label={<CheckboxLabelSpan>{label}</CheckboxLabelSpan>}
                      />
                    );
                  }

                  if (field.field_type === 'select') {
                    return (
                      <StyledFormControl key={field.name} fullWidth variant="outlined">
                        <InputLabel id={`field-${field.name}-label`}>{label}</InputLabel>
                        <Select
                          labelId={`field-${field.name}-label`}
                          value={currentVal !== undefined ? String(currentVal) : ''}
                          label={label}
                          onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                          disabled={saving}
                        >
                          <MenuItem value="">
                            <em>{t('dynamicIssueForm.none', 'None')}</em>
                          </MenuItem>
                          {field.options.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </StyledFormControl>
                    );
                  }

                  // Number or Text fields
                  return (
                    <StyledTextField
                      key={field.name}
                      label={label}
                      type={field.field_type === 'number' ? 'number' : 'text'}
                      value={currentVal !== undefined && currentVal !== null ? String(currentVal) : ''}
                      onChange={(e) => {
                        const val = field.field_type === 'number' 
                          ? (e.target.value === '' ? '' : Number(e.target.value))
                          : e.target.value;
                        handleDynamicFieldChange(field.name, val);
                      }}
                      disabled={saving}
                      fullWidth
                      variant="outlined"
                    />
                  );
                })}
              </ExtraFieldsContainer>
            </div>
          )}

          <IssueComments issueId={issue.id} />
        </FormContainer>
      </DialogContent>
 
      <StyledDialogActions>
        <CancelButton onClick={onClose} disabled={saving}>
          {t('dashboard.cancel', 'Cancel')}
        </CancelButton>
        <SaveButton
          onClick={handleSave}
          disabled={saving}
          variant="contained"
          data-testid="save-edit-btn"
        >
          {saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('dashboard.saveChanges', 'Save Changes')}
        </SaveButton>
      </StyledDialogActions>
      {lightboxImage && (
        <LightboxOverlay onClick={() => setLightboxImage(null)} data-testid="lightbox-overlay">
          <LightboxImage src={lightboxImage} alt="Fullscreen Preview" />
          <LightboxCloseButton onClick={() => setLightboxImage(null)}>&times;</LightboxCloseButton>
        </LightboxOverlay>
      )}
    </StyledDialog>
  );
};
