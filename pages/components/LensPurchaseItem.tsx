import { PurchaseItem, PurchaseItemProps } from './PurchaseItem';

interface BasePurchaseItem {
  id: string;
  brand: string;
  quantity: string;
  price: string;
  notes: string;
  type: 'frame' | 'lens' | 'contact-lens' | 'accessory';
}

export interface LensItem extends BasePurchaseItem {
  material: string;
  index: string;
  coating: string;
  category: string;
  diameter: string;
  company: string;
  tint: string;
  fog: string;
  clean: string;
  card: string;
  channel: string;
  type: 'lens';
}

const lensCategories = ['Single Vision', 'Round Top (KT)', 'Progressive', 'Digital Progressive', 'Freeform Progressive', 'Flat Top (D)', 'Executive Bifocal', 'Trifocal', 'Digital Bifocal', 'Single Vision Lenticular', 'Lenticular Round Top'];
const lensMaterials = ['Plastic', 'Poly', 'Glass', 'MR7', 'MR8', 'Trivex', 'Polarised'];
const coatingTypes = ['UC', 'HC', 'HMC', 'ARC', 'SHMC'];
const companies = ['Dioptres', 'Essilor', 'Ziess', 'Vision Rx', 'Prime', 'Toko', 'Transe', 'Bonzer', 'Kodak', 'Alfa'];
const tintTypes = ['White', 'Bluecut', 'Photogrey (PG)', 'Photogray Bluecut', 'Photobrown', 'Photoblue', 'Photogreen', 'Photoemerald', 'Photographite', 'Photopink', 'Photopurple', 'Photosapphire', 'Photoamber', 'Photoamethyst', 'Photobrown Bluecut', 'SP2', 'B2'];
const indexTypes = ['1.50', '1.52', '1.53', '1.56', '1.59', '1.60', '1.67', '1.70', '1.74', '1.80', '1.90'];

export function LensPurchaseItem({
  item,
  index,
  showDetails,
  onUpdateItem,
  onToggleDetails,
}: Omit<PurchaseItemProps<LensItem>, 'renderAdditionalFields'>) {
  const renderLensFields = (lens: LensItem, onUpdate: (id: string, field: keyof LensItem, value: string) => void) => {
    return (
      <>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <select
            value={lens.company}
            onChange={(e) => onUpdate(lens.id, 'company', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Company</option>
            {companies.map(company => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Material</label>
          <select
            value={lens.material}
            onChange={(e) => onUpdate(lens.id, 'material', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Material</option>
            {lensMaterials.map(material => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Index</label>
          <select
            value={lens.index}
            onChange={(e) => onUpdate(lens.id, 'index', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Index</option>
            {indexTypes.map(index => (
              <option key={index} value={index}>
                {index}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={lens.category}
            onChange={(e) => onUpdate(lens.id, 'category', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Category</option>
            {lensCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Base Tint</label>
          <select
            value={lens.tint}
            onChange={(e) => onUpdate(lens.id, 'tint', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Tint</option>
            {tintTypes.map(tint => (
              <option key={tint} value={tint}>
                {tint}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Coating</label>
          <select
            value={lens.coating}
            onChange={(e) => onUpdate(lens.id, 'coating', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Coating</option>
            {coatingTypes.map(coating => (
              <option key={coating} value={coating}>
                {coating}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Diameter</label>
          <input
            type="text"
            value={lens.diameter}
            onChange={(e) => onUpdate(lens.id, 'diameter', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. 65mm"
          />
        </div>

        <div className="sm:col-span-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={lens.fog === 'true'}
                onChange={(e) => onUpdate(lens.id, 'fog', e.target.checked.toString())}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Fog Free</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={lens.clean === 'true'}
                onChange={(e) => onUpdate(lens.id, 'clean', e.target.checked.toString())}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Cleaning Solution</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={lens.card === 'true'}
                onChange={(e) => onUpdate(lens.id, 'card', e.target.checked.toString())}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Auth. Card</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={lens.channel === 'true'}
                onChange={(e) => onUpdate(lens.id, 'channel', e.target.checked.toString())}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Delivery Channel</label>
            </div>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={lens.notes}
            onChange={(e) => onUpdate(lens.id, 'notes', e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Add any additional notes here..."
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
      renderAdditionalFields={renderLensFields}
    />
  );
} 