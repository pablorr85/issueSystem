import React from 'react';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { useTheme } from '../../context/ThemeContext';
import { ToggleButton, ToggleLabel } from './ThemeToggle.styles';

export interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = true, className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ToggleButton
      onClick={toggleTheme}
      $mode={theme}
      className={className}
      aria-label={isDark ? 'Switch to Day mode' : 'Switch to Dark mode'}
      title={isDark ? 'Switch to Day mode' : 'Switch to Dark mode'}
      data-testid="theme-toggle-button"
    >
      {isDark ? <WbSunnyIcon /> : <NightsStayIcon />}
      {showLabel && (
        <ToggleLabel>
          {isDark ? 'Day View' : 'Night View'}
        </ToggleLabel>
      )}
    </ToggleButton>
  );
};
