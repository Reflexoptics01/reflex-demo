import React from 'react';

interface Retailer {
  id: string;
  name: string;
  phoneNo: string;
  gst: string;
  balance: string;
}

interface AccountInfoProps {
  currassign: string;
  setCurrassign: (value: string) => void;
  dvt: string;
  setDvt: (value: string) => void;
  dist: Retailer[];
  filtered: Retailer[];
  setFiltered: (value: Retailer[]) => void;
  handleStatus: (name: string, phone: string, gst: string) => void;
}

const AccountInformation: React.FC<AccountInfoProps> = ({
  currassign,
  setCurrassign,
  dvt,
  setDvt,
  dist,
  filtered,
  setFiltered,
  handleStatus
}) => {
  return (
    <div className="col-span-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Account Name *</label>
          <div className="relative w-full">
            <input
              type="text"
              value={currassign}
              onChange={(e) => {
                const searchValue = e.target.value.toLowerCase();
                const filtered = dist.filter(d =>
                  d.name.toLowerCase().includes(searchValue)
                );
                setFiltered(filtered);
                setCurrassign(e.target.value);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              placeholder="Search accounts..."
              required
            />
            {currassign && filtered?.length > 0 && (
              <div className="absolute mt-1 w-full max-h-96 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  {filtered.map((dis) => (
                    <div
                      key={dis.id}
                      onClick={() => {
                        handleStatus(dis.name, dis.phoneNo, dis.gst);
                        setCurrassign(dis.name);
                        setFiltered([]);
                      }}
                      className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {dis.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Deliver to</label>
          <input
            type="text"
            value={dvt}
            onChange={(e) => setDvt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountInformation; 