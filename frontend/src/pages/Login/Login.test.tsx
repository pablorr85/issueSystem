import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from './Login';
import { useAuth } from '../../context/AuthContext';

// Mock the AuthContext hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login Component', () => {
  const mockLogin = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      token: null,
      user: null,
      tenantId: null,
      isAuthenticated: false,
    });
  });

  test('renders form elements correctly', () => {
    render(<Login onSuccess={mockOnSuccess} />);

    expect(screen.getByRole('heading', { name: /Employee Sign In/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
  });

  test('validates empty inputs and shows error', async () => {
    render(<Login onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByTestId('login-submit-button');
    fireEvent.click(submitButton);

    expect(
      screen.getByText(/Please fill in both username and password fields./i)
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('calls login with username and password and invokes onSuccess upon success', async () => {
    mockLogin.mockResolvedValue(undefined);
    render(<Login onSuccess={mockOnSuccess} />);

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'employee_user' } });
    fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('employee_user', 'securepass123');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('displays server error message on login failure', async () => {
    const apiError = {
      response: {
        data: {
          detail: 'No active account found with the given credentials',
        },
      },
    };
    mockLogin.mockRejectedValue(apiError);
    render(<Login onSuccess={mockOnSuccess} />);

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'wrong_user' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong_pass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/No active account found with the given credentials/i)).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  test('displays default error message on generic login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    render(<Login onSuccess={mockOnSuccess} />);

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByTestId('login-submit-button');

    fireEvent.change(usernameInput, { target: { value: 'wrong_user' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong_pass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid credentials. Please verify your username and password./i)
      ).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
