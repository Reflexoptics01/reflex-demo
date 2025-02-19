import React, { useState } from 'react';

interface Accessory {
  name: string;
  quantity: number;
  price: number;
}

interface AccessoriesDetailsProps {
  accessories: Accessory[];
  setAccessories: (accessories: Accessory[]) => void;
  totalPrice: string;
  setTotalPrice: (price: string) => void;
}

const AccessoriesDetails: React.FC<AccessoriesDetailsProps> = ({
  accessories,
  setAccessories,
  totalPrice,
  setTotalPrice
}) => {
  const [newAccessory, setNewAccessory] = useState<Accessory>({
    name: '',
    quantity: 1,
    price: 0
  });

  const addAccessory = () => {
    if (newAccessory.name && newAccessory.quantity > 0 && newAccessory.price > 0) {
      const updatedAccessories = [...accessories, newAccessory];
      setAccessories(updatedAccessories);
      // Update total price
      const total = updatedAccessories.reduce((sum, acc) => sum + (acc.price * acc.quantity), 0);
      setTotalPrice(total.toString());
      // Reset form
      setNewAccessory({ name: '', quantity: 1, price: 0 });
    }
  };

  const removeAccessory = (index: number) => {
    const updatedAccessories = accessories.filter((_, i) => i !== index);
    setAccessories(updatedAccessories);
    // Update total price
    const total = updatedAccessories.reduce((sum, acc) => sum + (acc.price * acc.quantity), 0);
    setTotalPrice(total.toString());
  };

  return (
    <div className="col-span-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Accessories Details</h3>
      
      {/* Add new accessory form */}
      <div className="grid grid-cols-6 gap-4 mb-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Accessory Name *</label>
          <input
            type="text"
            value={newAccessory.name}
            onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter accessory name"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Quantity *</label>
          <input
            type="number"
            value={newAccessory.quantity}
            onChange={(e) => setNewAccessory({ ...newAccessory, quantity: parseInt(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="1"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Price *</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newAccessory.price}
              onChange={(e) => setNewAccessory({ ...newAccessory, price: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              step="0.01"
              required
            />
            <button
              type="button"
              onClick={addAccessory}
              className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* List of added accessories */}
      {accessories.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-900 mb-2">Added Accessories</h4>
          <div className="bg-white rounded-md shadow-sm">
            {accessories.map((accessory, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>{accessory.name}</div>
                  <div>Qty: {accessory.quantity}</div>
                  <div>₹{(accessory.price * accessory.quantity).toFixed(2)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAccessory(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="p-3 bg-gray-50 text-right font-medium">
              Total: ₹{totalPrice}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessoriesDetails; 