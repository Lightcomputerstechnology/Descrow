import React, { useState } from 'react';
import { X, Upload, Camera, MapPin } from 'lucide-react';

const DeliveryProofUpload = ({ escrowId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    method: 'courier',
    // Courier fields
    courierName: '',
    trackingNumber: '',
    // Personal delivery fields
    vehicleType: '',
    plateNumber: '',
    driverName: '',
    driverPhoto: null,
    vehiclePhoto: null,
    // Other method fields
    methodDescription: '',
    // Common fields
    estimatedDelivery: '',
    packagePhotos: [],
    enableGPS: false,
    additionalNotes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileUpload = (e, fieldName) => {
    const files = Array.from(e.target.files);
    
    if (fieldName === 'packagePhotos') {
      setFormData({
        ...formData,
        [fieldName]: [...formData[fieldName], ...files]
      });
    } else {
      setFormData({
        ...formData,
        [fieldName]: files[0]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // API call to submit delivery proof
    const proofData = {
      method: formData.method,
      courierName: formData.courierName,
      trackingNumber: formData.trackingNumber,
      vehicleType: formData.vehicleType,
      plateNumber: formData.plateNumber,
      driverName: formData.driverName,
      estimatedDelivery: formData.estimatedDelivery,
      photos: formData.packagePhotos.map(f => f.name),
      gpsEnabled: formData.enableGPS
    };

    onSuccess(proofData);
  };

  const renderMethodFields = () => {
    switch (formData.method) {
      case 'courier':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Courier Company * <span className="text-red-500">Required</span>
              </label>
              <select
                name="courierName"
                value={formData.courierName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select courier...</option>
                <option value="DHL">DHL Express</option>
                <option value="FedEx">FedEx</option>
                <option value="UPS">UPS</option>
                <option value="USPS">USPS</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number * <span className="text-red-500">Required</span>
              </label>
              <input
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tracking number"
                required
              />
            </div>
          </>
        );

      case 'personal':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type * <span className="text-red-500">Required</span>
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select vehicle type...</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bicycle">Bicycle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Plate Number * <span className="text-red-500">Required</span>
              </label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ABC-1234"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Name * <span className="text-red-500">Required</span>
              </label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Photo <span className="text-gray-500">Optional</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'driverPhoto')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {formData.driverPhoto && (
                <p className="text-sm text-green-600 mt-2">✓ {formData.driverPhoto.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Photo <span className="text-gray-500">Optional</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'vehiclePhoto')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {formData.vehiclePhoto && (
                <p className="text-sm text-green-600 mt-2">✓ {formData.vehiclePhoto.name}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableGPS"
                  checked={formData.enableGPS}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-blue-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Enable Live GPS Tracking <span className="text-gray-500">Optional</span>
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Allow buyer to track your location in real-time during delivery
                  </p>
                </div>
              </label>
            </div>
          </>
        );

      case 'other':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Method Description * <span className="text-red-500">Required</span>
            </label>
            <textarea
              name="methodDescription"
              value={formData.methodDescription}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bus service, Cargo company, Pickup..."
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Delivery Proof</h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 2</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Method * <span className="text-red-500">Required</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition">
                    <input
                      type="radio"
                      name="method"
                      value="courier"
                      checked={formData.method === 'courier'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`text-center ${formData.method === 'courier' ? 'text-blue-600' : 'text-gray-600'}`}>
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">Courier</p>
                      <p className="text-xs mt-1">DHL, FedEx, etc.</p>
                    </div>
                  </label>

                  <label className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition">
                    <input
                      type="radio"
                      name="method"
                      value="personal"
                      checked={formData.method === 'personal'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`text-center ${formData.method === 'personal' ? 'text-blue-600' : 'text-gray-600'}`}>
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">Personal</p>
                      <p className="text-xs mt-1">Car, bike, etc.</p>
                    </div>
                  </label>

                  <label className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition">
                    <input
                      type="radio"
                      name="method"
                      value="other"
                      checked={formData.method === 'other'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`text-center ${formData.method === 'other' ? 'text-blue-600' : 'text-gray-600'}`}>
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">Other</p>
                      <p className="text-xs mt-1">Custom method</p>
                    </div>
                  </label>
                </div>
              </div>

              {renderMethodFields()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date * <span className="text-red-500">Required</span>
                </label>
                <input
                  type="date"
                  name="estimatedDelivery"
                  value={formData.estimatedDelivery}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Next: Add Photos
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Photos * <span className="text-red-500">Required (At least 1)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'packagePhotos')}
                    className="hidden"
                    id="package-photos"
                  />
                  <label
                    htmlFor="package-photos"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Click to upload package photos
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB each</p>
                </div>
                {formData.packagePhotos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.packagePhotos.map((file, index) => (
                      <p key={index} className="text-sm text-green-600">✓ {file.name}</p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes <span className="text-gray-500">Optional</span>
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information about the delivery..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> After marking as shipped, the buyer will have 3 days 
                  after the expected delivery date to confirm receipt. If no action is taken, 
                  payment will be automatically released to you.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={formData.packagePhotos.length === 0}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Submit & Mark as Shipped
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DeliveryProofUpload;
