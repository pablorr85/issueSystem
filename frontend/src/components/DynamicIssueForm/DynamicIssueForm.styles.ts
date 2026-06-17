import styled from 'styled-components';
import React from 'react';
import { Card, FormControl, TextField, Button, Typography, Box, Checkbox, FormControlLabel } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

export const StyledCard = styled(Card)`
  padding: 24px;
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
  color: white !important;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 24px;
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const StyledFormControl = styled(FormControl)`
  width: 100%;
  
  & .MuiInputLabel-root {
    color: #a09cb4 !important;
    &.Mui-focused {
      color: var(--primary) !important;
    }
  }

  & .MuiOutlinedInput-root {
    color: white !important;
    background-color: rgba(255, 255, 255, 0.05);
    
    & fieldset {
      border-color: rgba(255, 255, 255, 0.08) !important;
    }
    
    &:hover fieldset {
      border-color: rgba(255, 255, 255, 0.2) !important;
    }
    
    &.Mui-focused fieldset {
      border-color: var(--primary) !important;
    }
  }

  & .MuiSelect-icon {
    color: #a09cb4 !important;
  }
`;

const StyledTextFieldComponent = styled(TextField)`
  width: 100%;

  & .MuiOutlinedInput-root {
    color: white;
    background-color: rgba(255, 255, 255, 0.05);
    
    & fieldset {
      border-color: rgba(255, 255, 255, 0.08);
    }
    
    &:hover fieldset {
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    &.Mui-focused fieldset {
      border-color: var(--primary);
    }
  }

  & .MuiInputLabel-root {
    color: #a09cb4;
    
    &.Mui-focused {
      color: var(--primary);
    }
  }

  & .MuiFormHelperText-root {
    color: #ff6b6b !important;
    font-size: 0.9rem;
    margin-left: 0;
  }
`;

export const StyledTextField = StyledTextFieldComponent as React.ComponentType<TextFieldProps>;

export const SubmitButton = styled(Button)`
  height: 50px !important;
  background-color: var(--primary) !important;
  text-transform: none !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  padding: 0 24px !important;
  margin-top: 10px !important;

  &:hover {
    background-color: var(--primary-hover) !important;
  }

  &:disabled {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.3) !important;
  }
`;

export const FormTitle = styled(Typography)`
  font-weight: 600 !important;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
`;

export const TitleIcon = styled(ReportProblemIcon)`
  color: var(--primary) !important;
`;

export const DynamicFieldsContainer = styled(Box)`
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding-top: 20px !important;
`;

export const SectionSubtitle = styled(Typography)`
  color: var(--text-secondary) !important;
  font-weight: 600 !important;
`;

export const StyledCheckbox = styled(Checkbox)`
  color: rgba(255, 255, 255, 0.3) !important;
  
  &.Mui-checked {
    color: var(--primary) !important;
  }
`;

export const StyledFormControlLabel = styled(FormControlLabel)`
  color: white !important;
`;

export const StyledErrorText = styled.p`
  color: #ff6b6b !important;
  font-size: 0.9rem !important;
  margin: 4px 0 0 0 !important;
`;

export const UploadZone = styled.div<{ $isDragActive?: boolean }>`
  border: 2px dashed ${props => props.$isDragActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)'};
  background: ${props => props.$isDragActive ? 'rgba(var(--primary-hue), 85%, 60%, 0.08)' : 'rgba(255, 255, 255, 0.02)'};
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 8px;

  &:hover {
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.04);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const UploadIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #a09cb4;
  transition: color 0.3s;

  ${UploadZone}:hover & {
    color: var(--primary);
  }
`;

export const PreviewContainer = styled.div`
  position: relative;
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  aspect-ratio: 16/9;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  animation: fadeIn 0.3s ease forwards;
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const RemoveButton = styled(Button)`
  position: absolute !important;
  top: 10px !important;
  right: 10px !important;
  background: rgba(0, 0, 0, 0.6) !important;
  color: white !important;
  min-width: unset !important;
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  backdrop-filter: blur(4px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  
  &:hover {
    background: rgba(255, 0, 0, 0.8) !important;
    border-color: rgba(255, 0, 0, 1) !important;
  }
`;

export const UploadText = styled(Typography)`
  color: white !important;
  font-weight: 500 !important;
`;

export const UploadCaption = styled(Typography)`
  color: #a09cb4 !important;
`;


