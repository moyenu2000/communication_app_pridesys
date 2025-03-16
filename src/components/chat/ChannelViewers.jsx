import React from 'react';
import { useInformation } from '../../contexts/InformationContext';
import { useChatState } from '../../contexts/ChatStateContext';

const ChannelViewers = () => {
    // useChatState
    const { currentChannelViewers } = useChatState();
    const { users } = useInformation();
    const API_BASE = 'https://traq.duckdns.org/api/v3';
    
    console.log(currentChannelViewers);

    const viewers = users.filter(user => currentChannelViewers.some(viewer => viewer.userId === user.id));

   

    return (
        <div className="flex flex-row items-center">
            {viewers.length > 0 && (
                <div className="flex flex-row-reverse">
                    {viewers.map((viewer, index) => (
                        <div 
                            key={viewer.id} 
                            className="relative border-2 border-white rounded-full overflow-hidden"
                            style={{ 
                                marginLeft: index > 0 ? '-10px' : '0', 
                                zIndex: viewers.length - index 
                            }}
                        >
                            <img 
                                src={viewer.iconFileId ? `${API_BASE}/files/${viewer.iconFileId}` : '/default-avatar.png'}
                                alt={viewer.displayName || 'User'}
                                className="w-6 h-6 rounded-full object-cover"
                                title={viewer.displayName || 'User'}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/default-avatar.png';
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChannelViewers;