import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface BasePurchaseItem {
  id: string;
  brand: string;
  quantity: string;
  price: string;
  notes: string;
  type: 'frame' | 'lens' | 'contact-lens' | 'accessory';
}

export interface PurchaseItemProps<T extends BasePurchaseItem> {
  item: T;
  index: number;
  showDetails: boolean;
  onUpdateItem: (id: string, field: keyof T, value: string) => void;
  onToggleDetails: (id: string) => void;
  renderAdditionalFields: (item: T, onUpdate: (id: string, field: keyof T, value: string) => void) => React.ReactNode;
}

export function PurchaseItem<T extends BasePurchaseItem>({
  item,
  index,
  showDetails,
  onUpdateItem,
  onToggleDetails,
  renderAdditionalFields
}: PurchaseItemProps<T>) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-8 text-sm text-gray-500">{index + 1}.</div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">Brand</label>
            <input
              type="text"
              value={item.brand}
              onChange={(e) => onUpdateItem(item.id, 'brand', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onUpdateItem(item.id, 'quantity', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.price}
              onChange={(e) => onUpdateItem(item.id, 'price', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Total</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              ₹{((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggleDetails(item.id)}
          className="p-1 text-gray-400 hover:text-gray-500"
        >
          {showDetails ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 ml-12 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {renderAdditionalFields(item, onUpdateItem)}
        </div>
      )}
    </div>
  );
} 