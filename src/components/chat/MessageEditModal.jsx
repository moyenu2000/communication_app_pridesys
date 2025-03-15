import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useChatState } from '../../contexts/ChatStateContext';
import { useInformation } from '../../contexts/InformationContext';
import { postMessage, uploadFile, updateMessage, fetchFileMetadata } from '../../services/channelServices';
import { extractFileIds, cleanMessageContent, removeMentionFormatting } from '../../utils/util';

const MessageEditModal = ({ message, onClose, onSave }) => {
    const { changeViewStat } = useWebSocket();
    const [inputValue, setInputValue] = useState("");
    const { selectedChat } = useChatState();
    const { users } = useInformation();
    const [viewState, setViewState] = useState('editing');
    const [newFiles, setNewFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (message) {
            const cleanedContent = cleanMessageContent(message.content);
            const removedMentions = removeMentionFormatting(cleanedContent);
            setInputValue(removedMentions);
            const fileIds = extractFileIds(message.content);
            if (fileIds.length > 0) {
                fetchExistingFiles(fileIds);
            }
        }
    }, [message]);

    const fetchExistingFiles = async (fileIds) => {
        setIsLoading(true);
        try {
            const metadataPromises = fileIds.map(fileId =>
                fetchFileMetadata(fileId)
                    .catch(error => {
                        console.error(`Error fetching metadata for file ${fileId}:`, error);
                        return null;
                    })
            );

            const results = await Promise.all(metadataPromises);
            setExistingFiles(results.filter(meta => meta !== null));
        } catch (error) {
            console.error("Error fetching file metadata:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        setInputValue(newValue);
        setCursorPosition(cursorPos);
        
        // Check for @ character
        const textBeforeCursor = newValue.substring(0, cursorPos);
        
        // Find the last @ character before the cursor
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            // Check if there's a space or start of text before @ (or it's at the beginning)
            const isValidAtSymbol = lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ';
            
            if (isValidAtSymbol) {
                const mentionText = textBeforeCursor.substring(lastAtIndex + 1);
                // Check if there's a space after the @ character
                const hasSpaceAfterAt = mentionText.includes(' ');
                
                if (!hasSpaceAfterAt) {
                    setMentionQuery(mentionText);
                    setShowMentionSuggestions(true);
                    
                    // Filter users based on the mention query
                    const filtered = users.filter(user => 
                        user.name.toLowerCase().includes(mentionText.toLowerCase())
                    );
                    setFilteredUsers(filtered.slice(0, 5)); // Limit to 5 suggestions
                    return;
                }
            }
        }
        
        setShowMentionSuggestions(false);
    };

    const insertMention = (user) => {
        const beforeMention = inputValue.substring(0, cursorPosition - mentionQuery.length - 1);
        const afterMention = inputValue.substring(cursorPosition);
        
        // Create the mention object that will be sent
        const mentionObject = {
            type: "user",
            raw: `@${user.name}`,
            id: user.id
        };
        
        // Insert the mention as text for now
        const mentionText = `@${user.name}`;
        const newInputValue = beforeMention + mentionText + afterMention;
        
        setInputValue(newInputValue);
        setShowMentionSuggestions(false);
        
        // Set focus back to input
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                const newCursorPos = beforeMention.length + mentionText.length;
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setNewFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeExistingFile = (fileId) => {
        setExistingFiles(files => files.filter(file => file.id !== fileId));
    };

    const removeNewFile = (index) => {
        setNewFiles(files => files.filter((_, i) => i !== index));
    };

    const processMentions = (message) => {
        let processedMessage = message;
        
        // Regular expression to find @username patterns
        const mentionRegex = /@(\w+)/g;
        let match;
        let matches = [];
        
        // First collect all matches to avoid modifying the string while searching
        while ((match = mentionRegex.exec(message)) !== null) {
            matches.push({
                fullMatch: match[0],
                username: match[1],
                index: match.index
            });
        }
        
        // Process matches in reverse order to maintain correct indices
        for (let i = matches.length - 1; i >= 0; i--) {
            const { fullMatch, username, index } = matches[i];
            const matchedUser = users.find(user => 
                user.name.toLowerCase() === username.toLowerCase()
            );
            
            if (matchedUser) {
                const mentionObject = {
                    type: "user",
                    raw: `@${username}`,
                    id: matchedUser.id
                };
                
                const jsonMention = `!${JSON.stringify(mentionObject)}`;
                
                // Replace the @username with the JSON mention
                processedMessage = 
                    processedMessage.substring(0, index) + 
                    jsonMention + 
                    processedMessage.substring(index + fullMatch.length);
            }
        }
        
        return processedMessage;
    };

    const handleSubmit = async () => {
        if (selectedChat && message) {
            try {
                setIsLoading(true);
                
                // Upload new files if any
                let newFileIds = [];
                if (newFiles.length > 0) {
                    for (const file of newFiles) {
                        const fileResponse = await uploadFile(selectedChat.id, file);
                        if (fileResponse && fileResponse.id) {
                            newFileIds.push(fileResponse.id);
                        }
                    }
                }
                
                // Process message content
                let messageText = inputValue.trim();
                messageText = processMentions(messageText);
                
                // Combine existing and new file IDs
                const existingFileIds = existingFiles.map(file => file.id);
                const allFileIds = [...existingFileIds, ...newFileIds];
                
                // Add file references to message if any files are present
                if (allFileIds.length > 0) {
                    const fileReference = `[file:${allFileIds.join(',')}]`;
                    
                    if (messageText) {
                        messageText = `${messageText} ${fileReference}`;
                    } else {
                        messageText = fileReference;
                    }
                }
                
                // Update the message
                if (messageText) {
                    const response = await updateMessage(message.id, messageText);
                    console.log('Message updated:', response);
                    
                    if (onSave) {
                        onSave(response);
                    }
                }
                
                // Close the modal
                if (onClose) {
                    onClose();
                }
            } catch (error) {
                console.error('Error updating message:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (showMentionSuggestions && filteredUsers.length > 0) {
            // Navigate through suggestions with arrow keys
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                // Implementation for keyboard navigation would go here
            }
            // Select suggestion with Enter or Tab
            else if (e.key === 'Enter' || e.key === 'Tab') {
                if (filteredUsers.length > 0) {
                    e.preventDefault();
                    insertMention(filteredUsers[0]);
                }
            }
            // Close suggestions with Escape
            else if (e.key === 'Escape') {
                e.preventDefault();
                setShowMentionSuggestions(false);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Edit Message</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="relative">
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message... (Use @ to mention users)"
                        className="w-full p-2 border rounded resize-y min-h-[100px]"
                    />
                    
                    {/* Mention suggestions dropdown */}
                    {showMentionSuggestions && filteredUsers.length > 0 && (
                        <div className="absolute bottom-full left-0 bg-white border rounded shadow-lg max-h-48 overflow-y-auto w-64 mb-1 z-10">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                    onClick={() => insertMention(user)}
                                >
                                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">@{user.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Existing files section */}
                {existingFiles.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Current Attachments</h3>
                        <div className="flex flex-wrap gap-2">
                            {existingFiles.map((file) => (
                                <div key={file.id} className="flex items-center bg-gray-100 rounded-md p-2">
                                    <div className="mr-2">{file.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                    <button 
                                        onClick={() => removeExistingFile(file.id)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                        title="Remove file"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New files section */}
                <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Add New Files</h3>
                    <input 
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className="block"
                    />
                </div>
                
                {newFiles.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{newFiles.length} new file(s)</span>
                        </div>
                        <ul className="list-disc pl-5 text-sm">
                            {newFiles.map((file, index) => (
                                <li key={index} className="flex justify-between items-center">
                                    <span className="truncate">{file.name}</span>
                                    <button 
                                        onClick={() => removeNewFile(index)}
                                        className="ml-2 text-red-500 hover:text-red-700 text-xs"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="flex justify-end mt-4 space-x-2">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageEditModal;