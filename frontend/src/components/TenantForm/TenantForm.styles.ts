import styled from 'styled-components';
import React from 'react';
import { Card, TextField, Button, Typography } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export const FormTitle = styled(Typography)`
  font-weight: 600 !important;
  color: var(--text-primary) !important;
`;

export const StyledCard = styled(Card)`
  padding: 24px;
  background: var(--bg-card) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-card) !important;
  border-radius: 16px !important;
  box-shadow: var(--shadow) !important;
  color: var(--text-primary) !important;
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

const StyledTextFieldComponent = styled(TextField)`
  flex: 1;

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

export const StyledTextField = StyledTextFieldComponent as React.ComponentType<TextFieldProps>;

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
