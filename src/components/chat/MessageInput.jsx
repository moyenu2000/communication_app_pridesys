import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useChatState } from '../../contexts/ChatStateContext';
import { useInformation } from '../../contexts/InformationContext';
import { postMessage, uploadFile } from '../../services/channelServices';

const MessageInput = () => {
    const { changeViewStat } = useWebSocket();
    const [inputValue, setInputValue] = useState("");
    const { selectedChat } = useChatState();
    const { users } = useInformation();
    const [viewState, setViewState] = useState('monitoring');
    const [files, setFiles] = useState([]);
    const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef(null);

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
        setFiles(selectedFiles);
    };

    const resetForm = () => {
        setInputValue("");
        setFiles([]);
        setShowMentionSuggestions(false);
        setMentionQuery("");
        setFilteredUsers([]);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = "";
        }
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
        if (selectedChat && (inputValue.trim() || (selectedChat && files.length > 0))) {
            try {
                let fileIds = [];
                
                if (files.length > 0) {
                    for (const file of files) {
                        const fileResponse = await uploadFile(selectedChat.id, file);
                        if (fileResponse && fileResponse.id) {
                            fileIds.push(fileResponse.id);
                        }
                    }
                }
                
                let messageText = inputValue.trim();
                
                // Process mentions in the message
                messageText = processMentions(messageText);
                
                if (fileIds.length > 0) {
                    const fileReference = `[file:${fileIds.join(',')}]`;
                    
                    if (messageText) {
                        messageText = `${messageText} ${fileReference}`;
                    } else {
                        messageText = fileReference;
                    }
                }
                
                if (messageText) {
                    const response = await postMessage(selectedChat.id, messageText);
                    console.log('Message sent:', response);
                }
                
                resetForm();
            } catch (error) {
                console.error('Error sending message or uploading files:', error);
            }
        }
    };

    useEffect(() => {
        const typingTimeout = setTimeout(() => {
            if (selectedChat) {
                changeViewStat(selectedChat.id, 'monitoring');
                setViewState('monitoring');
            }
        }, 4000);

        if (inputValue && selectedChat && viewState !== 'editing') {
            changeViewStat(selectedChat.id, 'editing');
            setViewState('editing');
        }

        return () => clearTimeout(typingTimeout);
    }, [inputValue, selectedChat, changeViewStat, viewState]);

    useEffect(() => {
        resetForm();
    }, [selectedChat]);

    const clearFiles = () => {
        setFiles([]);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = "";
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
        }
    };

    return (
        <div className="relative w-full">
            <div className="mb-2">{selectedChat ? selectedChat.name : 'Select a channel'}</div>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Use @ to mention users)"
                    className="w-full p-2 border rounded"
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

            <div className="mt-2">
                <input 
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="block"
                />
            </div>
            
            {files.length > 0 && (
                <div className="file-preview mt-2 p-2 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{files.length} file(s) selected</span>
                        <button 
                            onClick={clearFiles}
                            type="button"
                            className="text-red-500 text-sm hover:text-red-700"
                        >
                            Clear
                        </button>
                    </div>
                    <ul className="list-disc pl-5 text-sm">
                        {files.map((file, index) => (
                            <li key={index} className="truncate">{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            <button 
                onClick={handleSubmit}
                disabled={!selectedChat || (!inputValue.trim() && files.length === 0)}
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
                Send
            </button>
        </div>
    );
};

export default MessageInput;