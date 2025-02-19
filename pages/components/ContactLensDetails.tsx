import React from 'react';

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
  clean: boolean;
  setClean: (value: boolean) => void;
  card: boolean;
  setCard: (value: boolean) => void;
  channel: boolean;
  setChannel: (value: boolean) => void;
}

const ContactLensDetails: React.FC<ContactLensDetailsProps> = ({
  companyc, setCompanyc,
  brand, setBrand,
  modality, setModality,
  pack, setPack,
  ctype, setCtype,
  col, setCol,
  powertype, setPowertype,
  price, setPrice,
  clean, setClean,
  card, setCard,
  channel, setChannel
}) => {
  return (
    <div className="col-span-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Lens Details</h3>
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Company *</label>
          <select
            value={companyc}
            onChange={(e) => setCompanyc(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Company</option>
            <option>Celebration</option>
            <option>Bausch Lomb</option>
            <option>Cooper Vision</option>
            <option>Alcon</option>
            <option>Acuvue</option>
            <option>Acme</option>
            <option>Others</option>
          </select>
        </div>

        {companyc === "Others" && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Input Company *</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Modality *</label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Modality</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Pack *</label>
          <input
            type="number"
            value={pack}
            onChange={(e) => setPack(e.target.value)}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Lens Type *</label>
          <select
            value={ctype}
            onChange={(e) => setCtype(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Type</option>
            <option>Normal</option>
            <option>Toric</option>
            <option>Multifocal</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <select
            value={col}
            onChange={(e) => setCol(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option>NA</option>
            <option>BLUE</option>
            <option>GRAY</option>
            <option>TURQUOISE</option>
            <option>BROWN</option>
            <option>PURPLE</option>
            <option>GREEN</option>
            <option>HAZEL</option>
            <option>HONEY</option>
            <option>MARINE</option>
            <option>AQUA</option>
            <option>PINK</option>
            <option>SAPPHIRE</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Price (Including GST) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="col-span-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Power Type *</label>
          <div className="flex gap-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="spec"
                name="powertype"
                value="spec"
                checked={powertype === "spec"}
                onChange={(e) => setPowertype(e.target.value)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                required
              />
              <label htmlFor="spec" className="ml-2 text-sm text-gray-700">
                Spectacle Power Prescription
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="cont"
                name="powertype"
                value="cont"
                checked={powertype === "cont"}
                onChange={(e) => setPowertype(e.target.value)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="cont" className="ml-2 text-sm text-gray-700">
                Contact Lens Power Prescription
              </label>
            </div>
          </div>
        </div>

        <div className="col-span-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={clean}
                onChange={() => setClean(!clean)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Cleaning Solution</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={card}
                onChange={() => setCard(!card)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Auth. Card</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={channel}
                onChange={() => setChannel(!channel)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Delivery Channel</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactLensDetails; 