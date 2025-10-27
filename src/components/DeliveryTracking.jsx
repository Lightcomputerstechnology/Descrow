import React from 'react';
import { Truck, Package, MapPin, Calendar, Camera } from 'lucide-react';

const DeliveryTracking = ({ deliveryProof }) => {
  const getMethodIcon = () => {
    switch (deliveryProof.method) {
      case 'courier':
        return <Truck className="w-6 h-6" />;
      case 'personal':
        return <MapPin className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          {getMethodIcon()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Delivery Tracking</h2>
          <p className="text-sm text-gray-600 capitalize">{deliveryProof.method} Delivery</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Courier Info */}
        {deliveryProof.method === 'courier' && (
          <>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Courier Company</span>
              <span className="font-semibold text-gray-900">{deliveryProof.courierName}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Tracking Number</span>
              <span className="font-mono font-semibold text-blue-600">{deliveryProof.trackingNumber}</span>
            </div>
          </>
        )}

        {/* Personal Delivery Info */}
        {deliveryProof.method === 'personal' && (
          <>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Vehicle Type</span>
              <span className="font-semibold text-gray-900 capitalize">{deliveryProof.vehicleType}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Plate Number</span>
              <span className="font-mono font-semibold text-gray-900">{deliveryProof.plateNumber}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Driver Name</span>
              <span className="font-semibold text-gray-900">{deliveryProof.driverName}</span>
            </div>
            {deliveryProof.gpsEnabled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Live GPS Tracking Active</p>
                  <p className="text-xs text-green-600">You can track the delivery in real-time</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Estimated Delivery */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Expected Delivery</span>
          </div>
          <span className="font-semibold text-gray-900">{deliveryProof.estimatedDelivery}</span>
        </div>

        {/* Photos */}
        {deliveryProof.photos && deliveryProof.photos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <Camera className="w-4 h-4" />
              <span className="font-medium">Delivery Photos</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {deliveryProof.photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={`https://via.placeholder.com/300x200?text=Photo+${index + 1}`}
                    alt={`Delivery proof ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Track Package Button */}
        {deliveryProof.method === 'courier' && deliveryProof.trackingNumber && (
          <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Track Package on Courier Website
          </button>
        )}

        {deliveryProof.gpsEnabled && (
          <button className="w-full mt-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5" />
            View Live Location
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
