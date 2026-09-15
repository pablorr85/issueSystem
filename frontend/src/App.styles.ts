import styled from "styled-components";
import { Alert, Button } from "@mui/material";

export const AppContainer = styled.div<{ $wide?: boolean }>`
  padding: 40px
    max(20px, (100% - ${({ $wide }) => ($wide ? "1280px" : "800px")}) / 2);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: ${({ $wide }) => ($wide ? "flex-start" : "center")};
`;

export const AppHeader = styled.header`
  text-align: center;
  margin-bottom: 40px;
  position: relative;
`;

export const HeaderTopRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
`;

export const AppTitle = styled.h1`
  margin: 0 0 10px 0;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  background: linear-gradient(135deg, var(--text-primary) 30%, var(--primary) 100%);
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
  background: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--primary);
  box-shadow: var(--shadow);
`;

export const LogoPlaceholder = styled.div`
  height: 50px;
  width: 50px;
  background: var(--primary);
  color: white;
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
  background: var(--bg-surface);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--text-secondary);
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
  color: var(--text-primary);
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
  background: ${({ $active }) =>
    $active ? "var(--primary)" : "var(--bg-card)"};
  color: ${({ $active }) => ($active ? "white" : "var(--text-secondary)")};
  border: 1px solid
    ${({ $active }) =>
      $active ? "var(--primary)" : "var(--border-card)"};
  padding: 10px 24px;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ $active }) =>
      $active ? "var(--primary-hover)" : "var(--bg-surface)"};
    border-color: ${({ $active }) =>
      $active ? "var(--primary-hover)" : "var(--primary)"};
    color: ${({ $active }) => ($active ? "white" : "var(--text-primary)")};
  }
`;

export const AuthStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 15px;
`;

export const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid var(--border-card);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 2px 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-surface);
    border-color: var(--primary);
  }
`;

export const RequiredAuthAlert = styled(Alert)`
  border-radius: 12px !important;
  background-color: rgba(255, 179, 0, 0.1) !important;
  color: var(--text-primary) !important;
  border: 1px solid rgba(255, 179, 0, 0.3) !important;
  padding: 16px !important;
  display: flex;
  flex-direction: column;
  gap: 16px;

  & .MuiAlert-icon {
    color: #eab308 !important;
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

export const CenteredLoadingContainer = styled(AppContainer)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export const ErrorContainer = styled(AppContainer)`
  padding: 2rem;
  text-align: center;
`;

export const ErrorTitle = styled.h2`
  color: #ef5350;
`;

export const GoBackButton = styled.button`
  margin-top: 1rem;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: var(--primary-hover);
  }
`;

export const PaddedAppContainer = styled(AppContainer)`
  padding-bottom: 2rem;
`;
