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
  renderAdditionalFields?: (item: T, onUpdateItem: (id: string, field: keyof T, value: string) => void) => React.ReactNode;
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
    <div className="border-b border-gray-200 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
      </div>

      {/* Item Type selection as radio buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Item Type</label>
        <div className="flex items-center space-x-4">
          {['frame', 'lens', 'contact-lens', 'accessory'].map((type) => (
            <label key={type} className="inline-flex items-center">
              <input
                type="radio"
                name={`item-type-${item.id}`}
                value={type}
                checked={item.type === type}
                onChange={(e) => onUpdateItem(item.id, 'type', e.target.value)}
                className="form-radio text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-700">
                {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Show fields only if type is selected */}
      {item.type && (
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Required Fields */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              value={item.brand}
              onChange={(e) => onUpdateItem(item.id, 'brand', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdateItem(item.id, 'quantity', e.target.value)}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Price (per unit)</label>
            <div className="flex items-center">
              <input
                type="number"
                value={item.price}
                onChange={(e) => onUpdateItem(item.id, 'price', e.target.value)}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => onToggleDetails(item.id)}
                className="ml-2 mt-1 inline-flex items-center p-1 border border-gray-300 shadow-sm text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {showDetails ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Additional Fields */}
          {showDetails && (
            <>
              {renderAdditionalFields && renderAdditionalFields(item, onUpdateItem)}
              
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={item.notes}
                  onChange={(e) => onUpdateItem(item.id, 'notes', e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add any additional notes here..."
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 