import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { login } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(t('login.errorEmpty'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password.trim());
      onSuccess();
    } catch (err: unknown) {
      console.error(err);
      let errMsg = t('login.errorDefault');
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { detail?: string } } }).response?.data;
        if (responseData?.detail) {
          errMsg = responseData.detail;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer className="animate-fade-in">
      <StyledCard>
        <LoginTitle variant="h5" as="h2">
          {t('login.title')}
        </LoginTitle>
 
        {error && (
          <ErrorAlert severity="error" onClose={() => setError(null)}>
            {error}
          </ErrorAlert>
        )}
 
        <FormContainer onSubmit={handleSubmit} noValidate>
          <StyledTextField
            label={t('login.usernameLabel')}
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            fullWidth
            inputProps={{ 'data-testid': 'login-username-input' }}
          />
 
          <StyledTextField
            label={t('login.passwordLabel')}
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
            {loading ? t('login.loading') : t('login.button')}
          </SubmitButton>
        </FormContainer>
      </StyledCard>
    </LoginContainer>
  );
};
