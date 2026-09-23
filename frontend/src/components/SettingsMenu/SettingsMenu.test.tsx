import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsMenu } from './SettingsMenu';
import { ThemeProvider } from '../../context/ThemeContext';

describe('SettingsMenu Component', () => {
  it('renders settings gear button and opens menu on click', () => {
    render(
      <ThemeProvider>
        <SettingsMenu user="admin" onLogout={vi.fn()} />
      </ThemeProvider>
    );

    const gearBtn = screen.getByTestId('settings-menu-button');
    expect(gearBtn).toBeInTheDocument();

    fireEvent.click(gearBtn);

    expect(screen.getByTestId('settings-username')).toHaveTextContent('admin');
    expect(screen.getByTestId('lang-es-button')).toBeInTheDocument();
    expect(screen.getByTestId('lang-en-button')).toBeInTheDocument();
    expect(screen.getByTestId('theme-light-button')).toBeInTheDocument();
    expect(screen.getByTestId('theme-dark-button')).toBeInTheDocument();
    expect(screen.getByTestId('settings-logout-button')).toBeInTheDocument();
  });

  it('triggers logout callback when logout option is clicked', () => {
    const handleLogout = vi.fn();
    render(
      <ThemeProvider>
        <SettingsMenu user="admin" onLogout={handleLogout} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('settings-menu-button'));
    fireEvent.click(screen.getByTestId('settings-logout-button'));

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});
