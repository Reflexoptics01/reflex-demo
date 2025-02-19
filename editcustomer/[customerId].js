'use client';

import { useEffect, useState, Fragment, useRef } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc, collection, setDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getAuth } from 'firebase/auth';

const EditCustomer = () => {
  const router = useRouter();
  const { customerId } = router.query;

  // Basic Information
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  
  // Address Information
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("");
  
  // Optical Specific Information
  const [preferredFrameType, setPreferredFrameType] = useState("");
  const [lastVisitDate, setLastVisitDate] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [balance, setBalance] = useState("0");
  const [patientId, setPatientId] = useState("");

  // UI State
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [use, setUser] = useState("");
  const cancelButtonRef = useRef(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUser(user.email);
    }
  }, []);

  // Fetch customer data when component mounts
  useEffect(() => {
    async function fetchCustomerData() {
      if (!customerId) return;

      try {
        const customerDoc = await getDoc(doc(db, "retailers", customerId));
        if (customerDoc.exists()) {
          const customerData = customerDoc.data();
          // Populate form fields
          setName(customerData.name || "");
          setPhone(customerData.phoneNo || "");
          setEmail(customerData.email || "");
          setAge(customerData.age || "");
          setGender(customerData.gender || "");
          setAddress(customerData.address || "");
          setCity(customerData.city || "");
          setState(customerData.state || "Karnataka");
          setPincode(customerData.pincode || "");
          setPreferredFrameType(customerData.preferredFrameType || "");
          setLastVisitDate(customerData.lastVisitDate || "");
          setPrescriptionNotes(customerData.prescriptionNotes || "");
          setCustomerNotes(customerData.customerNotes || "");
          setBalance(customerData.balance || "0");
          setPatientId(customerData.patientId || "");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching customer:", error);
        setIsLoading(false);
      }
    }

    fetchCustomerData();
  }, [customerId]);

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    if (!name.trim()) newErrors.name = "Name is required";
    
    // Phone validation
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    // City validation
    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    // Gender validation
    if (!gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 10);
    setPhone(sanitized);
  };

  async function updateCustomer() {
    if (!validateForm()) {
      setOpen(true);
      return;
    }

    try {
      const normalizedPhone = phone.replace(/[^0-9]/g, '').slice(-10);
      
      const customerData = {
        name: name.trim(),
        phoneNo: normalizedPhone,
        email: email || "",
        age: age || "",
        gender: gender || "male",
        balance: balance,
        address: address || "Address Not Specified",
        city: city || "Unknown City",
        state: state || "Karnataka",
        pincode: pincode || "",
        preferredFrameType: preferredFrameType || "",
        lastVisitDate: lastVisitDate || "",
        prescriptionNotes: prescriptionNotes || "",
        customerNotes: customerNotes || "",
        patientId: patientId || null,
        updatedAt: Date.now(),
      };

      await updateDoc(doc(db, "retailers", customerId), customerData);

      const logRef = collection(db, "log");
      const logSnapshot = await getCountFromServer(logRef);
      const logId = (logSnapshot.data().count + 101).toString();

      await setDoc(doc(db, "log", logId), {
        change: "Updated customer: " + name,
        user: use,
        timestamp: Date.now()
      });

      setShowSuccessDialog(true);
      setTimeout(() => {
        router.push('/pages/retail');
      }, 2000);

    } catch (error) {
      console.error("Error updating customer:", error);
      setOpen(true);
      setErrors({
        submit: "Error updating customer. Please try again."
      });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Edit Customer</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white shadow rounded-lg">
          <form className="space-y-4 px-4 py-4">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-1 block w-full rounded-md ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`mt-1 block w-full rounded-md ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    min="0"
                    max="150"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="pt-2">
              <h3 className="text-md font-medium text-gray-900 mb-3">Address</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`mt-1 block w-full rounded-md ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option>Karnataka</option>
                    <option>Kerala</option>
                    <option>Tamil Nadu</option>
                    <option>Telangana</option>
                    <option>Andhra Pradesh</option>
                    <option>Maharashtra</option>
                    <option>Goa</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    id="pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Optical Information Section */}
            <div className="pt-2">
              <h3 className="text-md font-medium text-gray-900 mb-3">Optical Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-3">
                  <label htmlFor="preferredFrameType" className="block text-sm font-medium text-gray-700">
                    Preferred Frame Type
                  </label>
                  <select
                    id="preferredFrameType"
                    name="preferredFrameType"
                    value={preferredFrameType}
                    onChange={(e) => setPreferredFrameType(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Frame Type</option>
                    <option value="fullRim">Full Rim</option>
                    <option value="halfRim">Half Rim</option>
                    <option value="rimless">Rimless</option>
                    <option value="sports">Sports</option>
                    <option value="sunglasses">Sunglasses</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastVisitDate" className="block text-sm font-medium text-gray-700">
                    Last Visit Date
                  </label>
                  <input
                    type="date"
                    name="lastVisitDate"
                    id="lastVisitDate"
                    value={lastVisitDate}
                    onChange={(e) => setLastVisitDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="prescriptionNotes" className="block text-sm font-medium text-gray-700">
                    Prescription Notes
                  </label>
                  <textarea
                    name="prescriptionNotes"
                    id="prescriptionNotes"
                    rows={2}
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter any previous prescription details..."
                  />
                </div>

                <div className="sm:col-span-12">
                  <label htmlFor="customerNotes" className="block text-sm font-medium text-gray-700">
                    Customer Notes
                  </label>
                  <textarea
                    name="customerNotes"
                    id="customerNotes"
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter any additional notes..."
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {Object.values(errors).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-end space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={() => router.push("/pages/retail")}
              className="rounded-md border border-gray-300 bg-white py-1.5 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={updateCustomer}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-1.5 px-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update Customer
            </button>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-[70]">
          <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Customer Updated Successfully!
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Customer has been updated. Redirecting to customer list...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[75]"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-[75] overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon
                          className="h-6 w-6 text-red-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          Form Validation Error
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Please fill in all required fields correctly before submitting.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setOpen(false)}
                    >
                      OK
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default EditCustomer; 