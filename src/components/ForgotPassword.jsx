import React, { useState } from 'react';
import { authService } from '../services/api'; // Import your central service layer
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Use the unified authService function we added to api.js
      const data = await authService.forgotPassword(email);
      setMessage(data.message);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <button 
        type="button" 
        onClick={() => navigate('/login')} 
        style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0, marginBottom: '15px' }}
      >
        ← Back to Login
      </button>

      <h2>Reset Your Password</h2>
      <p style={{ color: '#666' }}>Enter your email address and we'll send you a link to reset your password.</p>
      
      {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {loading ? 'Processing...' : 'Send Recovery Link'}
        </button>
      </form>
    </div>
  );
}