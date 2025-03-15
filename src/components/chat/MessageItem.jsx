import React, { useState, useEffect } from "react";
import { getFileDownloadUrl, fetchFileMetadata, fetchOGPData } from "../../services/channelServices";
import { useInformation } from "../../contexts/InformationContext";
import OgpPreview from "./OgpPreview";
import {
  extractFileIds,
  extractUrl,
  cleanMessageContent,
  getFileIcon,
  formatFileSize,
  processMessageContent
} from "../../utils/util";

const MessageItem = ({ message }) => {
  const { users } = useInformation();
  const [fileMetadata, setFileMetadata] = useState([]);
  const [cleanContent, setCleanContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ogpData, setOgpData] = useState(null);
  const [isLoadingOgp, setIsLoadingOgp] = useState(false);
  const [ogpError, setOgpError] = useState(null);

  // Fetch OGP data for URLs
  const fetchOgpDataForUrl = async (url) => {
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
        fetchOgpDataForUrl(url);
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

  // Render content parts with mentions
  const renderMessageContent = () => {
    const parts = processMessageContent(cleanContent);
    if (!parts) return null;
    
    return (
      <p className="text-base mb-2">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index}>{part.content}</span>;
          } else if (part.type === 'mention') {
            const mentionData = part.content;
            // Find user for additional details if needed
            const user = users.find(u => u.id === mentionData.id);
            
            return (
              <span 
                key={index} 
                className="text-blue-600 font-medium cursor-pointer hover:underline"
                title={user?.name || mentionData.raw.substring(1)}
              >
                {mentionData.raw}
              </span>
            );
          }
          return null;
        })}
      </p>
    );
  };

  return (
    <div className="p-2 border-b border-gray-300">
      <p className="text-sm text-gray-600">{message?.senderName || 'Unknown'}</p>
      
      {/* Display message content with formatted mentions */}
      {renderMessageContent()}

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
      
      {isLoading && <div className="text-sm text-gray-400">Loading attachments...</div>}
      
      {error && <div className="text-sm text-red-500">{error}</div>}
      
      <span className="text-xs text-gray-400 block mt-1">
        {message?.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
      </span>
    </div>
  );
};

export default MessageItem;