import { useState, useEffect } from 'react';
import { login, register, listTodos, createTodo, updateTodo, deleteTodo } from './api.js';

const TOKEN_KEY = 'todos_field_notes_token';

// Helper to handle interactive cursor glow effect on cards
function handleMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
}

function LoginScreen({ onLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    document.title = 'Todos — Field Notes';
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!username.trim() || !password) {
      setError('Please fill in both fields.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await register(username.trim(), password);
        setSuccessMessage('Account created successfully! You can now sign in.');
        setPassword('');
        setIsRegistering(false);
      } else {
        const token = await login(username.trim(), password);
        sessionStorage.setItem(TOKEN_KEY, token);
        onLoggedIn(token);
      }
    } catch (err) {
      if (isRegistering) {
        setError(err.message || 'Registration failed. Try a different username.');
      } else {
        setError('Wrong username or password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="notebook-card auth-card" onMouseMove={handleMouseMove}>
        <div className="eyebrow">entry log</div>
        <h1 className="title">Field Notes</h1>
        <p className="subtitle">
          {isRegistering ? 'Create an account to start writing.' : "Sign in to open today's page."}
        </p>

        {successMessage && <div className="success-line">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <div className="error-line">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {isRegistering
              ? loading ? 'Creating account...' : 'Create Account'
              : loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="toggle-view">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                  setSuccessMessage('');
                }}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                  setSuccessMessage('');
                }}
              >
                Create an account
              </button>
            </>
          )}
        </p>

        {!isRegistering && (
          <p className="hint" style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
            For testing: <code style={{ color: 'var(--accent-purple)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>demo</code> / <code style={{ color: 'var(--accent-purple)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>password123</code>
          </p>
        )}
      </div>
    </div>
  );
}

function TodoRow({ todo, onToggle, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDeleteClick() {
    setIsDeleting(true);
  }

  function handleAnimationEnd(e) {
    if (e.animationName === 'collapseOut') {
      onDelete(todo);
    }
  }

  return (
    <li 
      className={`todo-row ${todo.completed ? 'is-done' : ''} ${isDeleting ? 'deleting' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <button
        className="check"
        aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
        onClick={() => onToggle(todo)}
      >
        {todo.completed && (
          <svg viewBox="0 0 20 20" className="check-mark">
            <path
              d="M4 10.5 L8 14.5 L16 5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <span className="todo-title">{todo.title}</span>
      <button className="remove" aria-label="Delete todo" onClick={handleDeleteClick}>
        ✕
      </button>
    </li>
  );
}

function TodoBoard({ token, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    setError('');
    try {
      const data = await listTodos(token);
      setTodos(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError('Could not load your list. Try refreshing.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) {
      document.title = 'Todos — Loading...';
    } else {
      const remaining = todos.filter((t) => !t.completed).length;
      document.title = `Todos (${remaining} Open)`;
    }
  }, [todos, loading]);

  async function handleAdd(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle('');
    try {
      const created = await createTodo(token, title);
      setTodos((prev) => [created, ...prev]);
    } catch {
      setError('Could not add that item.');
    }
  }

  async function handleToggle(todo) {
    const optimistic = { ...todo, completed: !todo.completed };
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? optimistic : t)));
    try {
      await updateTodo(token, todo.id, todo.title, !todo.completed);
    } catch {
      setError('Could not update that item.');
      refresh();
    }
  }

  async function handleDelete(todo) {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    try {
      await deleteTodo(token, todo.id);
    } catch {
      setError('Could not delete that item.');
      refresh();
    }
  }

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="page">
      <div className="notebook-card board-card" onMouseMove={handleMouseMove}>
        <div className="board-header">
          <div>
            <div className="eyebrow">today's page</div>
            <h1 className="title">Field Notes</h1>
          </div>
          <button className="btn-ghost" onClick={onLogout}>
            Sign out
          </button>
        </div>

        <form onSubmit={handleAdd} className="add-row">
          <input
            placeholder="Write a new line…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>

        {error && <div className="error-line">{error}</div>}

        {loading ? (
          <div className="todo-list">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-illustration" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="15" x2="15" y2="15" />
              <line x1="9" y1="11" x2="15" y2="11" />
              <line x1="9" y1="18" x2="12" y2="18" />
            </svg>
            <h3>Your space is clear</h3>
            <p>Add a new line above to begin.</p>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <TodoRow key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </ul>
        )}

        {!loading && todos.length > 0 && (
          <div className="status-line">
            <span>{remaining} of {todos.length} still open</span>
            <span className="hint">Autosaved to cloud</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return (
    <>
      <div className="ambient-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      {!token ? (
        <LoginScreen onLoggedIn={setToken} />
      ) : (
        <TodoBoard token={token} onLogout={handleLogout} />
      )}
    </>
  );
}
