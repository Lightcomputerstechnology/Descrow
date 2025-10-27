import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import ChatSystem from '../components/ChatSystem';
import DeliveryTracking from '../components/DeliveryTracking';
import DeliveryProofUpload from '../components/DeliveryProofUpload';
import SignatureCapture from '../components/SignatureCapture';
import DisputeModal from '../components/DisputeModal';

const EscrowDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock escrow data - Replace with API call
  const [escrow, setEscrow] = useState({
    id: id,
    buyerId: '12345',
    buyerName: 'John Doe',
    sellerId: '67890',
    sellerName: 'TechStore Ltd',
    itemName: 'MacBook Pro 16"',
    itemDescription: 'Brand new MacBook Pro with M3 chip, 16GB RAM, 512GB SSD',
    amount: 2500,
    currency: 'USD',
    status: 'awaiting_delivery',
    createdAt: '2025-10-25T10:30:00Z',
    deliveryDate: '2025-10-28',
    autoReleaseDate: '2025-10-31',
    chatUnlocked: true,
    deliveryProof: {
      method: 'courier',
      courierName: 'DHL Express',
      trackingNumber: 'DHL123456789',
      estimatedDelivery: '2025-10-28',
      photos: ['package_photo.jpg'],
      gpsEnabled: false
    }
  });

  const [showChat, setShowChat] = useState(false);
  const [showDeliveryProof, setShowDeliveryProof] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showDispute, setShowDispute] = useState(false);

  const isBuyer = user.role === 'buyer';
  const isSeller = user.role === 'seller';

  const handleConfirmDelivery = () => {
    setShowSignature(true);
  };

  const handleSignatureComplete = (signatureData) => {
    // API call to confirm delivery with signature
    setEscrow({ ...escrow, status: 'completed' });
    setShowSignature(false);
    alert('Payment released to seller!');
  };

  const handleDisputeSubmit = (disputeData) => {
    // API call to create dispute
    setEscrow({ ...escrow, status: 'disputed' });
    setShowDispute(false);
    alert('Dispute submitted. Our team will review it shortly.');
  };

  const getStatusColor = (status) => {
    const colors = {
      'in_escrow': 'text-yellow-600',
      'awaiting_delivery': 'text-blue-600',
      'completed': 'text-green-600',
      'disputed': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{escrow.itemName}</h1>
              <p className="text-sm text-gray-600 mt-1">Escrow ID: {escrow.id}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {escrow.currency} ${escrow.amount.toLocaleString()}
              </p>
              <p className={`text-lg font-semibold capitalize ${getStatusColor(escrow.status)}`}>
                {escrow.status.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Buyer:</span>
                  <span className="font-semibold text-gray-900">{escrow.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seller:</span>
                  <span className="font-semibold text-gray-900">{escrow.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-semibold text-gray-900">{escrow.itemName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="text-gray-900 text-right max-w-xs">{escrow.itemDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">{new Date(escrow.createdAt).toLocaleString()}</span>
                </div>
                {escrow.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Delivery:</span>
                    <span className="text-gray-900">{escrow.deliveryDate}</span>
                  </div>
                )}
                {escrow.autoReleaseDate && escrow.status === 'awaiting_delivery' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto-Release Date:</span>
                    <span className="text-blue-600 font-semibold">{escrow.autoReleaseDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Tracking */}
            {escrow.deliveryProof && (
              <DeliveryTracking deliveryProof={escrow.deliveryProof} />
            )}

            {/* Actions for Seller */}
            {isSeller && escrow.status === 'in_escrow' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Actions</h2>
                <button
                  onClick={() => setShowDeliveryProof(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Mark as Shipped & Upload Proof
                </button>
              </div>
            )}

            {/* Actions for Buyer */}
            {isBuyer && escrow.status === 'awaiting_delivery' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleConfirmDelivery}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirm Delivery & Release Payment
                  </button>
                  <button
                    onClick={() => setShowDispute(true)}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Open Dispute
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Payment will auto-release on {escrow.autoReleaseDate} if no action taken
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden sticky top-4">
              <div className="bg-blue-600 text-white p-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h2 className="font-semibold">Chat</h2>
              </div>
              {escrow.chatUnlocked ? (
                <ChatSystem
                  escrowId={escrow.id}
                  userId={user.id}
                  userName={user.name}
                  otherPartyName={isBuyer ? escrow.sellerName : escrow.buyerName}
                />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Chat will unlock after payment is made</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showDeliveryProof && (
        <DeliveryProofUpload
          escrowId={escrow.id}
          onClose={() => setShowDeliveryProof(false)}
          onSuccess={(proofData) => {
            setEscrow({ 
              ...escrow, 
              status: 'awaiting_delivery',
              deliveryProof: proofData 
            });
            setShowDeliveryProof(false);
          }}
        />
      )}

      {showSignature && (
        <SignatureCapture
          onClose={() => setShowSignature(false)}
          onComplete={handleSignatureComplete}
        />
      )}

      {showDispute && (
        <DisputeModal
          escrowId={escrow.id}
          onClose={() => setShowDispute(false)}
          onSubmit={handleDisputeSubmit}
        />
      )}
    </div>
  );
};

export default EscrowDetails;
