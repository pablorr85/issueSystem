import styled from 'styled-components';

export const AppContainer = styled.div`
  padding: 40px max(20px, (100% - 800px) / 2);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const AppHeader = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

export const AppTitle = styled.h1`
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.05em;
  color: var(--text-primary);
`;

export const AppSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
`;

export const BrandingSection = styled.section`
  border-top: 1px solid var(--border-card);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const BrandingCard = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.02);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-card);
`;

export const LogoPlaceholder = styled.div`
  height: 50px;
  width: 50px;
  background: var(--primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

export const BrandingTitle = styled.h3`
  margin: 0 0 5px 0;
  font-size: 1.25rem;
`;

export const BrandingSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-family: monospace;
`;

export const PreContainer = styled.pre`
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.9rem;
  color: #c5c2d9;
  margin: 0;
`;

export const AppFooter = styled.footer`
  margin-top: 40px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
`;
