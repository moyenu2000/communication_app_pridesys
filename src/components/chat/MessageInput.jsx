import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useChatState } from '../../contexts/ChatStateContext';
import { postMessage, uploadFile } from '../../services/channelServices';

const MessageInput = () => {
    const { changeViewStat } = useWebSocket();
    const [inputValue, setInputValue] = useState("");
    const { selectedChat } = useChatState();
    const [viewState, setViewState] = useState('monitoring');
    const [files, setFiles] = useState([]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const resetForm = () => {
        setInputValue("");
        setFiles([]);
        // Reset the file input element by clearing its value
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = "";
        }
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
    }, [inputValue]);

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

    return (
        <div>
            <span>{selectedChat ? selectedChat.name : 'Select a channel'}</span>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type a message..."
            />

            <input 
                type="file"
                onChange={handleFileChange}
                multiple // Enable multiple file selection
            />
            
            {files.length > 0 && (
                <div className="file-preview">
                    <p>
                        {files.length} file(s) selected
                        <button 
                            onClick={clearFiles}
                            type="button"
                            className="ml-2 text-red-500"
                        >
                            Clear
                        </button>
                    </p>
                    <ul>
                        {files.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            <button 
                onClick={handleSubmit}
                disabled={!selectedChat || (!inputValue.trim() && files.length === 0)}
            >
                Send
            </button>
        </div>
    );
};

export default MessageInput;