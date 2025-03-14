import { api } from './api';
import axios from 'axios';


const API_BASE = 'https://traq.duckdns.org/api/v3';

// Login User
export const loginUser = (credentials) => {
  return axios.post(
    `${API_BASE}/login`, 
    credentials,
    {
      withCredentials: true,
    }
  );
};

export const registerUser = (userData) => {
  return axios.post(
    `${API_BASE}/users`, 
    userData,
    {
      withCredentials: true,
    }
  );
};

// Logout User
export const logoutUser = (all = false) => {
  return axios.post(
    `${API_BASE}/logout?all=${all}`, 
    null,
    {
      withCredentials: true,
    }
  );
};


// Fetch Current User
export const fetchCurrentUser = () => {
  return axios.get(
    `${API_BASE}/users/me`,
    {
      withCredentials: true,  
    }
  );
};
