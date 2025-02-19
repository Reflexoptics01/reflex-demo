import { PurchaseItem, PurchaseItemProps } from './PurchaseItem';

interface BasePurchaseItem {
  id: string;
  brand: string;
  quantity: string;
  price: string;
  notes: string;
  type: 'frame' | 'lens' | 'contact-lens' | 'accessory';
}

export interface AccessoryItem extends BasePurchaseItem {
  category: string;
  model: string;
  material: string;
  color: string;
  size: string;
  type: 'accessory';
}

const accessoryCategories = [
  'Cases',
  'Cleaning Solutions',
  'Cleaning Cloths',
  'Chains',
  'Nose Pads',
  'Temple Tips',
  'Screws',
  'Tools',
  'Display Items',
  'Other'
];

const materials = ['Leather', 'Plastic', 'Metal', 'Microfiber', 'Silicone', 'Other'];

export function AccessoryPurchaseItem({
  item,
  index,
  showDetails,
  onUpdateItem,
  onToggleDetails,
}: Omit<PurchaseItemProps<AccessoryItem>, 'renderAdditionalFields'>) {
  const renderAccessoryFields = (accessory: AccessoryItem, onUpdate: (id: string, field: keyof AccessoryItem, value: string) => void) => {
    return (
      <>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={accessory.category}
            onChange={(e) => onUpdate(accessory.id, 'category', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select category</option>
            {accessoryCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            value={accessory.model}
            onChange={(e) => onUpdate(accessory.id, 'model', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Material</label>
          <select
            value={accessory.material}
            onChange={(e) => onUpdate(accessory.id, 'material', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select material</option>
            {materials.map(material => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <input
            type="text"
            value={accessory.color}
            onChange={(e) => onUpdate(accessory.id, 'color', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Size</label>
          <input
            type="text"
            value={accessory.size}
            onChange={(e) => onUpdate(accessory.id, 'size', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Standard, Large, etc."
          />
        </div>
      </>
    );
  };

  return (
    <PurchaseItem
      item={item}
      index={index}
      showDetails={showDetails}
      onUpdateItem={onUpdateItem}
      onToggleDetails={onToggleDetails}
      renderAdditionalFields={renderAccessoryFields}
    />
  );
} 