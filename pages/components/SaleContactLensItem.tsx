import { PurchaseItem, PurchaseItemProps } from './PurchaseItem';

interface BaseSaleItem {
  id: string;
  brand: string;
  quantity: string;
  price: string;
  notes: string;
  type: 'frame' | 'lens' | 'contact-lens' | 'accessory';
}

export interface ContactLensSaleItem extends BaseSaleItem {
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
  prescription: {
    right: {
      sph: string;
      cyl: string;
      axis: string;
      add: string;
      bc: string;
      dia: string;
    };
    left: {
      sph: string;
      cyl: string;
      axis: string;
      add: string;
      bc: string;
      dia: string;
    };
  };
}

const companies = ['Celebration', 'Bausch Lomb', 'Cooper Vision', 'Alcon', 'Acuvue', 'Acme', 'Others'];
const modalities = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const lensTypes = ['Normal', 'Toric', 'Multifocal'];
const colors = ['NA', 'BLUE', 'GRAY', 'TURQUOISE', 'BROWN', 'PURPLE', 'GREEN', 'HAZEL', 'HONEY', 'MARINE', 'AQUA', 'PINK', 'SAPPHIRE'];

export function SaleContactLensItem({
  item,
  index,
  showDetails,
  onUpdateItem,
  onToggleDetails,
}: Omit<PurchaseItemProps<ContactLensSaleItem>, 'renderAdditionalFields'>) {
  const updatePrescription = (eye: 'right' | 'left', field: string, value: string) => {
    const updatedItem = { ...item };
    updatedItem.prescription = updatedItem.prescription || {
      right: { sph: '', cyl: '', axis: '', add: '', bc: '', dia: '' },
      left: { sph: '', cyl: '', axis: '', add: '', bc: '', dia: '' }
    };
    updatedItem.prescription[eye][field] = value;
    onUpdateItem(item.id, 'prescription', JSON.stringify(updatedItem.prescription));
  };

  const renderContactLensFields = (lens: ContactLensSaleItem, onUpdate: (id: string, field: keyof ContactLensSaleItem, value: string) => void) => {
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

        {/* Prescription Section */}
        <div className="sm:col-span-6">
          <div className="mt-4 border rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Prescription Details</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Right Eye */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Right Eye (OD)</h5>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">SPH</label>
                    <input
                      type="text"
                      value={lens.prescription?.right?.sph || ''}
                      onChange={(e) => updatePrescription('right', 'sph', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">CYL</label>
                    <input
                      type="text"
                      value={lens.prescription?.right?.cyl || ''}
                      onChange={(e) => updatePrescription('right', 'cyl', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">AXIS</label>
                    <input
                      type="text"
                      value={lens.prescription?.right?.axis || ''}
                      onChange={(e) => updatePrescription('right', 'axis', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">ADD</label>
                    <input
                      type="text"
                      value={lens.prescription?.right?.add || ''}
                      onChange={(e) => updatePrescription('right', 'add', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">BC</label>
                    <input
                      type="text"
                      value={lens.prescription?.right?.bc || ''}
                      onChange={(e) => updatePrescription('right', 'bc', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">DIA</label>
                    <input
                      type="text"
                      value={lens.prescription?.right?.dia || ''}
                      onChange={(e) => updatePrescription('right', 'dia', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Left Eye */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Left Eye (OS)</h5>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">SPH</label>
                    <input
                      type="text"
                      value={lens.prescription?.left?.sph || ''}
                      onChange={(e) => updatePrescription('left', 'sph', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">CYL</label>
                    <input
                      type="text"
                      value={lens.prescription?.left?.cyl || ''}
                      onChange={(e) => updatePrescription('left', 'cyl', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">AXIS</label>
                    <input
                      type="text"
                      value={lens.prescription?.left?.axis || ''}
                      onChange={(e) => updatePrescription('left', 'axis', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">ADD</label>
                    <input
                      type="text"
                      value={lens.prescription?.left?.add || ''}
                      onChange={(e) => updatePrescription('left', 'add', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">BC</label>
                    <input
                      type="text"
                      value={lens.prescription?.left?.bc || ''}
                      onChange={(e) => updatePrescription('left', 'bc', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">DIA</label>
                    <input
                      type="text"
                      value={lens.prescription?.left?.dia || ''}
                      onChange={(e) => updatePrescription('left', 'dia', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>
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