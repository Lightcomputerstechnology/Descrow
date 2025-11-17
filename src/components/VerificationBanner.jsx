// src/components/VerificationBanner.jsx - FRONTEND VERIFICATION PROMPT

import React from 'react';
import { AlertTriangle, Mail, Phone, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const VerificationBanner = ({ verificationStatus }) => {
  if (!verificationStatus) return null;

  const { email, phone, kyc } = verificationStatus;

  // All verified - show nothing
  if (email && phone && kyc) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
            Complete Your Verification
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
            Additional verification may be required for larger transactions
          </p>

          <div className="space-y-3">
            {/* Email Verification */}
            {!email && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      Email Verification
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Required for all transactions
                    </p>
                  </div>
                </div>
                <Link
                  to="/verify-email"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                >
                  Verify Now
                </Link>
              </div>
            )}

            {/* Phone Verification */}
            {email && !phone && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      Phone Verification
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Required for transactions above $100
                    </p>
                  </div>
                </div>
                <Link
                  to="/verify-phone"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                >
                  Verify Now
                </Link>
              </div>
            )}

            {/* KYC Verification */}
            {email && phone && !kyc && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      KYC Verification
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Required for transactions above $1,000
                    </p>
                  </div>
                </div>
                <Link
                  to="/verify-kyc"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                >
                  Start KYC
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationBanner;
