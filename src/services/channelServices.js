import axios from 'axios';

const API_BASE = 'https://traq.duckdns.org/api/v3';

export const fetchMessages = async (channelId, limit = 10, offset = 0) => {
  try {
    const response = await axios.get(`${API_BASE}/channels/${channelId}/messages`, {
      params: {
        limit: limit,
        offset: offset,
        order: 'desc',
      },
      withCredentials: true, // Ensures cookies/session tokens are included
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching messages');
  }
};
