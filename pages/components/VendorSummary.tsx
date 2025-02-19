import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { data } from '../home';

interface VendorSummaryProps {
  vendorId: string;
}

export default function VendorSummary({ vendorId }: VendorSummaryProps) {
  const [summary, setSummary] = useState({
    totalPurchases: 0,
    totalPayments: 0,
    pendingBalance: 0
  });

  useEffect(() => {
    const fetchVendorSummary = async () => {
      if (!vendorId) return;

      try {
        // Fetch all transactions for this vendor
        const ledgerRef = collection(data, 'distledger');
        const q = query(ledgerRef, where('vendorId', '==', vendorId));
        const querySnapshot = await getDocs(q);

        let totalPurchases = 0;
        let totalPayments = 0;

        querySnapshot.forEach((doc) => {
          const transaction = doc.data();
          if (transaction.type === 'purchase') {
            totalPurchases += transaction.amount;
          } else if (transaction.type === 'payment') {
            totalPayments += transaction.amount;
          }
        });

        setSummary({
          totalPurchases,
          totalPayments,
          pendingBalance: totalPurchases - totalPayments
        });
      } catch (error) {
        console.error('Error fetching vendor summary:', error);
      }
    };

    fetchVendorSummary();
  }, [vendorId]);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Vendor Summary</h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Purchases</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{summary.totalPurchases.toFixed(2)}</dd>
          </div>

          <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Payments Made</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{summary.totalPayments.toFixed(2)}</dd>
          </div>

          <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Balance</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{summary.pendingBalance.toFixed(2)}</dd>
          </div>
        </div>
      </div>
    </div>
  );
} 