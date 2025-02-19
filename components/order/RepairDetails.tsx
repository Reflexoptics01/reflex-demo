import React from 'react';

interface RepairDetailsProps {
  repairPart: string;
  setRepairPart: (value: string) => void;
  charge: string;
  setCharge: (value: string) => void;
}

const RepairDetails: React.FC<RepairDetailsProps> = ({
  repairPart,
  setRepairPart,
  charge,
  setCharge,
}) => {
  return (
    <div className="col-span-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Repair Details</h3>
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Repair Part *</label>
          <input
            type="text"
            value={repairPart}
            onChange={(e) => setRepairPart(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter repair part details"
            required
          />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Charge *</label>
          <input
            type="number"
            value={charge}
            onChange={(e) => setCharge(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter repair charge"
            required
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );
};

export default RepairDetails; 