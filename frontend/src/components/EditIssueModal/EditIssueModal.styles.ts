import styled from 'styled-components';
import { Dialog, DialogTitle, DialogActions, Button, TextField, FormControl } from '@mui/material';

export const StyledDialog = styled(Dialog)`
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

export const StyledDialogTitle = styled(DialogTitle)`
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

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

export const StyledTextField = styled(TextField)`
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

export const StyledFormControl = styled(FormControl)`
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

export const StyledDialogActions = styled(DialogActions)`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 16px !important;
  gap: 12px;
`;

export const ActionButton = styled(Button)`
  font-family: var(--font-sans) !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 10px 20px !important;
  border-radius: 12px !important;
`;

export const UploadZone = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.04);
  }
`;

export const PreviewContainer = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  aspect-ratio: 16/9;
  max-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0d0d15;
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(239, 83, 80, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: #ef5350;
    transform: scale(1.05);
  }
`;
