import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('smartlearn_token');
      const response = await axios.get('https://backend-smartlearn.onrender.com/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('smartlearn_token');
  
  try {
    // 1. Send the PATCH request
    const response = await axios.patch('https://backend-smartlearn.onrender.com/api/auth/profile', user, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Update the React state with the new data returned from the server
    setUser(response.data); 

    // 3. Optional: Update the 'smartlearn_user' in localStorage so it stays synced
    localStorage.setItem('smartlearn_user', JSON.stringify(response.data));

    setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile.');
      console.error(error);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="profile-card">
        <button className="btn" style={{ background: '#cbd5e1', marginBottom: '1rem' }} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        
        <h2 style={{ color: '#1e3a8a', textAlign: 'center', marginBottom: '1.5rem' }}>User Profile</h2>
        
        {message && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Username</label>
            <input 
              type="text" 
              className="profile-input"
              value={user.username} 
              onChange={(e) => setUser({...user, username: e.target.value})} 
              required 
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              className="profile-input"
              value={user.email} 
              onChange={(e) => setUser({...user, email: e.target.value})} 
              required 
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', padding: '0.75rem' }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;