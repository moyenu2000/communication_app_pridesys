import React, { useState, useEffect } from "react";
import { getFileDownloadUrl, fetchFileMetadata, fetchOGPData, deleteMessage, pinMessage, unpinMessage } from "../../services/channelServices";
import { useInformation } from "../../contexts/InformationContext";
import OgpPreview from "./OgpPreview";
import MessageEditModal from "./MessageEditModal";
import {
  extractFileIds,
  cleanMessageContent,
  getFileIcon,
  formatFileSize,
  processMessageContent
} from "../../utils/util";

// New utility function to extract all URLs from text
const extractAllUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

// Format timestamp to show hours and minutes with am/pm
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  let hours = date.getHours();
  const mins = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12; 

  return `${hours}:${mins}${ampm}`;
};

// Get time difference in a human-readable format
const getTimeDifference = (timestamp) => {
  if (!timestamp) return '';

  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffMs = now - messageTime;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins} mins ago`;
  } else if (diffMins < 1440) { // less than a day
    return `${Math.floor(diffMins / 60)}h ago`;
  } else {
    return 'Yesterday';
  }
};

const MessageItem = ({ message, canEdit, canDelete }) => {
  const { users } = useInformation();
  const [fileMetadata, setFileMetadata] = useState([]);
  const [cleanContent, setCleanContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ogpDataList, setOgpDataList] = useState([]);
  const [isLoadingOgpMap, setIsLoadingOgpMap] = useState({});
  const [ogpErrorMap, setOgpErrorMap] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [sender, setSender] = useState(null);
  const [pinningUser, setPinningUser] = useState(null);
  const [showMenuButton, setShowMenuButton] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);


  useEffect(() => {
    if (message?.userId && users && users.length > 0) {
      const user = users.find(u => u.id === message.userId);
      setSender(user || null);
    }

    // Clear pinningUser if message.pinnedBy is null or undefined
    if (!message?.pinnedBy) {
      setPinningUser(null);
    }
  
    else if (message.pinnedBy && users && users.length > 0) {
      const user = users.find(u => u.id === message.pinnedBy);
      setPinningUser(user || null);
    }
  }, [message, users]);


  // Fetch OGP data for a single URL
  const fetchOgpDataForUrl = async (url) => {
    setIsLoadingOgpMap(prev => ({ ...prev, [url]: true }));
    setOgpErrorMap(prev => ({ ...prev, [url]: null }));

    try {
      const response = await fetchOGPData(url);

      // Only add OGP data if it's not empty
      if (response && response.type !== "empty") {
        setOgpDataList(prev => [...prev, { url, data: response }]);
      }
    } catch (error) {
      console.error(`Error fetching OGP data for ${url}:`, error);
      setOgpErrorMap(prev => ({ ...prev, [url]: "Failed to load link preview" }));
    } finally {
      setIsLoadingOgpMap(prev => ({ ...prev, [url]: false }));
    }
  };

  // Fetch file metadata and OGP data when component mounts or message changes
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

      // Reset OGP data when message changes
      setOgpDataList([]);
      setIsLoadingOgpMap({});
      setOgpErrorMap({});

      // Extract all URLs from the message
      const urls = extractAllUrls(cleaned);
      if (urls.length > 0) {
        urls.forEach(url => fetchOgpDataForUrl(url));
      }

      if (fileIds.length > 0) {
        fetchMeta(fileIds);
      } else {
        setFileMetadata([]);
      }
    } else {
      setCleanContent(message?.content || '');
      setFileMetadata([]);
      setOgpDataList([]);
    }
  }, [message]);

  const handleDownload = (fileId) => {
    if (fileId) {
      window.open(getFileDownloadUrl(fileId), '_blank');
    }
  };

  const renderMessageContent = () => {
    const parts = processMessageContent(cleanContent);
    if (!parts) return null;

    return (
      <p className="text-base mb-2 whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index}>{part.content}</span>;
          } else if (part.type === 'mention') {
            const mentionData = part.content;
            const mentionedUser = users.find(u => u.id === mentionData.id);

            return (
              <span
                key={index}
                className="text-blue-500 font-medium cursor-pointer hover:underline"
                title={mentionedUser?.displayName || mentionData.raw.substring(1)}
              >
                {mentionData.raw}
              </span>
            );
          }
          return null;
        })}
      </p>
    );
  }

  const handleDelete = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessage(messageId);
        console.log("Message deleted successfully");
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
    setShowOptionsMenu(false);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowOptionsMenu(false);
  };

  const handleEditSave = (updatedMessage) => {
    console.log("Message updated:", updatedMessage);
  };

  const handlePinMessage = async () => {
    try {
      await pinMessage(message.id);
      // set Pinned By
      console.log("Message pinned successfully");
      // You might want to refresh the message or update the UI here
    } catch (error) {
      console.error("Failed to pin message:", error);
    }
    setShowOptionsMenu(false);
  };

  const handleUnpinMessage = async () => {
    try {
      await unpinMessage(message.id);
      console.log("Message unpinned successfully");
      // You might want to refresh the message or update the UI here
    } catch (error) {
      console.error("Failed to unpin message:", error);
    }
    setShowOptionsMenu(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setShowOptionsMenu(false);
  };

  // Get avatar URL based on user ID
  const getAvatarUrl = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user?.iconFileId) {
      return getFileDownloadUrl(user.iconFileId);
    }
    return null;
  };

  // Render message indicator for channels
  const renderMessageIndicator = () => {
    if (message.channelId) {
      return (
        <div className="text-xs text-gray-500 mb-1">
          Message #{message.channelId?.substring(0, 8)}
        </div>
      );
    }
    return null;
  };

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Add a ref to the menu and check if the click was outside
      if (showOptionsMenu && !event.target.closest('.message-options-menu') &&
        !event.target.closest('.message-options-button')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu]);

  const messageBackgroundClass = pinningUser ? "bg-[#FCF1DB]" : "hover:bg-gray-50";

  return (
    <div
      className={`flex py-4 px-6 my-2 rounded-lg ${messageBackgroundClass} relative`}
      onMouseEnter={() => setShowMenuButton(true)}
      onMouseLeave={() => !showOptionsMenu && setShowMenuButton(false)}
    >
      {/* User avatar */}
      <div className="pt-2 mr-3 flex-shrink-0">
        {sender?.iconFileId ? (
          <img
            src={getAvatarUrl(message.userId)}
            alt={sender.displayName || "User"}
            className="w-10 h-10 rounded-lg object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://ui-avatars.com/api/?name=" + (sender.displayName || "User");
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
            {sender?.displayName?.charAt(0) || "U"}
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-grow">
        {pinningUser && (
          <div className="flex items-center mb-1">
            <span className="text-yellow-500 mr-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z" />
              </svg>
            </span>
            <span className="text-gray-600 text-lg">
              {pinningUser.displayName || pinningUser.name || "Someone"} pinned it.
            </span>
          </div>
        )}

        <div className="flex items-center mb-1">
          {/* bold font */}
          <h3 className=" text-gray-800 mr-4 text-xl font-bold">
            {sender?.displayName || message?.senderName || "Unknown"}
          </h3>

          <span className="text-sm mr-1 text-gray-500 flex items-center">
            {"@" + sender?.name}
          </span>

          <span className="text-sm text-gray-500 flex items-center">
            {message?.updatedAt ? formatTimestamp(message.updatedAt) : ''}
            {message?.createdAt && message?.createdAt !== message?.updatedAt && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 ml-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            )}
          </span>
        </div>

        {/* Message content */}
        <div className="text-gray-700">
          {renderMessageContent()}
        </div>

        {/* Display OGP previews for all links */}
        {ogpDataList.length > 0 && (
          <div className="mt-2 space-y-2">
            {ogpDataList.map((item, index) => (
              <OgpPreview key={index} data={item.data} />
            ))}
          </div>
        )}

        {/* Display attached files */}
        {fileMetadata.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-2">
              {fileMetadata.map((file) => (
                <div key={file?.id || Math.random()} className="flex items-center bg-gray-100 rounded-md p-2 max-w-full">
                  <span className="mr-2 text-lg">{getFileIcon(file?.mime)}</span>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && <div className="text-sm text-gray-400">Loading attachments...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>

      {/* Three dot menu button - only visible on hover */}
      {showMenuButton && (
        <button
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full message-options-button"
          onClick={(e) => {
            e.stopPropagation();
            setShowOptionsMenu(!showOptionsMenu);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      )}

      {/* Message options dropdown (appears on click of three dot menu) */}
      {showOptionsMenu && (
        <div className="absolute top-10 right-2 bg-white shadow-md rounded-md border border-gray-200 z-10 message-options-menu">
          <div className="py-1">
            {message.pinnedBy ? (
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={handleUnpinMessage}
              >
                <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Unpin Message
              </button>
            ) : (
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={handlePinMessage}
              >
                <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                Pin Message
              </button>
            )}

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={handleCopyText}
            >
              <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Text
            </button>

            {canEdit && (
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={handleEdit}
              >
                <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Message
              </button>
            )}

            {canDelete && (
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                onClick={() => handleDelete(message.id)}
              >
                <svg className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Message
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <MessageEditModal
          message={message}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default MessageItem;