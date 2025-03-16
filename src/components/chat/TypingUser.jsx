import React from 'react';
import { useChatState } from '../../contexts/ChatStateContext';
import { useAuth } from '../../contexts/AuthContext';

const TypingUser = () => {
    const { typingUsers } = useChatState();
    const { user } = useAuth();
    const API_BASE = 'https://traq.duckdns.org/api/v3';

    const typingUsersExcludingCurrentUser = typingUsers.filter((typingUser) => 
        typingUser.id !== user.data.id
    );

    return (
        <div className="chat-container ml-6">
            {typingUsersExcludingCurrentUser.length > 0 && (
                <div className="flex items-center text-xs text-gray-500 py-1">
                    <div className="flex flex-row">
                        {typingUsersExcludingCurrentUser.map((typingUser, index) => (
                            <div 
                                key={typingUser.id} 
                                className="relative border-2 border-white rounded-full overflow-hidden"
                                style={{ 
                                    marginLeft: index > 0 ? '-10px' : '0', 
                                    zIndex: typingUsersExcludingCurrentUser.length - index 
                                }}
                            >
                                <img 
                                    src={`${API_BASE}/files/${typingUser.iconFileId}?dl=1`}
                                    alt={typingUser.displayName}
                                    className="w-6 h-6 rounded-full object-cover"
                                    title={typingUser.displayName}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/default-avatar.png';
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <span className="ml-2">
                        {typingUsersExcludingCurrentUser.length === 1 ? ' is typing...' : ' are typing...'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TypingUser;