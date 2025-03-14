import React from "react";

const MessageItem = ({ message }) => {
  return (
    <div className="p-2 border-b border-gray-300">
      <p className="text-sm text-gray-600">{message.senderName}</p>
      <p className="text-base">{message.content}</p>
      <span className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleTimeString()}</span>
    </div>
  );
};

export default MessageItem;
