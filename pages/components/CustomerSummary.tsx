import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface CustomerSummaryProps {
  customerId: string;
}

const CustomerSummary: React.FC<CustomerSummaryProps> = ({ customerId }) => {
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPayments: 0,
    pendingBalance: 0,
  });

  const fetchCustomerSummary = useCallback(async () => {
    try {
      const paymentsRef = collection(db, 'payment');
      const q = query(paymentsRef, where('customerId', '==', customerId));
      const snapshot = await getDocs(q);

      let totalSales = 0;
      let totalPayments = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'sale') {
          totalSales += parseFloat(data.price?.toString() || '0');
        } else if (data.type === 'payment') {
          totalPayments += parseFloat(data.amount?.toString() || '0');
        }
      });

      setSummary({
        totalSales,
        totalPayments,
        pendingBalance: totalSales - totalPayments,
      });
    } catch (error) {
      console.error('Error fetching customer summary:', error);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchCustomerSummary();
    }
  }, [customerId, fetchCustomerSummary]);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Summary</h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{summary.totalSales.toFixed(2)}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Payments Received</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{summary.totalPayments.toFixed(2)}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Balance</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{summary.pendingBalance.toFixed(2)}</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSummary; 