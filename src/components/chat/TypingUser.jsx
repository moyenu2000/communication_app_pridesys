import React, { useState, useEffect } from 'react';
import { useChatState } from '../../contexts/ChatStateContext';
import { useAuth } from '../../contexts/AuthContext';

const TypingUser = () => {
    const { typingUsers } = useChatState();
    const { user } = useAuth();

    const typingUsersExcludingCurrentUser = typingUsers.filter((typingUser) => {
        console.log("Typing user:", typingUser);
        console.log("Current user:", user);
        return typingUser.id !== user.data.id;
    });

    const usernames = typingUsersExcludingCurrentUser.map((typingUser) => typingUser.displayName);

    return (
        <div className="chat-container">
            {usernames.length > 0 && (
                <div className="typing-indicator">
                    {usernames.join(', ')}
                    {usernames.length === 1 ? ' is typing...' : ' are typing...'}
                </div>
            )}
        </div>
    );
};

export default TypingUser;
