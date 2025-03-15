import React, { useState, useEffect } from "react";
import axios from "axios";
import { getFileDownloadUrl, fetchFileMetadata, fetchOGPData } from "../../services/channelServices";

const MessageItem = ({ message }) => {
  const [fileMetadata, setFileMetadata] = useState([]);
  const [cleanContent, setCleanContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ogpData, setOgpData] = useState(null);
  const [isLoadingOgp, setIsLoadingOgp] = useState(false);
  const [ogpError, setOgpError] = useState(null);

  // Function to extract file IDs from message content
  const extractFileIds = (content) => {
    const match = content?.match(/\[file:(.*?)\]/);
    if (match && match[1]) {
      return match[1].split(',');
    }
    return [];
  };

  // Function to extract URLs from message content
  const extractUrl = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = content?.match(urlRegex);
    return match ? match[0] : null; // Return the first URL found
  };

  // Function to clean message content of file references
  const cleanMessageContent = (content) => {
    return content?.replace(/\s*\[file:.*?\]\s*/, '').trim() || '';
  };

  // Fetch OGP data for URLs
  const fetchOgpData = async (url) => {
    setIsLoadingOgp(true);
    setOgpError(null);
    
    try {
      const response = await fetchOGPData(url);
      
      // Only set OGP data if it's not empty
      if (response && response.type !== "empty") {
        setOgpData(response);
      } else {
        setOgpData(null);
      }
    } catch (error) {
      console.error("Error fetching OGP data:", error);
      setOgpError("Failed to load link preview");
      setOgpData(null);
    } finally {
      setIsLoadingOgp(false);
    }
  };

  // Fetch file metadata when component mounts or message changes
  useEffect(() => {
    const fetchMeta = async (fileIds) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const metadataPromises = fileIds.map(fileId => 
          fetchFileMetadata(fileId)
            .catch(error => {
              console.error(`Error fetching metadata for file ${fileId}:`, error);
              return null;
            })
        );
        
        const results = await Promise.all(metadataPromises);
        setFileMetadata(results.filter(meta => meta !== null));
        console.log("Fetched file metadata:", results);
      } catch (error) {
        console.error("Error fetching file metadata:", error);
        setError("Failed to load file attachments");
      } finally {
        setIsLoading(false);
      }
    };

    if (message?.content) {
      const fileIds = extractFileIds(message.content);
      const cleaned = cleanMessageContent(message.content);
      setCleanContent(cleaned);
      
      // Check for URLs in the message
      const url = extractUrl(cleaned);
      if (url) {
        fetchOgpData(url);
      } else {
        setOgpData(null);
      }
      
      if (fileIds.length > 0) {
        fetchMeta(fileIds);
      } else {
        setFileMetadata([]);
      }
    } else {
      setCleanContent(message?.content || '');
      setFileMetadata([]);
      setOgpData(null);
    }
  }, [message]);

  const handleDownload = (fileId) => {
    if (fileId) {
      window.open(getFileDownloadUrl(fileId), '_blank');
    }
  };

  // Function to get file icon based on MIME type with safe handling
  const getFileIcon = (mime) => {
    if (!mime) return '📎'; // Default icon if mime is undefined
    
    if (mime.startsWith('image/')) return '📷';
    if (mime.startsWith('video/')) return '🎬';
    if (mime.startsWith('audio/')) return '🎵';
    if (mime.startsWith('text/')) return '📄';
    if (mime.includes('pdf')) return '📑';
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return '📦';
    return '📎';
  };

  // Function to format file size with safe handling
  const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // OGP Preview Component
  const OgpPreview = ({ data }) => {
    if (!data) return null;
    
    return (
      <div className="mt-2 mb-2 border rounded-md overflow-hidden bg-gray-50">
        <a 
          href={data.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:bg-gray-100 transition-colors"
        >
          {data.images && data.images.length > 0 && data.images[0].url && (
            <div className="w-full h-40 bg-gray-200 overflow-hidden">
              <img 
                src={data.images[0].url} 
                alt={data.title || "Link preview"} 
                className="w-full h-full object-cover"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
          <div className="p-3">
            {data.title && (
              <h3 className="font-medium text-blue-600 truncate">{data.title}</h3>
            )}
            {data.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{data.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2 truncate">{data.url}</p>
          </div>
        </a>
      </div>
    );
  };

  return (
    <div className="p-2 border-b border-gray-300">
      <p className="text-sm text-gray-600">{message?.senderName || 'Unknown'}</p>
      
      {/* Display message content */}
      {cleanContent && (
        <p className="text-base mb-2">{cleanContent}</p>
      )}

      {/* Display OGP preview if available */}
      {isLoadingOgp && (
        <div className="text-sm text-gray-400">Loading link preview...</div>
      )}
      {ogpError && (
        <div className="text-sm text-gray-400">Could not load link preview</div>
      )}
      {ogpData && <OgpPreview data={ogpData} />}

      {/* Display attached files */}
      {fileMetadata.length > 0 && (
        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-1">Attachments:</div>
          <div className="flex flex-wrap gap-2">
            {fileMetadata.map((file) => (
              <div key={file?.id || Math.random()} className="flex items-center bg-gray-100 rounded-md p-2 max-w-full">
                <span className="mr-2 text-xl">{getFileIcon(file?.mime)}</span>
                <div className="overflow-hidden">
                  <div className="text-sm font-medium truncate" title={file?.name || 'Unknown file'}>
                    {file?.name || 'Unknown file'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(file?.size)} • {file?.mime || 'Unknown type'}
                  </div>
                </div>
                {file?.id && (
                  <button
                    onClick={() => handleDownload(file.id)}
                    className="ml-3 text-blue-500 hover:text-blue-700"
                    title="Download file"
                  >
                    ⬇️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Display loading indicator */}
      {isLoading && <div className="text-sm text-gray-400">Loading attachments...</div>}
      
      {/* Display error message if any */}
      {error && <div className="text-sm text-red-500">{error}</div>}
      
      {/* Message timestamp */}
      <span className="text-xs text-gray-400 block mt-1">
        {message?.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
      </span>
    </div>
  );
};

export default MessageItem;