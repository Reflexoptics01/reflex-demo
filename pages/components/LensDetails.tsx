import React from 'react';

interface LensDetailsProps {
  company: string;
  setCompany: (value: string) => void;
  material: string;
  setMaterial: (value: string) => void;
  index: string;
  setIndex: (value: string) => void;
  lens: string;
  setLens: (value: string) => void;
  tint: string;
  setTint: (value: string) => void;
  coating: string;
  setCoating: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  brand: string;
  setBrand: (value: string) => void;
  dia: number;
  setDia: (value: number) => void;
  price: string;
  setPrice: (value: string) => void;
  fog: boolean;
  setFog: (value: boolean) => void;
  clean: boolean;
  setClean: (value: boolean) => void;
  card: boolean;
  setCard: (value: boolean) => void;
  channel: boolean;
  setChannel: (value: boolean) => void;
}

const LensDetails: React.FC<LensDetailsProps> = ({
  company, setCompany,
  material, setMaterial,
  index, setIndex,
  lens, setLens,
  tint, setTint,
  coating, setCoating,
  color, setColor,
  brand, setBrand,
  dia, setDia,
  price, setPrice,
  fog, setFog,
  clean, setClean,
  card, setCard,
  channel, setChannel
}) => {
  return (
    <div className="col-span-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Lens Details</h3>
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Company *</label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Company</option>
            <option>Dioptres</option>
            <option>Essilor</option>
            <option>Ziess</option>
            <option>Vision Rx</option>
            <option>Prime</option>
            <option>Toko</option>
            <option>Transe</option>
            <option>Bonzer</option>
            <option>Kodak</option>
            <option>Alfa</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Material *</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Material</option>
            <option>Plastic</option>
            <option>Poly</option>
            <option>Glass</option>
            <option>MR7</option>
            <option>MR8</option>
            <option>Trivex</option>
            <option>Polarised</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Index *</label>
          <select
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Index</option>
            <option>1.50</option>
            <option>1.52</option>
            <option>1.53</option>
            <option>1.56</option>
            <option>1.59</option>
            <option>1.60</option>
            <option>1.67</option>
            <option>1.70</option>
            <option>1.74</option>
            <option>1.80</option>
            <option>1.90</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Lens Type *</label>
          <select
            value={lens}
            onChange={(e) => setLens(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Type</option>
            <option>Single Vision</option>
            <option>Round Top (KT)</option>
            <option>Progressive</option>
            <option>Digital Progressive</option>
            <option>Freeform Progressive</option>
            <option>Flat Top (D)</option>
            <option>Executive Bifocal</option>
            <option>Trifocal</option>
            <option>Digital Bifocal</option>
            <option>Single Vision Lenticular</option>
            <option>Lenticular Round Top</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Base Tint</label>
          <select
            value={tint}
            onChange={(e) => setTint(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option>White</option>
            <option>Bluecut</option>
            <option>Photogrey (PG)</option>
            <option>Photogray Bluecut</option>
            <option>Photobrown</option>
            <option>Photoblue</option>
            <option>Photogreen</option>
            <option>Photoemerald</option>
            <option>Photographite</option>
            <option>Photopink</option>
            <option>Photopurple</option>
            <option>Photosapphire</option>
            <option>Photoamber</option>
            <option>Photoamethyst</option>
            <option>Photobrown Bluecut</option>
            <option>SP2</option>
            <option>B2</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Coating Type</label>
          <select
            value={coating}
            onChange={(e) => setCoating(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option>UC</option>
            <option>HC</option>
            <option>HMC</option>
            <option>ARC</option>
            <option>SHMC</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Brand *</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Diameter</label>
          <input
            type="number"
            value={dia}
            onChange={(e) => setDia(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
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
          <div className="grid grid-cols-4 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={fog}
                onChange={() => setFog(!fog)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Fog Free</label>
            </div>
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

export default LensDetails; 