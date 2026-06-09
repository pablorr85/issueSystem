import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LoginContainer,
  StyledCard,
  LoginTitle,
  FormContainer,
  StyledTextField,
  SubmitButton,
  ErrorAlert
} from './Login.styles';

export interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both username and password fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password.trim());
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Invalid credentials. Please verify your username and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer className="animate-fade-in">
      <StyledCard>
        <LoginTitle variant="h5" component="h2">
          Employee Sign In
        </LoginTitle>

        {error && (
          <ErrorAlert severity="error" onClose={() => setError(null)}>
            {error}
          </ErrorAlert>
        )}

        <FormContainer onSubmit={handleSubmit} noValidate>
          <StyledTextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            fullWidth
            inputProps={{ 'data-testid': 'login-username-input' }}
          />

          <StyledTextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            fullWidth
            inputProps={{ 'data-testid': 'login-password-input' }}
          />

          <SubmitButton
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            data-testid="login-submit-button"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </SubmitButton>
        </FormContainer>
      </StyledCard>
    </LoginContainer>
  );
};
