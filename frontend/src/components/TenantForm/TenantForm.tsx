import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { StyledCard, FormContainer, StyledTextField, StyledButton, FormTitle } from './TenantForm.styles';

export interface TenantFormProps {
  onSubmit: (uuid: string) => void;
  loading: boolean;
  error: string | null;
}

export const TenantForm: React.FC<TenantFormProps> = ({ onSubmit, loading, error }) => {
  const { t } = useTranslation();
  const [uuidInput, setUuidInput] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uuidInput.trim()) {
      onSubmit(uuidInput.trim());
    }
  };

  return (
    <StyledCard className="animate-fade-in">
      <FormTitle variant="h5" component="h2">
        {t('tenantForm.title')}
      </FormTitle>
      
      <FormContainer onSubmit={handleSubmit}>
        <StyledTextField
          variant="outlined"
          label={t('tenantForm.label')}
          placeholder={t('tenantForm.placeholder')}
          value={uuidInput}
          onChange={(e) => setUuidInput(e.target.value)}
          disabled={loading}
          fullWidth
          error={!!error}
          helperText={error ? `⚠️ ${error}` : ''}
        />
        
        <StyledButton
          type="submit"
          variant="contained"
          disabled={loading || !uuidInput.trim()}
          startIcon={<SearchIcon />}
        >
          {loading ? t('tenantForm.loading') : t('tenantForm.button')}
        </StyledButton>
      </FormContainer>
    </StyledCard>
  );
};
