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


export const postMessage = async (channelId, content) => {
    try {
        const response = await axios.post(
            `${API_BASE}/channels/${channelId}/messages`,
            {
                content: content,
                embed: false
            },
            { withCredentials: true }
        );
        return response.data; 
    } catch (error) {
        console.error('Error posting message:', error);
        throw new Error('Error posting message');
    }
};

