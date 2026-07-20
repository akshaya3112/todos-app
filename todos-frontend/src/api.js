const API_BASE = import.meta.env.VITE_API_URL;

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  return data.token;
}

export async function register(username, password) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Could not register');
  }
}

export async function listTodos(token) {
  const res = await fetch(`${API_BASE}/todos`, {
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error('Could not load todos');
  return res.json();
}

export async function createTodo(token, title) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Could not create todo');
  return res.json();
}

export async function updateTodo(token, id, title, completed) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ title, completed }),
  });
  if (!res.ok) throw new Error('Could not update todo');
  return res.json();
}

export async function deleteTodo(token, id) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error('Could not delete todo');
}
