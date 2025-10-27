import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, Camera } from 'lucide-react';

const SignatureCapture = ({ onClose, onComplete }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState('draw'); // 'draw' or 'type' or 'photo'
  const [typedName, setTypedName] = useState('');
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && signatureMethod === 'draw') {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  }, [signatureMethod]);

  const startDrawing = (e) => {
    if (signatureMethod !== 'draw') return;
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || signatureMethod !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setTypedName('');
    setSelfiePhoto(null);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelfiePhoto(URL.createObjectURL(file));
      setHasDrawn(true);
    }
  };

  const handleConfirm = () => {
    let signatureData = {};

    if (signatureMethod === 'draw') {
      const canvas = canvasRef.current;
      signatureData = {
        type: 'drawn',
        data: canvas.toDataURL(),
        timestamp: new Date().toISOString()
      };
    } else if (signatureMethod === 'type') {
      signatureData = {
        type: 'typed',
        data: typedName,
        timestamp: new Date().toISOString()
      };
    } else if (signatureMethod === 'photo') {
      signatureData = {
        type: 'photo',
        data: selfiePhoto,
        timestamp: new Date().toISOString()
      };
    }

    onComplete(signatureData);
  };

  const canConfirm = () => {
    if (signatureMethod === 'draw' && hasDrawn) return true;
    if (signatureMethod === 'type' && typedName.trim() !== '') return true;
    if (signatureMethod === 'photo' && selfiePhoto) return true;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Confirm Delivery</h2>
            <p className="text-sm text-gray-600 mt-1">Sign to confirm you received the item</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Signature Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Signature Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSignatureMethod('draw');
                  clearSignature();
                }}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  signatureMethod === 'draw'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">✍️</div>
                <p className="font-semibold text-sm">Draw</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSignatureMethod('type');
                  clearSignature();
                }}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  signatureMethod === 'type'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">⌨️</div>
                <p className="font-semibold text-sm">Type</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSignatureMethod('photo');
                  clearSignature();
                }}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  signatureMethod === 'photo'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Camera className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold text-sm">Photo</p>
              </button>
            </div>
          </div>

          {/* Draw Signature */}
          {signatureMethod === 'draw' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Draw Your Signature
              </label>
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair bg-gray-50"
              />
              <button
                type="button"
                onClick={clearSignature}
                className="mt-3 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Signature
              </button>
            </div>
          )}

          {/* Type Signature */}
          {signatureMethod === 'type' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type Your Full Name
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => {
                  setTypedName(e.target.value);
                  setHasDrawn(e.target.value.trim() !== '');
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl font-serif"
                placeholder="John Doe"
              />
              {typedName && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <p className="text-4xl font-serif text-center">{typedName}</p>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confirm-typed"
                  required
                  className="rounded"
                />
                <label htmlFor="confirm-typed" className="text-sm text-gray-600">
                  I confirm this is my legal name
                </label>
              </div>
            </div>
          )}

          {/* Photo Signature */}
          {signatureMethod === 'photo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Take a Selfie with the Item (Optional Extra Proof)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="user"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              {!selfiePhoto ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 font-semibold">Click to take photo</p>
                  <p className="text-sm text-gray-500 mt-2">Take a selfie holding the received item</p>
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={selfiePhoto}
                    alt="Selfie proof"
                    className="w-full rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confirmation Text */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>By signing, you confirm that:</strong>
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
              <li>You have received the item as described</li>
              <li>The item is in satisfactory condition</li>
              <li>Payment will be released to the seller immediately</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm()}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Confirm & Release Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureCapture;
