const API_BASE_URL = 'https://backend-smartlearn.onrender.com/api';

// Helper function to dynamically generate authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('smartlearn_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const authService = {
  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    
    // Store token and user details safely in local browser storage
    if (data.token) {
      localStorage.setItem('smartlearn_token', data.token);
      localStorage.setItem('smartlearn_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('smartlearn_token');
    localStorage.removeItem('smartlearn_user');
  },

  // 1. ADDED: Forgot Password Service
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to process request');
    return data;
  },

  // 2. ADDED: Reset Password Service
  resetPassword: async (token, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Reset execution failed');
    return data;
  }
};

export const deckService = {
  getAllDecks: async () => {
    const response = await fetch(`${API_BASE_URL}/decks`, {
      headers: getAuthHeaders() // Secured with JWT
    });
    if (!response.ok) throw new Error('Failed to load decks');
    return response.json();
  },

  createDeck: async (title, description) => {
    const response = await fetch(`${API_BASE_URL}/decks`, {
      method: 'POST',
      headers: getAuthHeaders(), // Secured with JWT
      body: JSON.stringify({ title, description }),
    });
    if (!response.ok) throw new Error('Failed to create deck');
    return response.json();
  },
};

export const cardService = {
  createCard: async (deckId, front, back) => {
    const response = await fetch(`${API_BASE_URL}/cards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ deckId, front, back }),
    });
    if (!response.ok) throw new Error('Failed to create manual flashcard');
    return response.json();
  },

  getStudyQueue: async (deckId) => {
    const response = await fetch(`${API_BASE_URL}/cards/deck/${deckId}/study`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to load study session');
    return response.json();
  },

  submitReview: async (cardId, rating) => {
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating }),
    });
    if (!response.ok) throw new Error('Failed to submit card review update');
    return response.json();
  },

  uploadPDF: async (deckId, file) => {
    const formData = new FormData();
    formData.append('deckId', deckId);
    formData.append('file', file);

    const token = localStorage.getItem('smartlearn_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/cards/upload-pdf`, {
      method: 'POST',
      headers: headers, // Browser handles multi-part boundary but we supply token manually
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to parse PDF document');
    return data;
  },
};