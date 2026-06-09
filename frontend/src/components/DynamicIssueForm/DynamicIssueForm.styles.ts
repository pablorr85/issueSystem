import styled from 'styled-components';
import { Card, FormControl, TextField, Button, Typography, Box, Checkbox, FormControlLabel } from '@mui/material';
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

export const StyledTextField = styled(TextField)`
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

