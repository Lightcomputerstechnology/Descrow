import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image } from 'lucide-react';

const ChatSystem = ({ escrowId, userId, userName, otherPartyName }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 'other',
      senderName: otherPartyName,
      text: 'Hello! Thanks for your purchase. I will ship the item today.',
      timestamp: '2025-10-26T10:30:00Z',
      type: 'text'
    },
    {
      id: 2,
      senderId: userId,
      senderName: userName,
      text: 'Great! Looking forward to receiving it. Please send tracking info.',
      timestamp: '2025-10-26T10:35:00Z',
      type: 'text'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;

    const message = {
      id: messages.length + 1,
      senderId: userId,
      senderName: userName,
      text: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    // API call to send message
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // API call to upload file
    const message = {
      id: messages.length + 1,
      senderId: userId,
      senderName: userName,
      text: file.name,
      timestamp: new Date().toISOString(),
      type: 'file',
      fileUrl: URL.createObjectURL(file)
    };

    setMessages([...messages, message]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === userId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-lg px-4 py-2 ${
                  isOwn 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {message.senderName}
                    </p>
                  )}
                  
                  {message.type === 'text' ? (
                    <p className="text-sm">{message.text}</p>
                  ) : message.type === 'file' ? (
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                      >
                        {message.text}
                      </a>
                    </div>
                  ) : null}
                  
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          All messages are monitored for security purposes
        </p>
      </div>
    </div>
  );
};

export default ChatSystem;
