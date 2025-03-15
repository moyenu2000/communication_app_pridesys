import React, { useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import { useChatState } from '../../contexts/ChatStateContext';
import { useAuth } from '../../contexts/AuthContext'; // Assuming you have an AuthContext

const MessageList = () => {
    // const { messages, editMessage, deleteMessage } = useChatState();
    const { user } = useAuth(); 
    const { messages } = useChatState();
    
    return (
        <div>
            <div>
                {messages.map((message) => (
                    
    
                    <MessageItem 
                        key={message.id} 
                        message={message}
                        canEdit={message.userId === user?.data?.id}
                        canDelete={message.userId === user?.data?.id}
                        // onEdit={editMessage}
                        // onDelete={deleteMessage}
                    />
                ))}
            </div>
        </div>
    );
};

export default MessageList;