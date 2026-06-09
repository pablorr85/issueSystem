import styled from 'styled-components';
import { Card, TextField, Button } from '@mui/material';

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
  margin-bottom: 24px;
`;

export const FormContainer = styled.form`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: flex-start;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const StyledTextField = styled(TextField)`
  flex: 1;

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

export const StyledButton = styled(Button)`
  height: 56px !important;
  background-color: var(--primary) !important;
  text-transform: none !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  padding: 0 24px !important;

  &:hover {
    background-color: var(--primary-hover) !important;
  }

  &:disabled {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.3) !important;
  }
`;
