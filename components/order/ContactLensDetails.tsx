import React, { useState, useEffect } from 'react';

interface ContactLensDetailsProps {
  companyc: string;
  setCompanyc: (value: string) => void;
  brand: string;
  setBrand: (value: string) => void;
  modality: string;
  setModality: (value: string) => void;
  pack: string;
  setPack: (value: string) => void;
  ctype: string;
  setCtype: (value: string) => void;
  col: string;
  setCol: (value: string) => void;
  powertype: string;
  setPowertype: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
}

const ContactLensDetails: React.FC<ContactLensDetailsProps> = ({
  companyc, setCompanyc,
  brand, setBrand,
  modality, setModality,
  pack, setPack,
  ctype, setCtype,
  col, setCol,
  powertype, setPowertype,
  price, setPrice
}) => {
  const [expanded, setExpanded] = useState(() => {
    const savedState = localStorage.getItem('contactLensDetailsExpanded');
    return savedState ? JSON.parse(savedState) : false;
  });

  useEffect(() => {
    localStorage.setItem('contactLensDetailsExpanded', JSON.stringify(expanded));
  }, [expanded]);

  return (
    <div className="col-span-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Lens Details</h3>
      {/* Mandatory fields: Brand and Price */}
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Brand *</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Brand"
            required
          />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Price *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Price"
            required
            step="0.01"
          />
        </div>
      </div>

      {/* Toggle for additional options */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-sm font-medium text-indigo-600 hover:underline"
        >
          {expanded ? 'Hide Additional Options' : 'Show Additional Options'}
          <svg className={`ml-1 h-4 w-4 transform ${expanded ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expanded && (
          <div className="mt-4 grid grid-cols-6 gap-6">
            {/* Company */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <select
                value={companyc}
                onChange={(e) => setCompanyc(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Company</option>
                <option value="Acuvue">Acuvue</option>
                <option value="Bausch & Lomb">Bausch & Lomb</option>
                <option value="CooperVision">CooperVision</option>
              </select>
            </div>
            {/* Modality */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Modality</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Modality</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            {/* Pack Size */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Pack Size</label>
              <input
                type="number"
                value={pack}
                onChange={(e) => setPack(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Pack Size"
              />
            </div>
            {/* Lens Type */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Lens Type</label>
              <select
                value={ctype}
                onChange={(e) => setCtype(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Lens Type</option>
                <option value="Normal">Normal</option>
                <option value="Toric">Toric</option>
                <option value="Multifocal">Multifocal</option>
              </select>
            </div>
            {/* Power Type */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Power Type</label>
              <select
                value={powertype}
                onChange={(e) => setPowertype(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Power Type</option>
                <option value="Spectacle">Spectacle</option>
                <option value="Contact Lens">Contact Lens</option>
              </select>
            </div>
            {/* Color */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <select
                value={col}
                onChange={(e) => setCol(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Color</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Brown">Brown</option>
                <option value="Gray">Gray</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactLensDetails; 