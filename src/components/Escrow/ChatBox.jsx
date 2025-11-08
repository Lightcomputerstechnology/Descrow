import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, Paperclip } from 'lucide-react';
import chatService from '../../services/chatService';
import { formatRelativeTime } from '../../utils/escrowHelpers';
import toast from 'react-hot-toast';

const ChatBox = ({ escrowId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    // Start polling every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(true); // Silent fetch
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [escrowId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await chatService.getMessages(escrowId);
      
      if (response.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      if (!silent) {
        toast.error('Failed to load messages');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setSending(true);

      const response = await chatService.sendMessage(escrowId, newMessage.trim());

      if (response.success) {
        setMessages([...messages, response.data]);
        setNewMessage('');
      } else {
        toast.error('Failed to send message');
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 flex items-center justify-center">
        <Loader className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Chat
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Communicate securely with the other party
        </p>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.sender._id === currentUser.id;

            return (
              <div
                key={msg._id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    {!isCurrentUser && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {msg.sender.name}
                      </p>
                    )}
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                  <p
                    className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                      isCurrentUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatRelativeTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
