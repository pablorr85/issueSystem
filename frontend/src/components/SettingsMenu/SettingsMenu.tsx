import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '../../context/ThemeContext';
import {
  SettingsButton,
  StyledMenu,
  MenuHeader,
  UserLabel,
  UsernameText,
  SectionTitle,
  OptionGroup,
  OptionChip,
  LogoutMenuItem,
} from './SettingsMenu.styles';

export interface SettingsMenuProps {
  user?: string | null;
  onLogout?: () => void;
  className?: string;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  user,
  onLogout,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: 'es' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const handleThemeChange = (mode: 'light' | 'dark') => {
    setTheme(mode);
  };

  const handleLogoutClick = () => {
    handleClose();
    if (onLogout) {
      onLogout();
    }
  };

  const currentLang = (i18n.language || 'es').substring(0, 2);

  return (
    <div className={className}>
      <SettingsButton
        onClick={handleClick}
        aria-label={t('settings.title', 'Settings')}
        aria-controls={open ? 'settings-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        data-testid="settings-menu-button"
      >
        <SettingsIcon fontSize="small" />
      </SettingsButton>

      <StyledMenu
        id="settings-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {user && (
          <MenuHeader>
            <UserLabel>{t('app.loggedInAsPrefix', 'Logged in as')}</UserLabel>
            <UsernameText data-testid="settings-username">{user}</UsernameText>
          </MenuHeader>
        )}

        <SectionTitle>{t('settings.language', 'Language / Idioma')}</SectionTitle>
        <OptionGroup>
          <OptionChip
            $active={currentLang === 'es'}
            onClick={() => handleLanguageChange('es')}
            data-testid="lang-es-button"
          >
            🇪🇸 Español
          </OptionChip>
          <OptionChip
            $active={currentLang === 'en'}
            onClick={() => handleLanguageChange('en')}
            data-testid="lang-en-button"
          >
            🇬🇧 English
          </OptionChip>
        </OptionGroup>

        <SectionTitle>{t('settings.theme', 'Theme / Tema')}</SectionTitle>
        <OptionGroup>
          <OptionChip
            $active={theme === 'light'}
            onClick={() => handleThemeChange('light')}
            data-testid="theme-light-button"
          >
            <LightModeIcon sx={{ fontSize: 16, mr: 0.5 }} />
            {t('settings.lightMode', 'Light')}
          </OptionChip>
          <OptionChip
            $active={theme === 'dark'}
            onClick={() => handleThemeChange('dark')}
            data-testid="theme-dark-button"
          >
            <DarkModeIcon sx={{ fontSize: 16, mr: 0.5 }} />
            {t('settings.darkMode', 'Night')}
          </OptionChip>
        </OptionGroup>

        {onLogout && (
          <LogoutMenuItem onClick={handleLogoutClick} data-testid="settings-logout-button">
            <LogoutIcon fontSize="small" />
            {t('app.logout', 'Logout')}
          </LogoutMenuItem>
        )}
      </StyledMenu>
    </div>
  );
};
