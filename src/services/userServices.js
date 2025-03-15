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


// fetch user List
export const fetchUsers = () => {
  return axiosInstance.get('/users');
};

// fetch dm channel GET
// /users/{userId}/dm- channel
export const fetchDMChannel = (userId) => {
  return axiosInstance.get(`/users/${userId}/dm-channel`);
};

// fetch channel information
// GET
// /channels/{channelId}
// Get channel information

export const fetchChannel = (channelId) => {
  return axiosInstance.get(`/channels/${channelId}`);
};

// GET
// /users/{userId}
// Get detailed user information

export const fetchUser = (userId) => {
  return axiosInstance.get(`/users/${userId}`);
};

