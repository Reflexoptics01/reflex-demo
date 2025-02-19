import { PurchaseItem, PurchaseItemProps } from './PurchaseItem';

interface BaseSaleItem {
  id: string;
  brand: string;
  quantity: string;
  price: string;
  notes: string;
  type: 'frame' | 'lens' | 'contact-lens' | 'accessory';
}

export interface FrameSaleItem extends BaseSaleItem {
  modelNumber: string;
  size: string;
  frameType: string;
  shape: string;
  color: string;
  type: 'frame';
  prescription: {
    right: {
      sph: string;
      cyl: string;
      axis: string;
      add: string;
      pd: string;
    };
    left: {
      sph: string;
      cyl: string;
      axis: string;
      add: string;
      pd: string;
    };
  };
}

const frameTypes = ['full-frame', 'supra', 'rimless'];
const shapeTypes = ['square', 'rectangular', 'round', 'different'];

export function SaleFrameItem({
  item,
  index,
  showDetails,
  onUpdateItem,
  onToggleDetails,
}: Omit<PurchaseItemProps<FrameSaleItem>, 'renderAdditionalFields'>) {
  const updatePrescription = (eye: 'right' | 'left', field: string, value: string) => {
    const updatedItem = { ...item };
    updatedItem.prescription = updatedItem.prescription || {
      right: { sph: '', cyl: '', axis: '', add: '', pd: '' },
      left: { sph: '', cyl: '', axis: '', add: '', pd: '' }
    };
    updatedItem.prescription[eye][field] = value;
    onUpdateItem(item.id, 'prescription', JSON.stringify(updatedItem.prescription));
  };

  const renderFrameFields = (frame: FrameSaleItem, onUpdate: (id: string, field: keyof FrameSaleItem, value: string) => void) => {
    return (
      <>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Model Number</label>
          <input
            type="text"
            value={frame.modelNumber}
            onChange={(e) => onUpdate(frame.id, 'modelNumber', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. F123"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Size</label>
          <input
            type="text"
            value={frame.size}
            onChange={(e) => onUpdate(frame.id, 'size', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. 52-18-140"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Frame Type</label>
          <select
            value={frame.frameType}
            onChange={(e) => onUpdate(frame.id, 'frameType', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select type</option>
            {frameTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Shape</label>
          <select
            value={frame.shape}
            onChange={(e) => onUpdate(frame.id, 'shape', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select shape</option>
            {shapeTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <input
            type="text"
            value={frame.color}
            onChange={(e) => onUpdate(frame.id, 'color', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Prescription Section */}
        <div className="sm:col-span-6">
          <div className="mt-4 border rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Prescription Details</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Right Eye */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Right Eye (OD)</h5>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">SPH</label>
                    <input
                      type="text"
                      value={frame.prescription?.right?.sph || ''}
                      onChange={(e) => updatePrescription('right', 'sph', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">CYL</label>
                    <input
                      type="text"
                      value={frame.prescription?.right?.cyl || ''}
                      onChange={(e) => updatePrescription('right', 'cyl', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">AXIS</label>
                    <input
                      type="text"
                      value={frame.prescription?.right?.axis || ''}
                      onChange={(e) => updatePrescription('right', 'axis', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">ADD</label>
                    <input
                      type="text"
                      value={frame.prescription?.right?.add || ''}
                      onChange={(e) => updatePrescription('right', 'add', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">PD</label>
                    <input
                      type="text"
                      value={frame.prescription?.right?.pd || ''}
                      onChange={(e) => updatePrescription('right', 'pd', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Left Eye */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Left Eye (OS)</h5>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">SPH</label>
                    <input
                      type="text"
                      value={frame.prescription?.left?.sph || ''}
                      onChange={(e) => updatePrescription('left', 'sph', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">CYL</label>
                    <input
                      type="text"
                      value={frame.prescription?.left?.cyl || ''}
                      onChange={(e) => updatePrescription('left', 'cyl', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">AXIS</label>
                    <input
                      type="text"
                      value={frame.prescription?.left?.axis || ''}
                      onChange={(e) => updatePrescription('left', 'axis', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">ADD</label>
                    <input
                      type="text"
                      value={frame.prescription?.left?.add || ''}
                      onChange={(e) => updatePrescription('left', 'add', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">PD</label>
                    <input
                      type="text"
                      value={frame.prescription?.left?.pd || ''}
                      onChange={(e) => updatePrescription('left', 'pd', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={frame.notes}
            onChange={(e) => onUpdate(frame.id, 'notes', e.target.value)}
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
      renderAdditionalFields={renderFrameFields}
    />
  );
} 