import styled from 'styled-components';
import { Alert, Button } from '@mui/material';

export const AppContainer = styled.div<{ $wide?: boolean }>`
  padding: 40px max(20px, (100% - ${({ $wide }) => ($wide ? '1280px' : '800px')}) / 2);
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
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  background: linear-gradient(135deg, #ffffff 30%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  border: 1px solid var(--primary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
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
  color: var(--primary);
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

export const AppMain = styled.main`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const BrandingHeader = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 10px 0;
`;

export const BrandingImage = styled.img`
  height: 50px;
  object-fit: contain;
`;

export const BrandingJSONTitle = styled.h4`
  margin: 0 0 10px 0;
  color: var(--text-secondary);
`;

export const FullWidthAlert = styled(Alert)`
  width: 100% !important;
`;

export const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)')};
  color: ${({ $active }) => ($active ? 'white' : '#a09cb4')};
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)')};
  padding: 10px 24px;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${({ $active }) => ($active ? 'var(--primary-hover)' : 'rgba(255, 255, 255, 0.06)')};
    border-color: ${({ $active }) => ($active ? 'var(--primary-hover)' : 'rgba(255, 255, 255, 0.15)')};
    color: white;
  }
`;

export const AuthStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  color: #a09cb4;
  font-size: 0.9rem;
  margin-bottom: 15px;
`;

export const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  padding: 2px 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

export const RequiredAuthAlert = styled(Alert)`
  border-radius: 12px !important;
  background-color: rgba(255, 179, 0, 0.05) !important;
  color: #ffd54f !important;
  border: 1px solid rgba(255, 179, 0, 0.2) !important;
  padding: 16px !important;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  & .MuiAlert-icon {
    color: #ffd54f !important;
  }
`;

export const AlertButton = styled(Button)`
  background-color: var(--primary) !important;
  color: white !important;
  text-transform: none !important;
  font-weight: 600 !important;
  align-self: flex-start !important;
  margin-top: 12px !important;
  
  &:hover {
    background-color: var(--primary-hover) !important;
  }
`;

