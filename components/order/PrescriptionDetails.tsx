import React from 'react';

interface PrescriptionDetailsProps {
  // Right Eye
  sph: string;
  setSph: (value: string) => void;
  cyl: string;
  setCyl: (value: string) => void;
  axis: string;
  setAxis: (value: string) => void;
  add: string;
  setAdd: (value: string) => void;
  nos: string;
  setNos: (value: string) => void;
  refid_1: string;
  setRefid_1: (value: string) => void;
  
  // Left Eye
  sph_2: string;
  setSph_2: (value: string) => void;
  cyl_2: string;
  setCyl_2: (value: string) => void;
  axis_2: string;
  setAxis_2: (value: string) => void;
  add_2: string;
  setAdd_2: (value: string) => void;
  nos_2: string;
  setNos_2: (value: string) => void;
  refid_2: string;
  setRefid_2: (value: string) => void;
  hideRefId?: boolean;
  
  // New optional fields for Lens prescriptions
  rpd?: string;
  setRpd?: (value: string) => void;
  lpd?: string;
  setLpd?: (value: string) => void;
}

type Props = PrescriptionDetailsProps;
const PrescriptionDetails: React.FC<Props> = ({
  sph, setSph,
  cyl, setCyl,
  axis, setAxis,
  add, setAdd,
  nos, setNos,
  refid_1, setRefid_1,
  sph_2, setSph_2,
  cyl_2, setCyl_2,
  axis_2, setAxis_2,
  add_2, setAdd_2,
  nos_2, setNos_2,
  refid_2, setRefid_2,
  hideRefId,
  rpd, setRpd,
  lpd, setLpd
}) => {
  const formatNumber = (value: string): string => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };
  
  return (
    <div className="col-span-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Prescription Details</h3>
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Right Eye</h4>
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Spherical</label>
            <input
              type="number"
              value={sph}
              onChange={(e) => setSph(e.target.value)}
              onBlur={(e) => setSph(formatNumber(e.target.value))}
              step="0.25"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cylindrical</label>
            <input
              type="number"
              value={cyl}
              onChange={(e) => setCyl(e.target.value)}
              onBlur={(e) => setCyl(formatNumber(e.target.value))}
              step="0.25"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Axis</label>
            <input
              type="number"
              value={axis}
              onChange={(e) => setAxis(e.target.value)}
              min="0"
              max="180"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add</label>
            <input
              type="number"
              value={add}
              onChange={(e) => setAdd(e.target.value)}
              onBlur={(e) => setAdd(formatNumber(e.target.value))}
              step="0.25"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">PCs</label>
            <input
              type="number"
              value={nos}
              onChange={(e) => setNos(e.target.value)}
              min="0"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {!hideRefId && (
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ref ID</label>
            <input
              type="text"
              value={refid_1}
              onChange={(e) => setRefid_1(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          )}
        </div>
        {/* New Field for Right Eye: RPD (only for lens prescriptions) */}
        {!hideRefId && (
          <div className="mt-2 grid grid-cols-6 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">RPD</label>
              <input
                type="text"
                value={rpd || ''}
                onChange={(e) => setRpd(e.target.value)}
                placeholder="RPD"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Left Eye</h4>
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Spherical</label>
            <input
              type="number"
              value={sph_2}
              onChange={(e) => setSph_2(e.target.value)}
              onBlur={(e) => setSph_2(formatNumber(e.target.value))}
              step="0.25"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cylindrical</label>
            <input
              type="number"
              value={cyl_2}
              onChange={(e) => setCyl_2(e.target.value)}
              onBlur={(e) => setCyl_2(formatNumber(e.target.value))}
              step="0.25"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Axis</label>
            <input
              type="number"
              value={axis_2}
              onChange={(e) => setAxis_2(e.target.value)}
              min="0"
              max="180"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add</label>
            <input
              type="number"
              value={add_2}
              onChange={(e) => setAdd_2(e.target.value)}
              onBlur={(e) => setAdd_2(formatNumber(e.target.value))}
              step="0.25"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">PCs</label>
            <input
              type="number"
              value={nos_2}
              onChange={(e) => setNos_2(e.target.value)}
              min="0"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {!hideRefId && (
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ref ID</label>
            <input
              type="text"
              value={refid_2}
              onChange={(e) => setRefid_2(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          )}
        </div>
        {/* New Field for Left Eye: LPD (only for lens prescriptions) */}
        {!hideRefId && (
          <div className="mt-2 grid grid-cols-6 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">LPD</label>
              <input
                type="text"
                value={lpd || ''}
                onChange={(e) => setLpd(e.target.value)}
                placeholder="LPD"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionDetails; 