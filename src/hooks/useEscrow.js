import { useState, useEffect } from 'react';
import escrowService from '../services/escrowService';

/**
 * Custom hook for managing escrow state
 */
export const useEscrow = (escrowId) => {
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (escrowId) {
      fetchEscrow();
    }
  }, [escrowId]);

  const fetchEscrow = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await escrowService.getEscrowById(escrowId);
      
      if (response.success) {
        setEscrow(response.data.escrow);
      } else {
        setError(response.message || 'Failed to fetch escrow');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch escrow');
    } finally {
      setLoading(false);
    }
  };

  const updateEscrow = (updates) => {
    setEscrow(prev => ({ ...prev, ...updates }));
  };

  return {
    escrow,
    loading,
    error,
    refetch: fetchEscrow,
    updateEscrow
  };
};
