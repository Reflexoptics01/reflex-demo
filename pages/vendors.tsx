import { getAuth } from "firebase/auth";
import { collection, deleteDoc, doc, getCountFromServer, getDocs, setDoc } from "firebase/firestore";
import Link from "next/link";
import Router from "next/router";
import { useState, useEffect } from "react";
import { data } from "../home";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUser(user.email);
    }
  }, []);
  
  async function deleteVendor(id, name) {
    await deleteDoc(doc(data, "distributors", id));
    const collref = collection(data, "distributors");
    const getVendors = async () => {
      const datas = await getDocs(collref);
      setVendors(
        datas.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    const coll2 = collection(data, "log");
    const snapshot1 = await getCountFromServer(coll2);
    const ids = (snapshot1.data().count + 101).toString();
    await setDoc(doc(data, "log", ids), {
      change: "Deleted vendor : "+ "name:" + name,
      user: user,
      timestamp: Date.now()
    });
    getVendors();
    setIsDeleteModalOpen(false);
    setVendorToDelete(null);
  }

  function sendProps(id, pname, phoneNo, gst, address, email, city, state, bank, ifsc, ac) {
    Router.push({
      pathname: "/pages/editvendor",
      query: {
        id,
        pname,
        phoneNo,
        gst,
        address,
        email,
        city,
        state,
        bank,
        ifsc,
        ac
      },
    });
  }

  useEffect(() => {
    const collref = collection(data, "distributors");
    const getVendors = async () => {
      const datas = await getDocs(collref);
      setVendors(
        datas.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor => 
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.gst?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
            <Link
              href="/pages/addvendor"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Vendor
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search vendors by name, city, or GST..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Vendor Cards */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate max-w-[70%]">
                      {vendor.name}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => sendProps(
                          vendor.id,
                          vendor.name,
                          vendor.phoneNo,
                          vendor.gst,
                          vendor.address,
                          vendor.email,
                          vendor.city,
                          vendor.state,
                          vendor.bank,
                          vendor.ifsc,
                          vendor.ac
                        )}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setVendorToDelete(vendor);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div className="col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Contact</dt>
                      <dd className="mt-1 text-sm text-gray-900 truncate">{vendor.phoneNo}</dd>
                    </div>
                    <div className="col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 truncate">{vendor.email}</dd>
                    </div>
                    <div className="col-span-1">
                      <dt className="text-sm font-medium text-gray-500">GST No.</dt>
                      <dd className="mt-1 text-sm text-gray-900 truncate">{vendor.gst}</dd>
                    </div>
                    <div className="col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900 truncate">{`${vendor.city || ''}, ${vendor.state || ''}`}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Bank Details</dt>
                      <dd className="mt-1 text-sm text-gray-900 truncate">
                        {vendor.bank ? `${vendor.bank} - ${vendor.ac}` : 'Not provided'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && vendorToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Vendor</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {vendorToDelete.name}? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                  onClick={() => deleteVendor(vendorToDelete.id, vendorToDelete.name)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setVendorToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 