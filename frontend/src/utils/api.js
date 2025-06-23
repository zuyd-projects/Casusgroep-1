import { tokenService } from './auth';

const API_BASE_URL = ''; // Use empty string since Next.js proxy handles /api prefix

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      tokenService.removeToken();
      window.location.href = '/login';
      return;
    }
    
    const errorText = await response.text();
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.title || errorText;
    } catch (e) {
      errorMessage = errorText || `Request failed with status ${response.status}`;
    }
    
    // Log API errors for debugging
    console.error(`API Error [${response.status}]:`, {
      url: response.url,
      status: response.status,
      message: errorMessage
    });
    
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

// Create authenticated request headers
const getAuthHeaders = () => {
  const token = tokenService.getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API utility for authenticated requests
export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors',
    });
    
    return await handleResponse(response);
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      mode: 'cors',
    });
    
    return await handleResponse(response);
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      mode: 'cors',
    });
    
    return await handleResponse(response);
  },

  async patch(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      mode: 'cors',
    });
    
    return await handleResponse(response);
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      mode: 'cors',
    });
    
    return await handleResponse(response);
  },
};
