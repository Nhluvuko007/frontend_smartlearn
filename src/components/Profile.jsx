import { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend-smartlearn.onrender.com/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.patch('https://backend-smartlearn.onrender.com/api/auth/profile', user, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMessage('Profile updated successfully!');
  };

  const token = localStorage.getItem('smartlearn_token');
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json' 
  };
  console.log("Full Headers being sent:", headers);

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleUpdate}>
        <input 
          value={user.username} 
          onChange={(e) => setUser({...user, username: e.target.value})} 
          placeholder="Username" 
        />
        <input 
          value={user.email} 
          onChange={(e) => setUser({...user, email: e.target.value})} 
          placeholder="Email" 
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;