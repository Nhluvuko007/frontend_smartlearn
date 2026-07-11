import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams(); // ◄ Grabs the token string straight out of the URL bar
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`https://backend-smartlearn.onrender.com/api/auth/reset-password/${token}`, { password });
      setMessage(response.data.message);
      
      // Auto-redirect them back to log in after 3 seconds of showing success
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'This recovery token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Choose a New Password</h2>
      
      {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
          <input 
            type="password" 
            required 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}