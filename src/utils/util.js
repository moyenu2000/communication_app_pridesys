/**
 * Utility functions for message handling
 */

/**
 * Extracts file IDs from message content
 * @param {string} content - The message content
 * @returns {string[]} Array of file IDs
 */
export const extractFileIds = (content) => {
    const match = content?.match(/\[file:(.*?)\]/);
    if (match && match[1]) {
      return match[1].split(',');
    }
    return [];
  };
  
  /**
   * Extracts the first URL from message content
   * @param {string} content - The message content
   * @returns {string|null} The first URL found or null
   */
  export const extractUrl = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = content?.match(urlRegex);
    return match ? match[0] : null; // Return the first URL found
  };
  
  /**
   * Removes file references from message content
   * @param {string} content - The message content
   * @returns {string} Cleaned message content
   */
  export const cleanMessageContent = (content) => {
    return content?.replace(/\s*\[file:.*?\]\s*/, '').trim() || '';
  };
  
  /**
   * Returns the appropriate file icon based on MIME type
   * @param {string} mime - The MIME type
   * @returns {string} Icon representation
   */
  export const getFileIcon = (mime) => {
    if (!mime) return '📎'; // Default icon if mime is undefined
    
    if (mime.startsWith('image/')) return '📷';
    if (mime.startsWith('video/')) return '🎬';
    if (mime.startsWith('audio/')) return '🎵';
    if (mime.startsWith('text/')) return '📄';
    if (mime.includes('pdf')) return '📑';
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return '📦';
    return '📎';
  };
  
  /**
   * Formats file size in a human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  export const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * Processes message content to parse mentions and text
   * @param {string} content - The message content
   * @returns {Array} Array of parts (text and mentions)
   */

  export const processMessageContent = (content) => {
    if (!content) return null;
    
    // Find all mentions in the format !{"type":"user","raw":"@username","id":"user-id"}
    const mentionRegex = /!(\{(?:"type":"user","raw":"@[^"]+","id":"[^"]+")\})/g;
    
    // Split the content into parts: text and mentions
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      try {
        // Parse the mention JSON and add it
        const mentionData = JSON.parse(match[1]);
        parts.push({
          type: 'mention',
          content: mentionData
        });
      } catch (error) {
        console.error("Error parsing mention data:", error);
        parts.push({
          type: 'text',
          content: match[0]
        });
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last mention
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: content }];
  };


  // remove the mention part formatting and return normal text
  export const removeMentionFormatting = (content) => {
    return content.replace(/!{"type":"user","raw":"@([^"]+)","id":"[^"]+"}/g, '@$1');
  };