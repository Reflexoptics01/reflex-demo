import { PurchaseItem, PurchaseItemProps } from './PurchaseItem';

interface BasePurchaseItem {
  id: string;
  brand: string;
  quantity: string;
  price: string;
  notes: string;
  type: 'frame' | 'lens' | 'contact-lens' | 'accessory';
}

export interface ContactLensItem extends BasePurchaseItem {
  material: string;
  type: 'contact-lens';
  replacement: string;
  diameter: string;
  baseCurve: string;
  waterContent: string;
  company: string;
  pack: string;
  modality: string;
  col: string;
  ctype: string;
  powertype: string;
  clean: string;
  card: string;
  channel: string;
}

const companies = ['Celebration', 'Bausch Lomb', 'Cooper Vision', 'Alcon', 'Acuvue', 'Acme', 'Others'];
const modalities = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const lensTypes = ['Normal', 'Toric', 'Multifocal'];
const colors = ['NA', 'BLUE', 'GRAY', 'TURQUOISE', 'BROWN', 'PURPLE', 'GREEN', 'HAZEL', 'HONEY', 'MARINE', 'AQUA', 'PINK', 'SAPPHIRE'];

export function ContactLensPurchaseItem({
  item,
  index,
  showDetails,
  onUpdateItem,
  onToggleDetails,
}: Omit<PurchaseItemProps<ContactLensItem>, 'renderAdditionalFields'>) {
  const renderContactLensFields = (lens: ContactLensItem, onUpdate: (id: string, field: keyof ContactLensItem, value: string) => void) => {
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
          <label className="block text-sm font-medium text-gray-700">Modality</label>
          <select
            value={lens.modality}
            onChange={(e) => onUpdate(lens.id, 'modality', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Modality</option>
            {modalities.map(modality => (
              <option key={modality} value={modality}>
                {modality}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Pack</label>
          <input
            type="number"
            value={lens.pack}
            onChange={(e) => onUpdate(lens.id, 'pack', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="1"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Lens Type</label>
          <select
            value={lens.ctype}
            onChange={(e) => onUpdate(lens.id, 'ctype', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Type</option>
            {lensTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <select
            value={lens.col}
            onChange={(e) => onUpdate(lens.id, 'col', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {colors.map(color => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Power Type</label>
          <div className="flex gap-4">
            <div className="flex items-center">
              <input
                type="radio"
                id={`spec-${lens.id}`}
                name={`powertype-${lens.id}`}
                value="spec"
                checked={lens.powertype === "spec"}
                onChange={(e) => onUpdate(lens.id, 'powertype', e.target.value)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`spec-${lens.id}`} className="ml-2 text-sm text-gray-700">
                Spectacle Power Prescription
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id={`cont-${lens.id}`}
                name={`powertype-${lens.id}`}
                value="cont"
                checked={lens.powertype === "cont"}
                onChange={(e) => onUpdate(lens.id, 'powertype', e.target.value)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`cont-${lens.id}`} className="ml-2 text-sm text-gray-700">
                Contact Lens Power Prescription
              </label>
            </div>
          </div>
        </div>

        <div className="sm:col-span-6">
          <div className="grid grid-cols-3 gap-6">
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
      renderAdditionalFields={renderContactLensFields}
    />
  );
} 