import styled from 'styled-components';
import { Dialog, DialogTitle, DialogActions, Button, TextField } from '@mui/material';

export const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    background: #181528 !important;
    color: white !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 16px !important;
    padding: 12px !important;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
    max-width: 480px !important;
    width: 100% !important;
  }
`;

export const StyledDialogTitle = styled(DialogTitle)`
  font-family: inherit !important;
  font-weight: 700 !important;
  font-size: 1.25rem !important;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 16px 24px 8px 24px !important;
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

export const StyledTextField = styled(TextField)`
  .MuiInputLabel-root {
    color: #a09cb4 !important;
    font-family: inherit !important;
  }
  .MuiInputLabel-root.Mui-focused {
    color: var(--primary) !important;
  }
  .MuiOutlinedInput-root {
    color: white !important;
    background: rgba(255, 255, 255, 0.02) !important;
    border-radius: 10px !important;
    font-family: inherit !important;
    
    fieldset {
      border-color: rgba(255, 255, 255, 0.08) !important;
    }
    &:hover fieldset {
      border-color: rgba(255, 255, 255, 0.15) !important;
    }
    &.Mui-focused fieldset {
      border-color: var(--primary) !important;
    }
  }
  
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const PhotoSectionHeader = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #a09cb4;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const UploadZone = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.01);
  transition: border-color 0.2s, background-color 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #a09cb4;
  font-size: 0.85rem;

  &:hover {
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.03);
  }
`;

export const PreviewContainer = styled.div`
  position: relative;
  width: 100%;
  max-height: 180px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const ImagePreview = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

export const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  line-height: 1;

  &:hover {
    background: #ef5350;
  }
`;

export const MetricInputsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const StyledDialogActions = styled(DialogActions)`
  padding: 16px 24px 16px 24px !important;
  gap: 8px !important;
`;

export const CancelButton = styled(Button)`
  color: #a09cb4 !important;
  font-family: inherit !important;
  text-transform: none !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.04) !important;
  }
`;

export const SubmitButton = styled(Button)`
  font-family: inherit !important;
  text-transform: none !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  background: var(--primary) !important;
  color: white !important;
  padding: 8px 16px !important;
  
  &:hover {
    background: var(--primary-hover) !important;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05) !important;
    color: rgba(255, 255, 255, 0.2) !important;
  }
`;
