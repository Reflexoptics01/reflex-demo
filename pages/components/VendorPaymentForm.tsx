import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { data } from '../home';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Vendor {
  id: string;
  name: string;
  outstandingBalance?: number;
}

interface VendorPaymentFormProps {
  onPaymentSubmit: () => void;
}

export default function VendorPaymentForm({ onPaymentSubmit }: VendorPaymentFormProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const [remainingBalance, setRemainingBalance] = useState<number>(0);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorsRef = collection(data, 'distributors');
        const snapshot = await getDocs(vendorsRef);
        const vendorsList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          outstandingBalance: doc.data().outstandingBalance || 0
        }));
        setVendors(vendorsList);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setError('Failed to load vendors');
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchVendorBalance = async () => {
      if (!selectedVendor) return;
      
      try {
        const vendorDoc = await getDoc(doc(data, 'distributors', selectedVendor));
        if (vendorDoc.exists()) {
          setRemainingBalance(vendorDoc.data().outstandingBalance || 0);
        }
      } catch (error) {
        console.error('Error fetching vendor balance:', error);
      }
    };

    fetchVendorBalance();
  }, [selectedVendor]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!selectedVendor || !amount || !paymentDate) {
        throw new Error('Please fill in all required fields');
      }

      let attachmentUrl = '';
      if (attachment) {
        const storage = getStorage();
        const storageRef = ref(storage, `vendor_payments/${Date.now()}_${attachment.name}`);
        await uploadBytes(storageRef, attachment);
        attachmentUrl = await getDownloadURL(storageRef);
      }

      // Add payment record
      const paymentData = {
        vendorId: selectedVendor,
        vendorName: vendors.find(v => v.id === selectedVendor)?.name,
        invoiceNumber,
        paymentDate,
        amount: parseFloat(amount),
        paymentMode,
        attachmentUrl,
        timestamp: Date.now(),
        type: 'payment'
      };

      await addDoc(collection(data, 'distledger'), paymentData);

      // Update vendor's outstanding balance
      const vendorRef = doc(data, 'distributors', selectedVendor);
      const newBalance = remainingBalance - parseFloat(amount);
      await updateDoc(vendorRef, {
        outstandingBalance: newBalance
      });

      // Reset form
      setSelectedVendor('');
      setInvoiceNumber('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setPaymentMode('cash');
      setAttachment(null);
      
      onPaymentSubmit();
    } catch (error) {
      console.error('Error submitting payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
            Vendor Name *
          </label>
          <select
            id="vendor"
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
            Invoice Number
          </label>
          <input
            type="text"
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
            Payment Date *
          </label>
          <input
            type="date"
            id="paymentDate"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700">
            Payment Mode *
          </label>
          <select
            id="paymentMode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="remainingBalance" className="block text-sm font-medium text-gray-700">
            Remaining Balance
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="text"
              id="remainingBalance"
              value={remainingBalance.toFixed(2)}
              className="mt-1 block w-full pl-7 rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
              disabled
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">
            Attachment
          </label>
          <input
            type="file"
            id="attachment"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            accept="image/*,.pdf"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Payment'}
        </button>
      </div>
    </form>
  );
} 