import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';

export function ChatShellPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    void navigate('/login', { replace: true });
  }

  return (
    <div className="chat-shell">
      <header className="chat-shell-header">
        <div>
          <h1>dan-chat</h1>
          <p className="muted">
            Đã đăng nhập: <strong>{user?.email ?? '—'}</strong>
          </p>
        </div>
        <button type="button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </header>
      <main className="chat-shell-main">
        <p>Khung chat (danh sách phòng & tin nhắn) sẽ nối vào đây sau.</p>
      </main>
    </div>
  );
}
