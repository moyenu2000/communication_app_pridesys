import axios from 'axios';

const API_BASE = 'https://traq.duckdns.org/api/v3';


export const createChannelService = async (name, parentId) => {
  try {
    const response = await axios.post(`${API_BASE}/channels`, {
      name: name,
      parent: parentId || null
    }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw new Error('Error creating channel');
  }
};


export const getStarredChannels = async () => {
  try {
    const response = await axios.get(`${API_BASE}/users/me/stars`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching starred channels:', error);
    throw error;
  }
};

// /subscriptions
export const getSubscribedChannels = async () => {
  try {
    const response = await axios.get(`${API_BASE}/users/me/subscriptions`, {
      withCredentials: true
    });
    return response.data;
  }
  catch (error) {
    console.error('Error fetching subscribed channels:', error);
    throw error;
  }
};


export const addChannelToStars = async (channelId) => {
  try {
    await axios.post(`${API_BASE}/users/me/stars`, { channelId }, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    console.error('Error adding channel to stars:', error);
    throw error;
  }
};


export const removeChannelFromStars = async (channelId) => {
  try {
    await axios.delete(`${API_BASE}/users/me/stars/${channelId}`, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    console.error('Error removing channel from stars:', error);
    throw error;
  }
};

export const setChannelSubscriptionLevel = async (channelId, level) => {
  try {
    await axios.put(`${API_BASE}/users/me/subscriptions/${channelId}`, {
      level: level
    }, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    console.error('Error setting channel subscription level:', error);
    throw error;
  }
};



export const fetchMessages = async (channelId, limit = 10, offset = 0) => {
  try {
    const response = await axios.get(`${API_BASE}/channels/${channelId}/messages`, {
      params: {
        limit: limit,
        offset: offset,
        order: 'desc',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching messages');
  }
};

export const fetchPinnedMessages = async (channelId) => {
  try {
    const response = await axios.get(`${API_BASE}/channels/${channelId}/pins`, {
      withCredentials: true,
    });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching pinned messages');
  }
};


export const pinMessage = async (messageId) => {
  try {
    const response = await axios.post(`${API_BASE}/messages/${messageId}/pin`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error pinning message:', error);
    throw new Error('Error pinning message');
  }
};

export const unpinMessage = async (messageId) => {
  try {
    const response = await axios.delete(`${API_BASE}/messages/${messageId}/pin`, {
      withCredentials: true
    });
    return response.status === 204;
  } catch (error) {
    console.error('Error unpinning message:', error);
    throw new Error('Error unpinning message');
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


export const uploadFile = async (channelId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('channelId', channelId);

    const response = await axios.post(`${API_BASE}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Error uploading file');
  }
};


export const fetchFileMetadata = async (fileId)=> {
  try {
    const response = await axios.get(`${API_BASE}/files/${fileId}/meta`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching metadata for file ${fileId}:`, error);
    throw new Error('Error fetching file metadata');
  }
}


// static getFileDownloadUrl(fileId) {
//   return `${API_BASE}/files/${fileId}?dl=1`;
// }

export const getFileDownloadUrl = (fileId) => {
  return `${API_BASE}/files/${fileId}?dl=1`;
}


export const fetchOGPData = async (url) => {
  try {
    const response = await axios.get(`${API_BASE}/ogp`, {
      params: {
        url: url
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching OGP data:', error);
    throw new Error('Error fetching OGP data');
  }
};




export const deleteMessage = async (messageId) => {
  try {
    const response = await axios.delete(`${API_BASE}/messages/${messageId}`, {
      withCredentials: true
    });
    
  
    return response.status === 204;
  } catch (error) {
    console.error('Error deleting message:', error);
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error('You do not have permission to delete this message');
      } else if (error.response.status === 404) {
        throw new Error('Message not found');
      }
    }
    throw new Error('Error deleting message');
  }
};

export const updateMessage = async (messageId, content) => {
  try {
    const response = await axios.put(`${API_BASE}/messages/${messageId}`, {
      content: content
    }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error updating message:', error);
    throw new Error('Error updating message');
  }
};