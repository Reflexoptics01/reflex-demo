import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { data } from "../home";
import { useState, useEffect } from "react";
import Router from "next/router";
import { getAuth } from "firebase/auth";

export default function AddVendor() {
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    phoneNumber: "",
    alternatePhone: "",
    email: "",
    website: "",
    gstNumber: "",
    panNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    creditPeriod: "",
    creditLimit: "",
    category: "",
    notes: ""
  });

  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [assign, setAssign] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUser(user.email);
    }
  }, []);

  useEffect(() => {
    const fetchAndUpdateVendor = async () => {
      if (!orders.length) return;
      
      try {
        let vendorId = null;
        const currentOrder = orders[0];

        // First check if vendor was assigned from home page
        if (assign) {
          vendorId = assign;
          // Update order document to maintain consistency
          const orderRef = doc(data, "orders", currentOrder.id);
          await updateDoc(orderRef, {
            vendorId: assign,
            assign: assign
          });
          console.log('Order updated with vendor from home page:', assign);
        } 
        // If no assign parameter, use vendorId from order
        else if (currentOrder.vendorId) {
          vendorId = currentOrder.vendorId;
        }

        // Fetch vendor details if we have a vendorId
        if (vendorId) {
          const vendorDoc = await getDoc(doc(data, 'distributors', vendorId));
          if (vendorDoc.exists()) {
            const vendorData = { ...vendorDoc.data(), id: vendorDoc.id };
            setVendor(vendorData);
            setSelectedVendorId(vendorId); // Set the dropdown to show current vendor
            console.log('Vendor data fetched:', vendorData);
          }
        }
      } catch (error) {
        console.error('Error in fetchAndUpdateVendor:', error);
      }
    };

    fetchAndUpdateVendor();
  }, [orders, assign]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function addVendor(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.businessName || !formData.contactPerson || !formData.phoneNumber) {
        throw new Error("Please fill in all required fields (Business Name, Contact Person, and Phone Number)");
      }

      const querySnapshot = await getDocs(collection(data, "distributors"));
      const coll = collection(data, "distributors");
      const snapshot = await getCountFromServer(coll);
      const count = snapshot.data().count;
      
      let id = count > 0 
        ? (parseInt(querySnapshot.docs[querySnapshot.docs.length - 1].id) + 1).toString()
        : "101";

      await setDoc(doc(data, "distributors", id), {
        name: formData.businessName,
        pname: formData.contactPerson,
        phoneNo: formData.phoneNumber,
        alternatePhone: formData.alternatePhone,
        email: formData.email,
        website: formData.website,
        gst: formData.gstNumber,
        pan: formData.panNumber,
        bank: formData.bankName,
        ac: formData.accountNumber,
        ifsc: formData.ifscCode,
        branch: formData.branchName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        creditPeriod: formData.creditPeriod,
        creditLimit: formData.creditLimit,
        category: formData.category,
        notes: formData.notes,
        createdAt: Date.now(),
        createdBy: user
      });

      const coll2 = collection(data, "log");
      const snapshot1 = await getCountFromServer(coll2);
      const logId = (snapshot1.data().count + 101).toString();
      await setDoc(doc(data, "log", logId), {
        change: "Added vendor : " + "name:" + formData.businessName,
        user: user,
        timestamp: Date.now()
      });

      Router.push("/pages/vendors");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const assignVendorToOrder = async (orderId, vendorId) => {
    if (!vendorId || !orderId) return;
    
    setIsAssigning(true);
    try {
      // Update order document with new vendor
      const orderRef = doc(data, "orders", orderId);
      await updateDoc(orderRef, {
        vendorId: vendorId,
        assign: vendorId
      });
      
      // Fetch and update vendor details in state
      const vendorDoc = await getDoc(doc(data, 'distributors', vendorId));
      if (vendorDoc.exists()) {
        const vendorData = { ...vendorDoc.data(), id: vendorDoc.id };
        setVendor(vendorData);
        console.log('Vendor successfully assigned:', vendorData);
      }
    } catch (error) {
      console.error("Error assigning vendor:", error);
      alert("Failed to assign vendor. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Add New Vendor
            </h2>
          </div>
        </div>

        <form onSubmit={addVendor} className="mt-8 space-y-8">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Primary details about the vendor.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      id="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      id="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700">
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      id="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      id="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Tax Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tax and registration details.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Bank Details</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Banking information for transactions.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      id="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      id="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="branchName" className="block text-sm font-medium text-gray-700">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      id="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Address</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vendor&apos;s address information.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a state</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                    </select>
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      id="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Other relevant details about the vendor.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="creditPeriod" className="block text-sm font-medium text-gray-700">
                      Credit Period (Days)
                    </label>
                    <input
                      type="number"
                      name="creditPeriod"
                      id="creditPeriod"
                      value={formData.creditPeriod}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700">
                      Credit Limit (₹)
                    </label>
                    <input
                      type="number"
                      name="creditLimit"
                      id="creditLimit"
                      value={formData.creditLimit}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Vendor Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a category</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Retailer">Retailer</option>
                    </select>
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => Router.push("/pages/vendors")}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 