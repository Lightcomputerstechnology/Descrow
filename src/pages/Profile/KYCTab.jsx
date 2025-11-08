import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  FileText,
  AlertCircle,
  Loader,
  Award
} from 'lucide-react';
import profileService from '../../services/profileService';
import toast from 'react-hot-toast';

const KYCTab = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [selectedTier, setSelectedTier] = useState('basic');
  const [formData, setFormData] = useState({
    personalInfo: {
      dateOfBirth: '',
      nationality: '',
      idNumber: '',
      idType: 'passport',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      }
    },
    businessInfo: {
      companyName: '',
      registrationNumber: '',
      taxId: '',
      businessType: ''
    }
  });

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await profileService.getKYCStatus();
      if (response.success) {
        setKycStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await profileService.submitKYC({
        ...formData,
        tier: selectedTier
      });

      if (response.success) {
        toast.success('KYC submitted successfully! We will review within 24-48 hours.');
        fetchKYCStatus();
        onUpdate && onUpdate();
      }
    } catch (error) {
      console.error('Submit KYC error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      unverified: {
        icon: XCircle,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        text: 'Unverified'
      },
      pending: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        text: 'Pending Review'
      },
      under_review: {
        icon: Clock,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        text: 'Under Review'
      },
      approved: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        text: 'Approved'
      },
      rejected: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        text: 'Rejected'
      }
    };

    const badge = badges[status] || badges.unverified;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  const tiers = [
    {
      id: 'basic',
      name: 'Basic Verification',
      price: 'Free',
      features: [
        'Up to $1,000 per transaction',
        '10 transactions per month',
        'Email support',
        'Basic ID verification'
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced Verification',
      price: '$15',
      popular: true,
      features: [
        'Up to $10,000 per transaction',
        '50 transactions per month',
        'Priority support',
        'Full KYC verification',
        'Business verification available'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Verification',
      price: '$50',
      features: [
        'Unlimited transaction amount',
        'Unlimited transactions',
        'Dedicated account manager',
        'Full KYC & business verification',
        'Custom features'
      ]
    }
  ];

  // If already approved
  if (kycStatus?.status === 'approved') {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
                Verification Complete!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Your account is fully verified
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-green-800 dark:text-green-300">
            <div className="flex justify-between">
              <span>Verification Tier:</span>
              <span className="font-semibold capitalize">{kycStatus.tier}</span>
            </div>
            <div className="flex justify-between">
              <span>Approved On:</span>
              <span className="font-semibold">
                {new Date(kycStatus.reviewedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Want to upgrade?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Contact support to upgrade your verification tier and unlock higher limits.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // If pending or under review
  if (kycStatus?.status === 'pending' || kycStatus?.status === 'under_review') {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
              Verification In Progress
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              We're reviewing your documents. This usually takes 24-48 hours.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-semibold capitalize">{kycStatus.status.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span>Submitted:</span>
            <span className="font-semibold">
              {new Date(kycStatus.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tier:</span>
            <span className="font-semibold capitalize">{kycStatus.tier}</span>
          </div>
        </div>
      </div>
    );
  }

  // If rejected
  if (kycStatus?.status === 'rejected') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                Verification Rejected
              </h3>
              <p className="text-red-700 dark:text-red-300">
                Your KYC submission was rejected
              </p>
            </div>
          </div>

          {kycStatus.rejectionReason && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                Reason:
              </p>
              <p className="text-sm text-red-800 dark:text-red-300">
                {kycStatus.rejectionReason}
              </p>
            </div>
          )}

          {kycStatus.resubmissionAllowed && (
            <p className="text-sm text-red-700 dark:text-red-300">
              You can resubmit your verification below with corrected information.
            </p>
          )}
        </div>

        {kycStatus.resubmissionAllowed && (
          <div className="text-center">
            <button
              onClick={() => setKycStatus({ ...kycStatus, status: 'unverified' })}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Resubmit Verification
            </button>
          </div>
        )}
      </div>
    );
  }

  // KYC Form (for unverified users)
  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification Status
          </h3>
          {getStatusBadge(kycStatus?.status || 'unverified')}
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Verify your identity to increase transaction limits and unlock premium features.
        </p>
      </div>

      {/* Tier Selection */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Verification Tier
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`relative border-2 rounded-xl p-6 text-left transition ${
                selectedTier === tier.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <Award className={`w-8 h-8 ${
                  selectedTier === tier.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </p>
                  {tier.price !== 'Free' && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">one-time</p>
                  )}
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {tier.name}
              </h4>

              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* KYC Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h3>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            name="personalInfo.dateOfBirth"
            value={formData.personalInfo.dateOfBirth}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nationality *
          </label>
          <input
            type="text"
            name="personalInfo.nationality"
            value={formData.personalInfo.nationality}
            onChange={handleChange}
            required
            placeholder="e.g., American"
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
          />
        </div>

        {/* ID Type & Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID Type *
            </label>
            <select
              name="personalInfo.idType"
              value={formData.personalInfo.idType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
            >
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="national_id">National ID</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID Number *
            </label>
            <input
              type="text"
              name="personalInfo.idNumber"
              value={formData.personalInfo.idNumber}
              onChange={handleChange}
              required
              placeholder="Enter ID number"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Residential Address *
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                name="personalInfo.address.street"
                value={formData.personalInfo.address.street}
                onChange={handleChange}
                required
                placeholder="Street Address"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
              />
            </div>
            <input
              type="text"
              name="personalInfo.address.city"
              value={formData.personalInfo.address.city}
              onChange={handleChange}
              required
              placeholder="City"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
            />
            <input
              type="text"
              name="personalInfo.address.state"
              value={formData.personalInfo.address.state}
              onChange={handleChange}
              required
              placeholder="State/Province"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
            />
            <input
              type="text"
              name="personalInfo.address.country"
              value={formData.personalInfo.address.country}
              onChange={handleChange}
              required
              placeholder="Country"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
            />
            <input
              type="text"
              name="personalInfo.address.postalCode"
              value={formData.personalInfo.address.postalCode}
              onChange={handleChange}
              required
              placeholder="Postal Code"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Business Info (for advanced/premium tiers) */}
        {(selectedTier === 'advanced' || selectedTier === 'premium') && (
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Business Information (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="businessInfo.companyName"
                value={formData.businessInfo.companyName}
                onChange={handleChange}
                placeholder="Company Name"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
              />
              <input
                type="text"
                name="businessInfo.registrationNumber"
                value={formData.businessInfo.registrationNumber}
                onChange={handleChange}
                placeholder="Registration Number"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
              />
              <input
                type="text"
                name="businessInfo.taxId"
                value={formData.businessInfo.taxId}
                onChange={handleChange}
                placeholder="Tax ID"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
              />
              <input
                type="text"
                name="businessInfo.businessType"
                value={formData.businessInfo.businessType}
                onChange={handleChange}
                placeholder="Business Type (e.g., LLC, Corporation)"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Document Upload */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Required Documents
          </h4>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-600 transition">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Government ID (Front & Back)
              </p>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Choose Files
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-600 transition">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Proof of Address (Utility bill, Bank statement)
              </p>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Choose File
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-medium mb-1">Verification Process:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-300">
                <li>Submit your information and documents</li>
                <li>Our team reviews within 24-48 hours</li>
                <li>You'll receive an email once approved</li>
                <li>Start transacting with higher limits!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit for Verification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KYCTab;
