import React, { useEffect, useState } from 'react';
import MessageItem from './MessageItem';
import { useChatState } from '../../contexts/ChatStateContext';


const MessageList = () => {
    const {messages } = useChatState();


    return (
        <div>
            <div>
                {messages.map((message) => (
                    <MessageItem key={message.id} message={message} />
                ))}
            </div>
        </div>
    );
};

export default MessageList;
