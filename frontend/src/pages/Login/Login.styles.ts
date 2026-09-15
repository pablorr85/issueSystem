import styled from 'styled-components';
import React from 'react';
import { Card, TextField, Button, Typography, Alert } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

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
  background: var(--bg-card) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-card) !important;
  border-radius: 16px !important;
  box-shadow: var(--shadow) !important;
  color: var(--text-primary) !important;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 420px;
`;

export const LoginTitle = styled(Typography)`
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  text-align: center;
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

interface CustomTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'standard' | 'filled';
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> & { 'data-testid'?: string };
}

const MuiTextField = React.forwardRef<HTMLDivElement, CustomTextFieldProps>((props, ref) => (
  React.createElement(TextField, { ref, ...props as unknown as TextFieldProps })
));

export const StyledTextField = styled(MuiTextField)`
  width: 100%;

  & .MuiOutlinedInput-root {
    color: var(--text-primary);
    background-color: var(--bg-surface);
    
    & fieldset {
      border-color: var(--border-card);
    }
    
    &:hover fieldset {
      border-color: var(--primary);
    }
    
    &.Mui-focused fieldset {
      border-color: var(--primary);
    }
  }

  & .MuiInputLabel-root {
    color: var(--text-secondary);
    
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
