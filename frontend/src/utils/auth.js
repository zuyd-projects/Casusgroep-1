const API_BASE_URL = ''; // Use empty string since Next.js proxy handles /api prefix

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.title || errorText;
    } catch {
      errorMessage = errorText || `Request failed with status ${response.status}`;
    }
    
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

export const authAPI = {
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/api/account/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      mode: 'cors', // Explicitly set CORS mode
    });

    return await handleResponse(response);
  },

  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/api/account/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      mode: 'cors', // Explicitly set CORS mode
    });

    return await handleResponse(response);
  },
};

export const tokenService = {
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    }
  },

  setUserData(userData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userName', userData.name);
      localStorage.setItem('userEmail', userData.email);
    }
  },

  getUserData() {
    if (typeof window !== 'undefined') {
      return {
        role: localStorage.getItem('userRole'),
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
      };
    }
    return null;
  },
};
