import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MoreVertical, AlertCircle } from 'lucide-react';
import { getStatusInfo, formatCurrency, formatRelativeTime, getNextAction } from '../../utils/escrowHelpers';

const EscrowCard = ({ escrow, userRole, onQuickAction }) => {
  const navigate = useNavigate();
  const statusInfo = getStatusInfo(escrow.status);
  const nextAction = getNextAction(escrow, userRole);
  
  const otherParty = userRole === 'buyer' ? escrow.seller : escrow.buyer;
  const displayAmount = userRole === 'seller' && escrow.payment?.sellerReceives 
    ? escrow.payment.sellerReceives 
    : escrow.amount;

  return (
    <div 
      onClick={() => navigate(`/escrow/${escrow._id}`)}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {escrow.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userRole === 'buyer' ? 'Seller: ' : 'Buyer: '}
            <span className="font-medium">{otherParty?.name || otherParty?.email}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/escrow/${escrow._id}#chat`);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Amount & Status */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(displayAmount, escrow.currency)}
          </p>
          {userRole === 'seller' && escrow.payment?.platformFee && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Platform fee: {formatCurrency(escrow.payment.sellerFee)}
            </p>
          )}
        </div>
        
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          <span>{statusInfo.icon}</span>
          {statusInfo.text}
        </span>
      </div>

      {/* Description Preview */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {escrow.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-500">
          <span>{formatRelativeTime(escrow.createdAt)}</span>
          {escrow.dispute?.isDisputed && (
            <span className="ml-2 inline-flex items-center gap-1 text-red-600 dark:text-red-400">
              <AlertCircle className="w-3 h-3" />
              Disputed
            </span>
          )}
        </div>

        {nextAction.action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (nextAction.action === 'view') {
                navigate(`/escrow/${escrow._id}`);
              } else {
                onQuickAction && onQuickAction(escrow._id, nextAction.action);
              }
            }}
            disabled={nextAction.disabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              nextAction.primary
                ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {nextAction.text}
          </button>
        )}
      </div>
    </div>
  );
};

export default EscrowCard;
