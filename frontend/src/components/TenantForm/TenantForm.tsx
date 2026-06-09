import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { StyledCard, FormContainer, StyledTextField, StyledButton, FormTitle } from './TenantForm.styles';

export interface TenantFormProps {
  onSubmit: (uuid: string) => void;
  loading: boolean;
  error: string | null;
}

export const TenantForm: React.FC<TenantFormProps> = ({ onSubmit, loading, error }) => {
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
        Load Tenant Configuration
      </FormTitle>
      
      <FormContainer onSubmit={handleSubmit}>
        <StyledTextField
          variant="outlined"
          label="Tenant UUID"
          placeholder="Enter Tenant UUID (e.g. f47ac10b-y12a...)"
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
          {loading ? 'Loading...' : 'Load'}
        </StyledButton>
      </FormContainer>
    </StyledCard>
  );
};
