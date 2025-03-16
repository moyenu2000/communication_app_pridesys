
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import MessageItem from './MessageItem';
import { useChatState } from '../../contexts/ChatStateContext';
import { useAuth } from '../../contexts/AuthContext';

const MessageList = () => {
    const { user } = useAuth();
    const { 
        messages,
        addNewMessage,
        loading,
        hasMoreMessages
    } = useChatState();
    const [groupedMessages, setGroupedMessages] = useState({});
    const scrollContainerRef = useRef(null);
    const [prevHeight, setPrevHeight] = useState(0);
    const [initialLoad, setInitialLoad] = useState(true);
    const lastMessageRef = useRef(null);
   
    
    // Function to format date for grouping
    const formatDateHeader = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const messageDate = new Date(date);
        messageDate.setHours(0, 0, 0, 0);

        if (messageDate.getTime() === today.getTime()) {
            return "Today";
        } else if (messageDate.getTime() === yesterday.getTime()) {
            return "Yesterday";
        } else {
            return `${messageDate.getFullYear()}/${String(messageDate.getMonth() + 1).padStart(2, '0')}/${String(messageDate.getDate()).padStart(2, '0')}`;
        }
    };

    // Handle scroll to load more messages
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container || loading || !hasMoreMessages) return;

        // When scrolling near the top (threshold of 5px), load more messages
        if (container.scrollTop < 5) {
            // Store current scroll height before loading more messages
            setPrevHeight(container.scrollHeight);
            addNewMessage();
        }
    };

    // Group messages by date
    useEffect(() => {
        // Important: Clear grouped messages if messages array is empty
        if (!messages || messages.length === 0) {
            setGroupedMessages({});
            return;
        }

        // Sort messages by creation time (oldest first)
        const sortedMessages = [...messages].sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );

        // Group by date
        const groups = {};
        sortedMessages.forEach(message => {
            if (!message.createdAt) return;

            const dateKey = formatDateHeader(message.createdAt);
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });

        setGroupedMessages(groups);
    }, [messages]);
    useEffect(() => {
        if (initialLoad && Object.keys(groupedMessages).length > 0) {

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                        setInitialLoad(false);
                    }
                });
            });
        }
    }, [groupedMessages, initialLoad]);



    useEffect(() => {
        if (lastMessageRef.current && !initialLoad) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [groupedMessages, initialLoad]);
    

    // Add an empty state component when no messages are present
    if (Object.keys(groupedMessages).length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No messages in this channel yet
            </div>
        );
    }

    // Get the last group and last message for reference
    const dateGroups = Object.entries(groupedMessages);
    const lastGroup = dateGroups[dateGroups.length - 1];
    const lastMessageId = lastGroup ? lastGroup[1][lastGroup[1].length - 1]?.id : null;

    return (
        <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto" 
            onScroll={handleScroll}
        >
            {/* Loading indicator at top when fetching more messages */}
            {loading && hasMoreMessages && (
                <div className="flex justify-center p-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
            )}
            
            {/* Message groups */}
            {dateGroups.map(([date, messagesGroup]) => (
                <div key={date} className="mb-4">
                    {/* Date header */}
                    <div className="px-6 flex items-center justify-center my-3">
                        <div className="bg-gray-300 h-px flex-grow mr-3"></div>
                        <div className="inline-flex items-center bg-white px-3 py-1 text-sm text-gray-500 rounded-full shadow-sm border">
                            {date}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <div className="bg-gray-300 h-px flex-grow ml-3"></div>
                    </div>

                    {/* Messages for this date */}
                    {messagesGroup.map(message => (
                        <div 
                            key={message.id} 
                            ref={message.id === lastMessageId ? lastMessageRef : null}
                        >
                            <MessageItem
                                message={message}
                                canEdit={message.userId === user?.data?.id}
                                canDelete={message.userId === user?.data?.id}
                            />
                        </div>
                    ))}
                </div>
            ))}
            
        </div>
    );
};

export default MessageList;