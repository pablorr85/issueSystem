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
  FormControlLabel,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import { updateIssue, getIssue, getZones } from '../../services/api';
import type { Issue, Operator, TenantConfig, CustomField, Zone } from '../../services/types';
import { TaskLogbook } from '../TaskLogbook/TaskLogbook';
import { WorkOrderPrintView } from '../WorkOrderPrintView';
import { normalizeOptions } from '../../utils/options';
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
  PhotoSectionHeader,
  ExtraFieldsContainer,
  CheckboxLabelSpan,
  HiddenFileInput,
  UploadTitle,
  CancelButton,
  SaveButton,
  LightboxOverlay,
  LightboxImage,
  LightboxCloseButton,
  ResolutionInfo
} from './EditIssueModal.styles';

export interface EditIssueModalProps {
  open: boolean;
  issue: Issue;
  tenant: TenantConfig;
  operators: Operator[];
  onClose: (updatedIssue?: Issue) => void;
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
  const [title, setTitle] = useState<string>(issue.title || '');
  const [description, setDescription] = useState<string>(issue.description);
  const [qaChecklist, setQaChecklist] = useState<string>(issue.qa_checklist || '');
  const [statusVal, setStatusVal] = useState<string>(issue.status);
  const [assignedTo, setAssignedTo] = useState<string>(
    issue.assigned_to !== null && issue.assigned_to !== undefined ? String(issue.assigned_to) : ''
  );
  const [zoneVal, setZoneVal] = useState<string>(
    issue.zone !== null && issue.zone !== undefined ? String(issue.zone) : ''
  );
  const [zones, setZones] = useState<Zone[]>(tenant.zones || []);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);
  
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

  const [currentIssue, setCurrentIssue] = useState<Issue>(issue);
  const [prevIssueId, setPrevIssueId] = useState<number>(issue.id);

  useEffect(() => {
    if (typeof getZones === 'function') {
      getZones()
        .then(res => setZones(res || []))
        .catch(err => console.error("Failed to fetch zones:", err));
    }
  }, []);

  const fetchUpdatedIssue = async () => {
    try {
      const updated = await getIssue(issue.id);
      setCurrentIssue(updated);
    } catch (err) {
      console.error("Failed to refetch issue details:", err);
    }
  };

  if (issue.id !== prevIssueId) {
    setPrevIssueId(issue.id);
    setCurrentIssue(issue);
    setTitle(issue.title || '');
    setDescription(issue.description);
    setQaChecklist(issue.qa_checklist || '');
    setStatusVal(issue.status);
    setAssignedTo(issue.assigned_to !== null && issue.assigned_to !== undefined ? String(issue.assigned_to) : '');
    setZoneVal(issue.zone !== null && issue.zone !== undefined ? String(issue.zone) : '');
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

  const handleLoadDefaultChecklist = () => {
    const defaults = [
      t('workOrder.defaultChecklist1', 'Cleanliness: Work area cleaned, sanitized, and clear of debris or tools.'),
      t('workOrder.defaultChecklist2', 'Functionality: Operation and functional checks successfully completed.'),
      t('workOrder.defaultChecklist3', 'Safety: Covers, guards, and safety components reinstalled and verified.'),
      t('workOrder.defaultChecklist4', 'Visual Inspection: Aesthetic finish and structural condition approved.')
    ].join('\n');
    setQaChecklist(defaults);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError(t('dynamicIssueForm.titleRequired', 'Title is required.'));
      return;
    }
    if (!description.trim()) {
      setError(t('dynamicIssueForm.descriptionRequired', 'Description is required.'));
      return;
    }

    setSaving(true);
    setError(null);

    const operatorId = assignedTo === '' ? null : Number(assignedTo);
    const selectedZoneId = zoneVal === '' ? null : Number(zoneVal);

    try {
      const payload: {
        title: string;
        description: string;
        qa_checklist: string;
        status: string;
        assigned_to: number | null;
        zone: number | null;
        extra_data: Record<string, unknown>;
        image?: File | null;
      } = {
        title: title.trim(),
        description,
        qa_checklist: qaChecklist,
        status: statusVal,
        assigned_to: operatorId,
        zone: selectedZoneId,
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
    <StyledDialog open={open} onClose={() => onClose(currentIssue)} aria-labelledby="edit-issue-dialog-title">
      {showPrintView && (
        <WorkOrderPrintView
          issue={{
            ...currentIssue,
            title,
            description,
            qa_checklist: qaChecklist,
            status: statusVal as Issue['status'],
            zone_name: zones.find(z => String(z.id) === zoneVal)?.name || currentIssue.zone_name
          }}
          tenantName={tenant.name}
          onClose={() => setShowPrintView(false)}
        />
      )}
      <StyledDialogTitle id="edit-issue-dialog-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EditIcon sx={{ color: 'var(--primary)' }} />
          <span>{t('dashboard.editIssue', 'Edit Issue')} {currentIssue.order_number ? `(${currentIssue.order_number})` : `#${currentIssue.id}`}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', fontWeight: 600, marginRight: '16px' }}>
          {currentIssue.total_cost !== null && currentIssue.total_cost !== undefined && (
            <span style={{ color: '#81c784', background: 'rgba(129, 199, 132, 0.15)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(129, 199, 132, 0.3)' }}>
              Cost: {parseFloat(String(currentIssue.total_cost)).toFixed(2)} €
            </span>
          )}
          {currentIssue.total_time_spent_hours !== null && currentIssue.total_time_spent_hours !== undefined && (
            <span style={{ color: '#64b5f6', background: 'rgba(100, 181, 246, 0.15)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(100, 181, 246, 0.3)' }}>
              Time: {parseFloat(String(currentIssue.total_time_spent_hours)).toFixed(1)} h
            </span>
          )}
        </div>
      </StyledDialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 1, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <FormContainer>
          {/* Title field */}
          <StyledTextField
            label={t('dynamicIssueForm.titleLabel', 'Short Summary') + ' *'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            fullWidth
            variant="outlined"
            slotProps={{
              htmlInput: { 'data-testid': 'edit-title-input', maxLength: 100 }
            }}
          />

          {/* Zone Selection */}
          <StyledFormControl fullWidth variant="outlined">
            <InputLabel id="edit-zone-label">{t('workOrder.zoneLabel', 'Zone / Facility Area')}</InputLabel>
            <Select
              labelId="edit-zone-label"
              value={zoneVal}
              label={t('workOrder.zoneLabel', 'Zone / Facility Area')}
              onChange={(e) => setZoneVal(e.target.value as string)}
              disabled={saving}
              displayEmpty
              inputProps={{ 'data-testid': 'edit-zone-select' }}
            >
              <MenuItem value="">
                <em>{t('workOrder.unassignedZone', 'General Facility')}</em>
              </MenuItem>
              {zones.map((z) => (
                <MenuItem key={z.id} value={String(z.id)}>
                  {z.name}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>

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

          {/* QA Verification Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #c5c2d9)' }}>
                {t('workOrder.qaChecklistLabel', 'QA Verification Checklist (one step per line)')}
              </span>
              <Button
                size="small"
                onClick={handleLoadDefaultChecklist}
                style={{ fontSize: '0.75rem', textTransform: 'none', color: 'var(--primary)' }}
                data-testid="load-default-checklist-btn"
              >
                + {t('workOrder.loadDefaultChecklist', 'Load Default Checklist (DoD)')}
              </Button>
            </div>
            <StyledTextField
              multiline
              rows={3}
              value={qaChecklist}
              onChange={(e) => setQaChecklist(e.target.value)}
              disabled={saving}
              fullWidth
              variant="outlined"
              helperText={t('workOrder.qaChecklistHelper', 'Write custom verification steps separated by line breaks')}
              slotProps={{
                htmlInput: { 'data-testid': 'edit-qa-checklist-input' }
              }}
            />
          </div>
          
          {/* Photo/Evidence Upload */}
          <div>
            <PhotoSectionHeader variant="subtitle2">
              {t('dynamicIssueForm.photoLabel', 'Evidence Photo')}
            </PhotoSectionHeader>
            
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
              <MenuItem value="qa">{t('dashboard.kanbanQA', 'Verification (QA)')}</MenuItem>
              <MenuItem value="resolved">{t('dashboard.filterResolved', 'Resolved')}</MenuItem>
              <MenuItem value="blocked">{t('dashboard.filterBlocked', 'Blocked')}</MenuItem>
              <MenuItem value="wont_fix">{t('dashboard.actionWontFix', 'Wont Fix')}</MenuItem>
            </Select>
          </StyledFormControl>

          {/* Resolution Time Info */}
          {(statusVal === 'resolved' || statusVal === 'wont_fix') && issue.resolved_at && statusVal === issue.status && (
            <ResolutionInfo>
              <strong>{t('dashboard.resolvedAtLabel', 'Resolved at:')}</strong>{' '}
              {new Date(issue.resolved_at).toLocaleString()}
            </ResolutionInfo>
          )}

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
                          {normalizeOptions(field.options).map(({ value, label }) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
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

          <TaskLogbook issueId={issue.id} onLogAdded={fetchUpdatedIssue} />
        </FormContainer>
      </DialogContent>

      <StyledDialogActions style={{ justifyContent: 'space-between', width: '100%', padding: '16px 24px' }}>
        <Button
          onClick={() => setShowPrintView(true)}
          startIcon={<PrintIcon />}
          variant="outlined"
          color="primary"
          data-testid="open-print-order-btn"
        >
          {t('workOrder.printButton', 'Print Work Order')}
        </Button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <CancelButton onClick={() => onClose(currentIssue)} disabled={saving}>
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
        </div>
      </StyledDialogActions>
      {lightboxImage && (
        <LightboxOverlay onClick={() => setLightboxImage(null)} data-testid="lightbox-overlay">
          <LightboxImage src={lightboxImage} alt="Fullscreen Preview" />
          <LightboxCloseButton onClick={() => setLightboxImage(null)}>&times;</LightboxCloseButton>
        </LightboxOverlay>
      )}

      {showPrintView && (
        <WorkOrderPrintView
          issue={currentIssue}
          onClose={() => setShowPrintView(false)}
        />
      )}
    </StyledDialog>
  );
};
