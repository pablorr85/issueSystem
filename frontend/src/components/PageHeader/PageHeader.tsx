import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsMenu } from '../SettingsMenu';
import {
  HeaderContainer,
  HeaderTopRow,
  HeaderTitle,
  HeaderSubtitle,
} from './PageHeader.styles';

export interface PageHeaderProps {
  user?: string | { username?: string } | null;
  onLogout?: () => void;
  titleKey?: string;
  subtitleKey?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  user,
  onLogout,
  titleKey = 'app.appTitle',
  subtitleKey = 'app.appSubtitle',
}) => {
  const { t } = useTranslation();
  const usernameString = typeof user === 'string' ? user : user?.username || null;

  return (
    <HeaderContainer data-testid="page-header">
      <HeaderTopRow>
        <SettingsMenu user={usernameString} onLogout={onLogout} />
      </HeaderTopRow>
      <HeaderTitle data-testid="dashboard-header">{t(titleKey)}</HeaderTitle>
      <HeaderSubtitle>{t(subtitleKey)}</HeaderSubtitle>
    </HeaderContainer>
  );
};
