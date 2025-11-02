import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, DollarSign, MessageCircle } from 'lucide-react';
import { escrowService } from '../services/escrowService';
import { chatService } from '../services/chatService';
import { authService } from '../services/authService';

const EscrowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [escrow, setEscrow] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // ✅ Memoized function for fetching escrow details
  const fetchEscrowDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await escrowService.getEscrow(id);
      setEscrow(response.escrow);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load escrow details');
    } finally {
      setLoading(false);
    }
  }, [id]); // only re-runs when id changes

  // ✅ Memoized function for fetching chat messages
  const fetchChatMessages = useCallback(async () => {
    try {
      const response = await chatService.getMessages(id);
      setChatMessages(response.messages || []);
    } catch (err) {
      console.error('Failed to fetch chat messages', err);
    }
  }, [id]);

  // Fetch escrow details on mount
  useEffect(() => {
    fetchEscrowDetails();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [fetchEscrowDetails]);

  // Fetch chat messages periodically
  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchChatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage(id, newMessage);
      setNewMessage('');
      fetchChatMessages(); // refresh chat
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading escrow details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        {error}
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        No escrow details found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-blue-400 w-6 h-6" />
          <h1 className="text-2xl font-semibold">Escrow Transaction Details</h1>
        </div>

        <div className="space-y-4">
          <p><strong>ID:</strong> {escrow.id}</p>
          <p><strong>Buyer:</strong> {escrow.buyer?.name}</p>
          <p><strong>Seller:</strong> {escrow.seller?.name}</p>
          <p><strong>Amount:</strong> <DollarSign className="inline-block w-4 h-4 text-green-400" /> {escrow.amount}</p>
          <p><strong>Status:</strong> {escrow.status}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Chat Room
          </h2>
          <div className="bg-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <p className="text-gray-400 text-sm">No messages yet</p>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 p-2 rounded-lg ${
                    msg.senderId === user?.id
                      ? 'bg-blue-600 text-right ml-auto max-w-[75%]'
                      : 'bg-gray-600 text-left mr-auto max-w-[75%]'
                  }`}
                >
                  <p className="text-sm font-medium">{msg.senderName}</p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EscrowDetails;
