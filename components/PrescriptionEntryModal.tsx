import React, { useState, useEffect } from 'react';

interface PrescriptionValues {
  sph: string;
  cyl: string;
  axis: string;
  add: string;
  pd: string;
  near: string;
}

interface PrescriptionEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: {
    right: PrescriptionValues;
    left: PrescriptionValues;
  };
  onSave: (values: { right: PrescriptionValues; left: PrescriptionValues }) => void;
}

export function PrescriptionEntryModal({ isOpen, onClose, initialValues, onSave }: PrescriptionEntryModalProps) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const calculateNearFromAdd = (eye: 'right' | 'left') => {
    const distSph = parseFloat(values[eye].sph) || 0;
    const add = parseFloat(values[eye].add) || 0;
    if (!isNaN(distSph) && !isNaN(add)) {
      const near = (distSph + add).toFixed(2);
      setValues(prev => ({
        ...prev,
        [eye]: {
          ...prev[eye],
          near: near
        }
      }));
    }
  };

  const calculateAddFromNear = (eye: 'right' | 'left') => {
    const distSph = parseFloat(values[eye].sph) || 0;
    const near = parseFloat(values[eye].near) || 0;
    if (!isNaN(distSph) && !isNaN(near)) {
      const add = (near - distSph).toFixed(2);
      setValues(prev => ({
        ...prev,
        [eye]: {
          ...prev[eye],
          add: add
        }
      }));
    }
  };

  const handleChange = (eye: 'right' | 'left', field: keyof PrescriptionValues, value: string) => {
    setValues(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [field]: value
      }
    }));

    // Auto-calculate based on which field was changed
    if (field === 'add') {
      calculateNearFromAdd(eye);
    } else if (field === 'near') {
      calculateAddFromNear(eye);
    } else if (field === 'sph') {
      // Recalculate both if distance SPH changes
      if (values[eye].add) {
        calculateNearFromAdd(eye);
      } else if (values[eye].near) {
        calculateAddFromNear(eye);
      }
    }
  };

  const handleSave = () => {
    onSave(values);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Enter Prescription Details</h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Right Eye */}
          <div className="space-y-4">
            <h3 className="font-medium">Right Eye (OD)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700">Distance SPH</label>
                <input
                  type="number"
                  step="0.25"
                  value={values.right.sph}
                  onChange={(e) => handleChange('right', 'sph', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">CYL</label>
                <input
                  type="number"
                  step="0.25"
                  value={values.right.cyl}
                  onChange={(e) => handleChange('right', 'cyl', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">AXIS</label>
                <input
                  type="number"
                  value={values.right.axis}
                  onChange={(e) => handleChange('right', 'axis', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">ADD</label>
                <input
                  type="number"
                  step="0.25"
                  value={values.right.add}
                  onChange={(e) => handleChange('right', 'add', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">NEAR</label>
                <input
                  type="number"
                  step="0.25"
                  value={values.right.near}
                  onChange={(e) => handleChange('right', 'near', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">PD</label>
                <input
                  type="number"
                  step="0.5"
                  value={values.right.pd}
                  onChange={(e) => handleChange('right', 'pd', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Left Eye */}
          <div className="space-y-4">
            <h3 className="font-medium">Left Eye (OS)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700">Distance SPH</label>
                <input
                  type="number"
                  step="0.25"
                  value={values.left.sph}
                  onChange={(e) => handleChange('left', 'sph', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">CYL</label>
                <input
                  type="number"
                  step="0.25"
                  value={values.left.cyl}
                  onChange={(e) => handleChange('left', 'cyl', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">AXIS</label>
                <input
                  type="number"
                  value={values.left.axis}
                  onChange={(e) => handleChange('left', 'axis', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">ADD</label>
                <input
                  type="number"
                  step="0.25"
                  value={values.left.add}
                  onChange={(e) => handleChange('left', 'add', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">NEAR</label>
                <input
                  type="number"
                  step="0.25"
                  value={values.left.near}
                  onChange={(e) => handleChange('left', 'near', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">PD</label>
                <input
                  type="number"
                  step="0.5"
                  value={values.left.pd}
                  onChange={(e) => handleChange('left', 'pd', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 