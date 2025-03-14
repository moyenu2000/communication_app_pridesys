// src/services/userService.js
import axios from 'axios';

const API_BASE = 'https://traq.duckdns.org/api/v3';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,  // Default setting for credentials
});


// Fetch Channel List
export const fetchChannels = () => {
  return axiosInstance.get('/channels');
};
