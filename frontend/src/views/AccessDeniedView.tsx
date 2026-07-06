import React from 'react';
import { useTranslation } from 'react-i18next';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background-color: #0b0a13;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 32px 24px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const IconWrapper = styled.div`
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
`;

const Message = styled.p`
  font-size: 0.95rem;
  color: #c5c2d9;
  line-height: 1.6;
  margin: 0;
`;

export const AccessDeniedView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Card data-testid="access-denied-card">
        <IconWrapper>
          <ReportProblemIcon fontSize="large" />
        </IconWrapper>
        <Title>{t('app.accessDeniedTitle', 'Acceso Denegado')}</Title>
        <Message>
          {t('app.accessDeniedMessage', 'This link is no longer valid or the task has been reassigned. Please contact your supervisor.')}
        </Message>
      </Card>
    </Container>
  );
};

export default AccessDeniedView;
