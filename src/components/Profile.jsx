import { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');

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