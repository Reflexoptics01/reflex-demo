import { PurchaseItem, PurchaseItemProps } from './PurchaseItem';
import { useState } from 'react';
import { PrescriptionEntryModal } from '../../components/PrescriptionEntryModal';
import { PencilIcon } from '@heroicons/react/24/outline';

interface BaseSaleItem {
  id: string;
  brand: string;
  quantity: string;
  price: string;
  notes: string;
  type: 'frame' | 'lens' | 'contact-lens' | 'accessory';
}

export interface LensSaleItem extends BaseSaleItem {
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
  prescription: {
    right: {
      sph: string;
      cyl: string;
      axis: string;
      add: string;
      pd: string;
      near: string;
    };
    left: {
      sph: string;
      cyl: string;
      axis: string;
      add: string;
      pd: string;
      near: string;
    };
  };
}

const lensCategories = ['Single Vision', 'Round Top (KT)', 'Progressive', 'Digital Progressive', 'Freeform Progressive', 'Flat Top (D)', 'Executive Bifocal', 'Trifocal', 'Digital Bifocal', 'Single Vision Lenticular', 'Lenticular Round Top'];
const lensMaterials = ['Plastic', 'Poly', 'Glass', 'MR7', 'MR8', 'Trivex', 'Polarised'];
const coatingTypes = ['UC', 'HC', 'HMC', 'ARC', 'SHMC'];
const companies = ['Dioptres', 'Essilor', 'Ziess', 'Vision Rx', 'Prime', 'Toko', 'Transe', 'Bonzer', 'Kodak', 'Alfa'];
const tintTypes = ['White', 'Bluecut', 'Photogrey (PG)', 'Photogray Bluecut', 'Photobrown', 'Photoblue', 'Photogreen', 'Photoemerald', 'Photographite', 'Photopink', 'Photopurple', 'Photosapphire', 'Photoamber', 'Photoamethyst', 'Photobrown Bluecut', 'SP2', 'B2'];
const indexTypes = ['1.50', '1.52', '1.53', '1.56', '1.59', '1.60', '1.67', '1.70', '1.74', '1.80', '1.90'];

export function SaleLensItem({
  item,
  index,
  showDetails,
  onUpdateItem,
  onToggleDetails,
}: Omit<PurchaseItemProps<LensSaleItem>, 'renderAdditionalFields'>) {
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const handlePrescriptionSave = (values: any) => {
    onUpdateItem(item.id, 'prescription', JSON.stringify(values));
  };

  const formatPrescriptionDisplay = (eye: 'right' | 'left') => {
    const p = item.prescription?.[eye] || {};
    const values = [];
    
    if (p.sph) values.push(`Dist: ${p.sph}`);
    if (p.add) values.push(`Add: ${p.add}`);
    if (p.near) values.push(`Near: ${p.near}`);
    if (p.cyl) values.push(`Cyl: ${p.cyl}`);
    if (p.axis) values.push(`Axis: ${p.axis}`);
    if (p.pd) values.push(`PD: ${p.pd}`);
    
    return values.join(' | ');
  };

  const renderLensFields = (lens: LensSaleItem, onUpdate: (id: string, field: keyof LensSaleItem, value: string) => void) => {
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

        {/* Prescription Section */}
        <div className="sm:col-span-6">
          <div className="mt-4 border rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-900">Prescription Details</h4>
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit Prescription
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded p-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Right Eye (OD)</h5>
                <p className="text-sm text-gray-600">{formatPrescriptionDisplay('right')}</p>
              </div>
              <div className="border rounded p-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Left Eye (OS)</h5>
                <p className="text-sm text-gray-600">{formatPrescriptionDisplay('left')}</p>
              </div>
            </div>
          </div>
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
    <>
      <PurchaseItem
        item={item}
        index={index}
        showDetails={showDetails}
        onUpdateItem={onUpdateItem}
        onToggleDetails={onToggleDetails}
        renderAdditionalFields={renderLensFields}
      />
      
      <PrescriptionEntryModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        initialValues={item.prescription || {
          right: { sph: '', cyl: '', axis: '', add: '', pd: '', near: '' },
          left: { sph: '', cyl: '', axis: '', add: '', pd: '', near: '' }
        }}
        onSave={handlePrescriptionSave}
      />
    </>
  );
} 