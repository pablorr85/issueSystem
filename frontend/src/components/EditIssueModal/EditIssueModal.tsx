import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { updateIssue } from '../../services/api';
import type { Issue, Operator, TenantConfig, CustomField } from '../../services/types';

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    background: rgba(30, 30, 45, 0.85) !important;
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 20px !important;
    color: white !important;
    width: 100%;
    max-width: 550px !important;
    padding: 10px;
    box-shadow: 0 16px 48px 0 rgba(0, 0, 0, 0.5) !important;
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  font-weight: 700 !important;
  font-family: var(--font-sans) !important;
  font-size: 1.3rem !important;
  color: white !important;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 16px !important;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

const StyledTextField = styled(TextField)`
  & .MuiInputLabel-root {
    color: #a09cb4 !important;
  }
  & .MuiOutlinedInput-root {
    color: white !important;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    & fieldset {
      border-color: rgba(255, 255, 255, 0.1);
    }
    &:hover fieldset {
      border-color: var(--primary, HSL(260, 85%, 60%));
    }
    &.Mui-focused fieldset {
      border-color: var(--primary, HSL(260, 85%, 60%));
    }
  }
`;

const StyledFormControl = styled(FormControl)`
  & .MuiInputLabel-root {
    color: #a09cb4 !important;
  }
  & .MuiOutlinedInput-root {
    color: white !important;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    & fieldset {
      border-color: rgba(255, 255, 255, 0.1);
    }
    &:hover fieldset {
      border-color: var(--primary, HSL(260, 85%, 60%));
    }
    &.Mui-focused fieldset {
      border-color: var(--primary, HSL(260, 85%, 60%));
    }
  }
  & .MuiSelect-icon {
    color: #a09cb4 !important;
  }
`;

const StyledDialogActions = styled(DialogActions)`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 16px !important;
  gap: 12px;
`;

const ActionButton = styled(Button)`
  font-family: var(--font-sans) !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 10px 20px !important;
  border-radius: 12px !important;
`;

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
  
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when a new issue is loaded
    setDescription(issue.description);
    setStatusVal(issue.status);
    setAssignedTo(issue.assigned_to !== null && issue.assigned_to !== undefined ? String(issue.assigned_to) : '');
    setExtraData(issue.extra_data || {});
    setError(null);
  }, [issue]);

  const handleDynamicFieldChange = (name: string, value: unknown) => {
    setExtraData(prev => ({
      ...prev,
      [name]: value
    }));
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
      const payload = {
        description,
        status: statusVal,
        assigned_to: operatorId,
        extra_data: extraData
      };
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
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            fullWidth
            variant="outlined"
            slotProps={{
              htmlInput: { 'data-testid': 'edit-description-input' }
            }}
          />

          {/* Status field */}
          <StyledFormControl fullWidth variant="outlined">
            <InputLabel id="edit-status-label">{t('dashboard.tableStatus', 'Status')}</InputLabel>
            <Select
              labelId="edit-status-label"
              value={statusVal}
              label={t('dashboard.tableStatus', 'Status')}
              onChange={(e) => setStatusVal(e.target.value as string)}
              disabled={saving}
              slotProps={{
                input: { 'data-testid': 'edit-status-select' }
              }}
            >
              <MenuItem value="pending">{t('dashboard.filterPending', 'Pending')}</MenuItem>
              <MenuItem value="in_progress">{t('dashboard.filterInProgress', 'In Progress')}</MenuItem>
              <MenuItem value="resolved">{t('dashboard.filterResolved', 'Resolved')}</MenuItem>
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
              slotProps={{
                input: { 'data-testid': 'edit-operator-select' }
              }}
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
              <Typography variant="subtitle2" sx={{ color: '#a09cb4', mb: 2, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                {t('dynamicIssueForm.detailsHeader', 'Tenant Specific Details')}
              </Typography>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                        label={<span style={{ color: 'white', fontSize: '0.95rem' }}>{label}</span>}
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
              </div>
            </div>
          )}
        </FormContainer>
      </DialogContent>

      <StyledDialogActions>
        <ActionButton onClick={onClose} disabled={saving} sx={{ color: 'rgba(255,255,255,0.6) !important' }}>
          {t('dashboard.cancel', 'Cancel')}
        </ActionButton>
        <ActionButton
          onClick={handleSave}
          disabled={saving}
          variant="contained"
          sx={{
            background: 'var(--primary) !important',
            color: 'white !important',
            minWidth: 120,
            '&:hover': {
              background: 'var(--primary-hover) !important'
            }
          }}
          data-testid="save-edit-btn"
        >
          {saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('dashboard.saveChanges', 'Save Changes')}
        </ActionButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};
