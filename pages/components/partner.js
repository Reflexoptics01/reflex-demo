import { collection, doc, getCountFromServer, getDocs, setDoc } from "firebase/firestore";
import { Fragment, useEffect, useState } from "react";
import { data } from "../../pages/home";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function VendorSelect({ id, status }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(status || "Not Assigned");

  useEffect(() => {
    const fetchVendors = async () => {
      const vendorsRef = collection(data, "distributors");
      const snapshot = await getDocs(vendorsRef);
      const vendorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setVendors(vendorsList);
    };
    fetchVendors();
  }, []);

  const handleVendorChange = async (vendorName) => {
    try {
      setSelectedVendor(vendorName);
      
      // Update the order with the new vendor
      await setDoc(doc(data, "orders", id), {
        partner: vendorName
      }, { merge: true });

      // Add to log
      const coll2 = collection(data, "log");
      const snapshot1 = await getCountFromServer(coll2);
      const logId = (snapshot1.data().count + 101).toString();
      
      await setDoc(doc(data, "log", logId), {
        change: `Updated vendor to ${vendorName} for order ${id}`,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error("Error updating vendor:", error);
      setSelectedVendor(status); // Revert on error
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {selectedVendor}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  onClick={() => handleVendorChange("Not Assigned")}
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  Not Assigned
                </a>
              )}
            </Menu.Item>
            {vendors.map((vendor) => (
              <Menu.Item key={vendor.id}>
                {({ active }) => (
                  <a
                    href="#"
                    onClick={() => handleVendorChange(vendor.name)}
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    {vendor.name}
                  </a>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 