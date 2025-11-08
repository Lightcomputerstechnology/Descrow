import { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';

/**
 * Custom hook for real-time chat with polling
 */
export const useChat = (escrowId, pollingInterval = 5000) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (escrowId) {
      fetchMessages();
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [escrowId]);

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await chatService.getMessages(escrowId);
      
      if (response.success) {
        setMessages(response.data.messages);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const sendMessage = async (message, attachments = []) => {
    try {
      setSending(true);

      const response = await chatService.sendMessage(escrowId, message, attachments);

      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    } finally {
      setSending(false);
    }
  };

  const startPolling = () => {
    intervalRef.current = setInterval(() => {
      fetchMessages(true);
    }, pollingInterval);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return {
    messages,
    loading,
    sending,
    unreadCount,
    sendMessage,
    refetch: fetchMessages
  };
};
