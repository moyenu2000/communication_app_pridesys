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
    return response.data;
  } catch (error) {
    throw new Error('Error fetching pinned messages');
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