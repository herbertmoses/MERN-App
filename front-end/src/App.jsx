import { useState, useEffect } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [message, setMessage] = useState('');

  // Signup handler
  const handleSignup = async () => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    setMessage(data.message || JSON.stringify(data));
  };

  // Login handler
  const handleLogin = async () => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    setMessage(data.message || JSON.stringify(data));
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
    }
  };

  // Fetch protected message
  const fetchMessage = async () => {
    const response = await fetch('/api/message', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    setMessage(data.text || JSON.stringify(data));
  };

  // Update protected message
  const updateMessage = async () => {
    const response = await fetch('/api/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    setMessage(JSON.stringify(data));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Auth Demo</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <button onClick={handleSignup}>Sign Up</button>{' '}
      <button onClick={handleLogin}>Log In</button>{' '}
      <button onClick={fetchMessage}>Fetch Message</button>{' '}
      <button onClick={updateMessage}>Update Message</button>

      <hr />

      <p><strong>Server Message:</strong> {message}</p>
      <p><strong>JWT Token:</strong> {token}</p>
    </div>
  );
}

export default App;
