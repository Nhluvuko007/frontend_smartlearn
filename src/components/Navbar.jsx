import { Link } from 'react-router-dom';

const Navbar = ({ user, handleLogout }) => {
  return (
    <nav style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #e2e8f0' 
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1e3a8a', fontWeight: 'bold', fontSize: '1.2rem' }}>
        🧠 SmartLearn
      </Link>
      
      {user && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/profile" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500 }}>
            👤 Profile
          </Link>
          <button onClick={handleLogout} style={{ 
            background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', 
            borderRadius: '6px', cursor: 'pointer', color: '#475569' 
          }}>
            Logout →
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;