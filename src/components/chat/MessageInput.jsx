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
    const fileInputRef = useRef(null);


    const handleInputChange = (e) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;

        setInputValue(newValue);
        setCursorPosition(cursorPos);

        // Check for @ character
        const textBeforeCursor = newValue.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const isValidAtSymbol = lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ';

            if (isValidAtSymbol) {
                const mentionText = textBeforeCursor.substring(lastAtIndex + 1);
                const hasSpaceAfterAt = mentionText.includes(' ');

                if (!hasSpaceAfterAt) {
                    setMentionQuery(mentionText);
                    setShowMentionSuggestions(true);

                    const filtered = users.filter(user =>
                        user.name.toLowerCase().includes(mentionText.toLowerCase())
                    );
                    setFilteredUsers(filtered.slice(0, 5));
                    return;
                }
            }
        }

        setShowMentionSuggestions(false);
    };

    const insertMention = (user) => {
        const beforeMention = inputValue.substring(0, cursorPosition - mentionQuery.length - 1);
        const afterMention = inputValue.substring(cursorPosition);
        const mentionText = `@${user.name}`;
        const newInputValue = beforeMention + mentionText + afterMention;

        setInputValue(newInputValue);
        setShowMentionSuggestions(false);

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
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const resetForm = () => {
        setInputValue("");
        setFiles([]);
        setShowMentionSuggestions(false);
        setMentionQuery("");
        setFilteredUsers([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const processMentions = (message) => {
        let processedMessage = message;
        const mentionRegex = /@(\w+)/g;
        let match;
        let matches = [];

        while ((match = mentionRegex.exec(message)) !== null) {
            matches.push({
                fullMatch: match[0],
                username: match[1],
                index: match.index
            });
        }

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

                processedMessage =
                    processedMessage.substring(0, index) +
                    jsonMention +
                    processedMessage.substring(index + fullMatch.length);
            }
        }

        return processedMessage;
    };

    const handleSubmit = async () => {
        if (selectedChat && (inputValue.trim() || files.length > 0)) {
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        } else if (showMentionSuggestions && filteredUsers.length > 0) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                // Implementation for keyboard navigation would go here
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                if (filteredUsers.length > 0) {
                    e.preventDefault();
                    insertMention(filteredUsers[0]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowMentionSuggestions(false);
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

    const openFileSelector = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleEmojiClick = () => {
        // Emoji picker functionality would go here
        console.log("Emoji button clicked");
    };

    const handleMentionClick = () => {
        const newValue = inputValue + "@";
        setInputValue(newValue);
        setShowMentionSuggestions(true);
        
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                const newPos = newValue.length;
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        }, 0);
    };

    const handleFormatClick = () => {
        // Text formatting functionality would go here
        console.log("Format button clicked");
    };

    return (
        <div className="w-full px-4 py-4">
            {selectedChat && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-2 text-gray-500 text-sm">
                        Message #{selectedChat.name}
                    </div>
                    
                    <div className="relative px-2 pb-2">
                        <div className="flex items-start">
                            <div className="flex items-center py-2">
                                <button 
                                    onClick={openFileSelector}
                                    className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300"
                                >
                                    <span className="text-2xl">+</span>
                                </button>
                            </div>
                            
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="w-full px-2 py-3 border-0 outline-none resize-none"
                                rows="1"
                                style={{ minHeight: '44px' }}
                            />
                            
                            <div className="flex items-center space-x-2 px-2">
                                <button 
                                    onClick={handleEmojiClick}
                                    className="w-8 h-8 text-gray-500 hover:text-gray-800 flex items-center justify-center"
                                >
                                    <span className="text-xl">😊</span>
                                </button>
                                <button 
                                    onClick={handleMentionClick}
                                    className="w-8 h-8 text-gray-500 hover:text-gray-800 flex items-center justify-center"
                                >
                                    <span className="text-xl">@</span>
                                </button>
                                <button 
                                    onClick={handleFormatClick}
                                    className="w-8 h-8 text-gray-500 hover:text-gray-800 flex items-center justify-center"
                                >
                                    <span className="text-xl">Aa</span>
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={!selectedChat || (!inputValue.trim() && files.length === 0)}
                                    className="w-8 h-8 text-gray-400 hover:text-gray-600 flex items-center justify-center disabled:opacity-50"
                                >
                                    <span className="text-xl">➤</span>
                                </button>
                            </div>
                        </div>

                        {/* Mention suggestions dropdown */}
                        {showMentionSuggestions && filteredUsers.length > 0 && (
                            <div className="absolute bottom-full left-12 bg-white border rounded shadow-lg max-h-48 overflow-y-auto w-64 mb-1 z-10">
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
                    
                    {/* File input (hidden) */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                    />
                    
                    {/* File preview area */}
                    {files.length > 0 && (
                        <div className="px-4 py-2 bg-gray-50 border-t">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{files.length} file(s) selected</span>
                                <button
                                    onClick={() => setFiles([])}
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
                </div>
            )}
            
            {!selectedChat && (
                <div className="text-center p-4 text-gray-500">
                    Select a channel to start messaging
                </div>
            )}
        </div>
    );
};

export default MessageInput;