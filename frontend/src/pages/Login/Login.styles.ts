import styled from 'styled-components';
import { Card, TextField, Button, Typography, Alert } from '@mui/material';

export const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 40px;
  margin-bottom: 40px;
`;

export const StyledCard = styled(Card)`
  padding: 32px;
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
  color: white !important;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 420px;
`;

export const LoginTitle = styled(Typography)`
  font-weight: 700 !important;
  color: white !important;
  text-align: center;
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
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
  font-size: 1.05rem !important;
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

export const ErrorAlert = styled(Alert)`
  border-radius: 8px !important;
  background-color: rgba(211, 47, 47, 0.1) !important;
  color: #f44336 !important;
  border: 1px solid rgba(211, 47, 47, 0.2) !important;
  
  & .MuiAlert-icon {
    color: #f44336 !important;
  }
`;
