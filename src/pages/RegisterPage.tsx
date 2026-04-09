import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';

const MIN_PASSWORD_LENGTH = 8;

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    errorMessage,
    clearError,
    accessToken,
    user,
    isInitializing,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isInitializing && accessToken && user) {
    return <Navigate to="/chat" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    if (password.length < MIN_PASSWORD_LENGTH) {
      return;
    }
    setIsSubmitting(true);
    try {
      await register(email.trim(), password);
      void navigate('/chat', { replace: true });
    } catch {
      // Error surfaced via auth context
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordTooShort =
    password.length > 0 && password.length < MIN_PASSWORD_LENGTH;

  return (
    <div className="auth-shell">
      <h1>Đăng ký</h1>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Mật khẩu (tối thiểu {MIN_PASSWORD_LENGTH} ký tự)</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH}
          />
        </label>
        {passwordTooShort ? (
          <p className="form-error" role="alert">
            Mật khẩu phải có ít nhất {MIN_PASSWORD_LENGTH} ký tự.
          </p>
        ) : null}
        {errorMessage ? (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <button type="submit" disabled={isSubmitting || passwordTooShort}>
          {isSubmitting ? 'Đang đăng ký…' : 'Đăng ký'}
        </button>
      </form>
      <p className="muted">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
}
