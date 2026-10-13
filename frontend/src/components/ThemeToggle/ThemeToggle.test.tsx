import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

const TestComponent = () => {
  const { theme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <ThemeToggle />
    </div>
  );
};

describe('ThemeToggle & ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to dark theme when no localStorage value exists', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByText('Day View')).toBeInTheDocument();
  });

  it('toggles theme to light (Day View) on click and persists in localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle-button');
    fireEvent.click(button);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('app_theme')).toBe('light');
    expect(screen.getByText('Night View')).toBeInTheDocument();
  });

  it('initializes from localStorage if saved', () => {
    localStorage.setItem('app_theme', 'light');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
