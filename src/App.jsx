import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { authService, deckService, cardService } from './services/api';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import Navbar from './components/Navbar';

function App() {
  const navigate = useNavigate();

  // Session Authentication States
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // login OR register
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');

  // Core Platform Navigation States
  const [decks, setDecks] = useState([]);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [studyQueue, setStudyQueue] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Modals & Upload States
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [activeDeckForCard, setActiveDeckForCard] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form input fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  // Check for an existing local session on window startup
  useEffect(() => {
    const savedUser = localStorage.getItem('smartlearn_user');
    const savedToken = localStorage.getItem('smartlearn_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch private study data only when user is successfully authorized
  useEffect(() => {
    if (user) {
      loadDecks();
    }
  }, [user]);

  const loadDecks = async () => {
    try {
      const data = await deckService.getAllDecks();
      setDecks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authView === 'login') {
        const data = await authService.login(authEmail, authPassword);
        setUser(data.user);
        navigate('/dashboard'); // Direct to main layout on success
      } else {
        await authService.register(authUsername, authEmail, authPassword);
        alert('Registration successful! Please login.');
        setAuthView('login');
      }
      // Reset text inputs
      setAuthEmail('');
      setAuthPassword('');
      setAuthUsername('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setDecks([]);
    setCurrentDeck(null);
    navigate('/login');
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await deckService.createDeck(newTitle, newDesc);
      setNewTitle('');
      setNewDesc('');
      setShowDeckModal(false);
      loadDecks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;
    try {
      await cardService.createCard(activeDeckForCard._id, cardFront, cardBack);
      setCardFront('');
      setCardBack('');
      setShowCardModal(false);
      alert('Flashcard added successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePDFUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !activeDeckForCard) return;

    setIsUploading(true);
    try {
      const response = await cardService.uploadPDF(activeDeckForCard._id, selectedFile);
      alert(response.message);
      setSelectedFile(null);
      if (currentDeck && currentDeck._id === activeDeckForCard._id) {
        startStudySession(activeDeckForCard);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const startStudySession = async (deck) => {
    try {
      const queue = await cardService.getStudyQueue(deck._id);
      setCurrentDeck(deck);
      setStudyQueue(queue);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      navigate('/study'); // Navigate to study view
    } catch (err) {
      console.error(err);
    }
  };

  const handleScoreSubmit = async (rating) => {
    const currentCard = studyQueue[currentCardIndex];
    try {
      await cardService.submitReview(currentCard._id, rating);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentCardIndex((prev) => prev + 1);
      }, 300);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {user && <Navbar user={user} handleLogout={handleLogout} />}

    <Routes>
      {/* Fallback routing */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

      {/* Auth Gateway Route */}
      <Route path="/login" element={
        !user ? (
          <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, color: '#1e3a8a' }}>🧠 SmartLearn</h1>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Secure Spaced-Repetition Platform</p>
              </div>

              <form onSubmit={handleAuthSubmit}>
                {authView === 'register' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Username</label>
                    <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} placeholder="Enter username" required />
                  </div>
                )}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Email Address</label>
                  <input type="email" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="name@domain.com" required />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Password</label>
                  <input type="password" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" required />
                  
                  {/* Forgot Password Trigger Container */}
                  {authView === 'login' && (
                    <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                      <span 
                        style={{ color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                        onClick={() => navigate('/forgot-password')}
                      >
                        Forgot Password?
                      </span>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn" style={{ width: '100%', padding: '0.75rem' }}>
                  {authView === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                {authView === 'login' ? (
                  <p style={{ color: '#64748b' }}>New to the platform? <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthView('register')}>Register Here</span></p>
                ) : (
                  <p style={{ color: '#64748b' }}>Already have an account? <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthView('login')}>Log In</span></p>
                )}
              </div>
            </div>
          </div>
        ) : <Navigate to="/dashboard" replace />
      } />

      {/* Supplementary Password Reset Tracks */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/profile" element={<Profile />} />

      {/* Dashboard Homepage Route */}
      <Route path="/dashboard" element={
        user ? (
          <div className="container">
            <div className="header">
              <div>
                <h1 style={{ margin: 0, color: '#1e3a8a' }}>🧠 SmartLearn</h1>
                <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Welcome back, <strong style={{ color: '#1e293b' }}>{user.username}</strong>!</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn" onClick={() => setShowDeckModal(true)}>+ Create New Deck</button>
                <button className="btn" style={{ background: '#e2e8f0', color: '#475569' }} onClick={handleLogout}>Logout →</button>
              </div>
            </div>

            {/* Modal A: Create Deck */}
            {showDeckModal && (
              <div style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
                  <h3>Create New Study Deck</h3>
                  <form onSubmit={handleCreateDeck}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Deck Title</label>
                      <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Network Protocols" required />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                      <textarea style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '80px' }} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Short overview..." />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button type="button" className="btn" style={{ background: '#cbd5e1', color: '#1e293b' }} onClick={() => setShowDeckModal(false)}>Cancel</button>
                      <button type="submit" className="btn">Save Deck</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal B: Add Flashcard Manually & AI Portal */}
            {showCardModal && (
              <div style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Populate Deck: {activeDeckForCard?.title}</h3>
                  
                  <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px dashed #bfdbfe', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>🤖 Auto-Generate via AI</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#1e3a8a' }}>Upload a lecture PDF chapter.</p>
                    <form onSubmit={handlePDFUpload}>
                      <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} required style={{ fontSize: '0.85rem' }} />
                      <button type="submit" className="btn" style={{ marginTop: '0.75rem', width: '100%', background: '#2563eb' }} disabled={isUploading}>
                        {isUploading ? 'Analyzing Document Processing...' : '✨ Auto-Generate Cards'}
                      </button>
                    </form>
                  </div>

                  <div style={{ textAlign: 'center', margin: '1rem 0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>— OR CREATE MANUALLY —</div>

                  <form onSubmit={handleCreateCard}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Front Side</label>
                      <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={cardFront} onChange={(e) => setCardFront(e.target.value)} placeholder="Question..." required />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Back Side</label>
                      <textarea style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '60px' }} value={cardBack} onChange={(e) => setCardBack(e.target.value)} placeholder="Answer..." required />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button type="button" className="btn" style={{ background: '#cbd5e1', color: '#1e293b' }} onClick={() => setShowCardModal(false)}>Close</button>
                      <button type="submit" className="btn" style={{ background: '#10b981' }}>Add Manual Card</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <h2>Your Decks</h2>
            {decks.length === 0 ? (
              <div style={{ padding: '3rem', background: 'white', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                Your dashboard is empty. Click "+ Create New Deck" to start your isolated tracking folder!
              </div>
            ) : (
              <div className="grid">
                {decks.map((deck) => (
                  <div key={deck._id} className="card-deck" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div onClick={() => startStudySession(deck)} style={{ flexGrow: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>📂 {deck.title}</h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{deck.description || 'No description provided.'}</p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem' }}>
                      <button className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', background: '#475569' }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDeckForCard(deck);
                          setShowCardModal(true);
                        }}>
                        ⚙️ Populate Deck
                      </button>
                      <button className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => startStudySession(deck)}>
                        Study Due →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : <Navigate to="/login" replace />
      } />

      {/* Active Study Session Route */}
      <Route path="/study" element={
        user && currentDeck ? (
          (() => {
            const isSessionFinished = currentCardIndex >= studyQueue.length;
            const activeCard = studyQueue[currentCardIndex];
            return (
              <div className="container">
                <button className="btn" style={{ marginBottom: '1rem', background: '#64748b' }} onClick={() => { setCurrentDeck(null); loadDecks(); navigate('/dashboard'); }}>
                  ← Back to Dashboard
                </button>
                <h2>Studying: {currentDeck.title}</h2>

                {isSessionFinished ? (
                  <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '3rem' }}>🎉</span>
                    <h3>Session Complete!</h3>
                    <p>You have reviewed all cards currently due in this deck.</p>
                    <button className="btn" onClick={() => { setCurrentDeck(null); loadDecks(); navigate('/dashboard'); }}>Return Home</button>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>Card {currentCardIndex + 1} of {studyQueue.length}</p>
                    <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
                      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
                        <div className="card-face card-front">
                          <div style={{ padding: '0 1rem' }}>{activeCard?.front}</div>
                          <small style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.8rem' }}>Click card to flip</small>
                        </div>
                        <div className="card-face card-back">
                          <div style={{ padding: '0 1rem' }}>{activeCard?.back}</div>
                        </div>
                      </div>
                    </div>

                    {isFlipped && (
                      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <p style={{ fontWeight: 500, color: '#475569' }}>How well did you remember this?</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button className="btn" style={{ background: '#ef4444' }} onClick={() => handleScoreSubmit(1)}>Forgot 🔴</button>
                          <button className="btn" style={{ background: '#f59e0b' }} onClick={() => handleScoreSubmit(2)}>Hard 🟡</button>
                          <button className="btn" style={{ background: '#10b981' }} onClick={() => handleScoreSubmit(3)}>Good 🟢</button>
                          <button className="btn" style={{ background: '#3b82f6' }} onClick={() => handleScoreSubmit(4)}>Easy 🔵</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()
        ) : <Navigate to="/dashboard" replace />
      } />
    </Routes>
    </>
  );
}

export default App;