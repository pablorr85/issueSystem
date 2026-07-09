import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Alert, DialogContent } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { addTaskLog } from "../../services/api";
import {
  StyledDialog,
  StyledDialogTitle,
  FormContainer,
  StyledTextField,
  PhotoSectionHeader,
  HiddenFileInput,
  UploadZone,
  PreviewContainer,
  ImagePreview,
  RemoveImageButton,
  MetricInputsGrid,
  StyledDialogActions,
  CancelButton,
  SubmitButton,
} from "./CompletionReportModal.styles";

export interface CompletionReportModalProps {
  open: boolean;
  issueId: number;
  token?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CompletionReportModal: React.FC<CompletionReportModalProps> = ({
  open,
  issueId,
  token,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [timeSpent, setTimeSpent] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setComment("");
      setCost("");
      setTimeSpent("");
      setImageFile(null);
      setImagePreview(null);
      setError(null);
    }
  }, [open]);

  // Clean up blob url on unmount or reset
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

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      setError(t("logbook.photoRequired", "Photo upload is required to mark task as done."));
      return;
    }

    setSubmitting(true);
    setError(null);

    const costVal = cost.trim() !== "" ? parseFloat(cost) : undefined;
    const timeVal = timeSpent.trim() !== "" ? parseFloat(timeSpent) : undefined;
    const defaultText = t("logbook.defaultResolveComment", "Task resolved and closed.");

    try {
      await addTaskLog(
        issueId,
        {
          text: comment.trim() || defaultText,
          cost: costVal,
          time_spent_hours: timeVal,
          image: imageFile,
          close_task: true,
        },
        token,
      );
      setSubmitting(false);
      onSuccess();
    } catch (err: unknown) {
      console.error(err);
      setError(t("comments.errorAdd", "Failed to resolve task. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} aria-labelledby="completion-modal-title">
      <StyledDialogTitle id="completion-modal-title">
        <CheckCircleIcon sx={{ color: "#81c784" }} />
        {t("operatorHub.resolveTitle", "Completion Report")}
      </StyledDialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mt: 1, mb: 1, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        <FormContainer>
          {/* Photo upload - REQUIRED */}
          <div>
            <PhotoSectionHeader>
              {t("logbook.completionPhoto", "Proof of Work Photo")} *
            </PhotoSectionHeader>
            <HiddenFileInput
              type="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              accept="image/*"
              capture="environment"
              data-testid="completion-file-input"
            />
            {!imagePreview ? (
              <UploadZone
                onClick={() => fileInputRef.current?.click()}
                data-testid="completion-upload-zone"
              >
                <CameraAltIcon sx={{ fontSize: 32, color: "var(--primary)" }} />
                <span>
                  {t("logbook.tapToCapture", "Tap to Take Photo or Upload")}
                </span>
              </UploadZone>
            ) : (
              <PreviewContainer>
                <ImagePreview src={imagePreview} alt="Work Done Preview" />
                <RemoveImageButton onClick={handleRemoveImage}>
                  &times;
                </RemoveImageButton>
              </PreviewContainer>
            )}
          </div>

          {/* Comment - OPTIONAL */}
          <StyledTextField
            label={t("logbook.commentPlaceholder", "Final comment or notes (optional)")}
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            fullWidth
            variant="outlined"
            slotProps={{
              htmlInput: { "data-testid": "completion-comment-input" }
            }}
          />

          {/* Metrics - OPTIONAL */}
          <MetricInputsGrid>
            <StyledTextField
              label={t("logbook.costLabel", "Cost (€)")}
              type="number"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              disabled={submitting}
              variant="outlined"
              slotProps={{
                htmlInput: { "data-testid": "completion-cost-input", step: "0.01", min: "0" }
              }}
            />
            <StyledTextField
              label={t("logbook.timeLabel", "Hours Spent")}
              type="number"
              placeholder="0.0"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              disabled={submitting}
              variant="outlined"
              slotProps={{
                htmlInput: { "data-testid": "completion-time-input", step: "0.1", min: "0" }
              }}
            />
          </MetricInputsGrid>
        </FormContainer>
      </DialogContent>

      <StyledDialogActions>
        <CancelButton onClick={onClose} disabled={submitting} data-testid="completion-cancel-btn">
          {t("dashboard.cancel", "Cancel")}
        </CancelButton>
        <SubmitButton
          onClick={handleSubmit}
          disabled={submitting || !imageFile}
          variant="contained"
          data-testid="completion-submit-btn"
        >
          {submitting ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : (
            t("operatorHub.submitCompletion", "Submit & Close Task")
          )}
        </SubmitButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};
