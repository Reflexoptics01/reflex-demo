import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface CustomerPaymentFormProps {
  onPaymentSubmit: () => void;
}

const CustomerPaymentForm: React.FC<CustomerPaymentFormProps> = ({ onPaymentSubmit }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [showInvoiceSuggestions, setShowInvoiceSuggestions] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [remainingBalance, setRemainingBalance] = useState(0);

  const customerRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCustomers();
    
    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(event.target as Node)) {
        setShowCustomerSuggestions(false);
      }
      if (invoiceRef.current && !invoiceRef.current.contains(event.target as Node)) {
        setShowInvoiceSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedCustomer?.id) {
      fetchCustomerInvoices(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  const calculateRemainingBalance = useCallback(() => {
    const selectedInvoiceData = invoices.find(invoice => invoice.id === selectedInvoice);
    if (selectedInvoiceData) {
      const totalAmount = parseFloat(selectedInvoiceData.totalAmount?.toString() || '0');
      const paidAmount = parseFloat(amount || '0');
      const previouslyPaid = parseFloat(selectedInvoiceData.paidAmount?.toString() || '0');
      setRemainingBalance(totalAmount - (previouslyPaid + paidAmount));
    }
  }, [selectedInvoice, amount, invoices]);

  useEffect(() => {
    if (selectedInvoice) {
      calculateRemainingBalance();
    }
  }, [selectedInvoice, amount, calculateRemainingBalance]);

  const fetchCustomers = async () => {
    try {
      // First get all orders with pending payments
      const ordersRef = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);
      
      // Create a map to store customer IDs and their pending amounts
      const customerPendingMap = new Map();
      
      ordersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.balance > 0 && data.customerId) {
          const existing = customerPendingMap.get(data.customerId) || 0;
          customerPendingMap.set(data.customerId, existing + data.balance);
        }
      });

      // Only fetch details of customers with pending payments
      const customersRef = collection(db, 'retailers');
      const snapshot = await getDocs(customersRef);
      const customersList = snapshot.docs
        .filter(doc => customerPendingMap.has(doc.id))
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          pendingAmount: customerPendingMap.get(doc.id)
        }));

      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchCustomerInvoices = async (customerId: string) => {
    try {
      // Get all orders for the customer with pending balance
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('customerId', '==', customerId));
      const snapshot = await getDocs(q);
      
      // Only include orders with pending balance
      const invoicesList = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            invoiceNumber: data.id,
            pendingAmount: data.balance || 0,
            totalAmount: data.total || 0,
            paidAmount: (data.total || 0) - (data.balance || 0)
          };
        })
        .filter(invoice => invoice.pendingAmount > 0);

      setInvoices(invoicesList);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const filteredCustomers = customers
    .filter(customer => customer.name?.toLowerCase().includes(customerSearch.toLowerCase()))
    .sort((a, b) => b.pendingAmount - a.pendingAmount); // Sort by pending amount

  const filteredInvoices = invoices
    .filter(invoice => (invoice.invoiceNumber || invoice.id)?.toLowerCase().includes(invoiceSearch.toLowerCase()))
    .sort((a, b) => b.pendingAmount - a.pendingAmount); // Sort by pending amount

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowCustomerSuggestions(false);
  };

  const handleInvoiceSelect = (invoice: any) => {
    setSelectedInvoice(invoice);
    setInvoiceSearch(invoice.invoiceNumber || invoice.id);
    setShowInvoiceSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Add payment record
      const paymentData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        paymentMode,
        timestamp: new Date(),
        type: 'payment'
      };

      await addDoc(collection(db, 'payment'), paymentData);

      // Update order balance
      const orderRef = doc(db, 'orders', selectedInvoice.id);
      await updateDoc(orderRef, {
        balance: selectedInvoice.pendingAmount - parseFloat(amount)
      });

      // Reset form and refresh data
      setSelectedCustomer(null);
      setSelectedInvoice(null);
      setCustomerSearch('');
      setInvoiceSearch('');
      setPaymentDate('');
      setAmount('');
      setPaymentMode('');
      setRemainingBalance(0);
      
      // Refresh the customer list and trigger parent update
      fetchCustomers();
      onPaymentSubmit();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div ref={customerRef} className="relative">
          <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
            Customer Name
          </label>
          <input
            type="text"
            id="customer"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setShowCustomerSuggestions(true);
              setSelectedCustomer(null);
            }}
            onFocus={() => setShowCustomerSuggestions(true)}
            placeholder="Type to search customers..."
          />
          {showCustomerSuggestions && (
            <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
              <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {filteredCustomers.map((customer) => (
                  <li
                    key={customer.id}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white group"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{customer.name}</span>
                      <span className="text-sm text-gray-500 group-hover:text-white">₹{customer.pendingAmount.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div ref={invoiceRef} className="relative">
          <label htmlFor="invoice" className="block text-sm font-medium text-gray-700">
            Invoice Number
          </label>
          <input
            type="text"
            id="invoice"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={invoiceSearch}
            onChange={(e) => {
              setInvoiceSearch(e.target.value);
              setShowInvoiceSuggestions(true);
              setSelectedInvoice(null);
            }}
            onFocus={() => setShowInvoiceSuggestions(true)}
            placeholder="Type to search invoices..."
            disabled={!selectedCustomer}
          />
          {showInvoiceSuggestions && selectedCustomer && (
            <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
              <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {filteredInvoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white group"
                    onClick={() => handleInvoiceSelect(invoice)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{invoice.invoiceNumber || invoice.id}</span>
                      <span className="text-sm text-gray-500 group-hover:text-white">₹{invoice.pendingAmount.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
            Payment Date
          </label>
          <input
            type="date"
            id="paymentDate"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700">
            Payment Mode
          </label>
          <select
            id="paymentMode"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="">Select Payment Mode</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Remaining Balance
          </label>
          <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2">
            ₹{remainingBalance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!selectedCustomer || !selectedInvoice}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Record Payment
        </button>
      </div>
    </form>
  );
};

export default CustomerPaymentForm; 