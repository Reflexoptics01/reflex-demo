import React from 'react';

interface FrameDetailsProps {
  brand: string;
  setBrand: (value: string) => void;
  modelNumber: string;
  setModelNumber: (value: string) => void;
  size: string;
  setSize: (value: string) => void;
  frameType: string;
  setFrameType: (value: string) => void;
  shape: string;
  setShape: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  channel: boolean;
  setChannel: (value: boolean) => void;
  not: string;
  setNot: (value: string) => void;
}

const FrameDetails: React.FC<FrameDetailsProps> = ({
  brand, setBrand,
  modelNumber, setModelNumber,
  size, setSize,
  frameType, setFrameType,
  shape, setShape,
  color, setColor,
  quantity, setQuantity,
  price, setPrice,
  channel, setChannel,
  not, setNot
}) => {
  return (
    <div className="col-span-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Frame Details</h3>
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Brand *</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Model Number</label>
          <input
            type="text"
            value={modelNumber}
            onChange={(e) => setModelNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Size</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. 52-18-140"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Frame Type</label>
          <select
            value={frameType}
            onChange={(e) => setFrameType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select type</option>
            <option value="full-frame">Full Frame</option>
            <option value="supra">Supra</option>
            <option value="rimless">Rimless</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Shape</label>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select shape</option>
            <option value="square">Square</option>
            <option value="rectangular">Rectangular</option>
            <option value="round">Round</option>
            <option value="different">Different</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Quantity *</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Price (Including GST) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="col-span-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={channel}
              onChange={() => setChannel(!channel)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="ml-2 block text-sm text-gray-700">Receipt Required</label>
          </div>
        </div>

        <div className="col-span-6">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={not}
            onChange={(e) => setNot(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Add any additional notes here..."
          />
        </div>
      </div>
    </div>
  );
};

export default FrameDetails; 