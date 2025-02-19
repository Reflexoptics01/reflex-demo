import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface TaxSummary {
  gstCollected: number;
  gstPaid: number;
  netGstLiability: number;
  taxableAmount: number;
  totalTransactions: number;
}

interface TaxDetails {
  date: Date;
  invoiceNumber: string;
  type: 'sales' | 'purchase';
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

const TaxCalculation: React.FC = () => {
  const [taxPeriod, setTaxPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [startDate, setStartDate] = useState(new Date());
  const [taxSummary, setTaxSummary] = useState<TaxSummary>({
    gstCollected: 0,
    gstPaid: 0,
    netGstLiability: 0,
    taxableAmount: 0,
    totalTransactions: 0
  });
  const [taxDetails, setTaxDetails] = useState<TaxDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTaxData();
  }, [taxPeriod, startDate]);

  const fetchTaxData = async () => {
    setIsLoading(true);
    try {
      // Calculate date range based on period
      const endDate = new Date(startDate);
      if (taxPeriod === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 3);
      }

      // Fetch sales data
      const salesQuery = query(
        collection(db, 'orders'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate)
      );
      const salesSnapshot = await getDocs(salesQuery);

      // Fetch purchase data
      const purchaseQuery = query(
        collection(db, 'purchases'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate)
      );
      const purchaseSnapshot = await getDocs(purchaseQuery);

      let summary: TaxSummary = {
        gstCollected: 0,
        gstPaid: 0,
        netGstLiability: 0,
        taxableAmount: 0,
        totalTransactions: 0
      };

      let details: TaxDetails[] = [];

      // Process sales data
      salesSnapshot.forEach(doc => {
        const data = doc.data();
        const taxableAmount = parseFloat(data.amount || '0');
        const gstRate = parseFloat(data.gstRate || '18'); // Default 18% if not specified
        const gstAmount = (taxableAmount * gstRate) / 100;

        summary.gstCollected += gstAmount;
        summary.taxableAmount += taxableAmount;
        summary.totalTransactions++;

        details.push({
          date: data.timestamp.toDate(),
          invoiceNumber: data.invoiceNumber || doc.id,
          type: 'sales',
          taxableAmount,
          gstRate,
          gstAmount,
          total: taxableAmount + gstAmount
        });
      });

      // Process purchase data
      purchaseSnapshot.forEach(doc => {
        const data = doc.data();
        const taxableAmount = parseFloat(data.amount || '0');
        const gstRate = parseFloat(data.gstRate || '18'); // Default 18% if not specified
        const gstAmount = (taxableAmount * gstRate) / 100;

        summary.gstPaid += gstAmount;
        summary.taxableAmount += taxableAmount;
        summary.totalTransactions++;

        details.push({
          date: data.timestamp.toDate(),
          invoiceNumber: data.invoiceNumber || doc.id,
          type: 'purchase',
          taxableAmount,
          gstRate,
          gstAmount,
          total: taxableAmount + gstAmount
        });
      });

      summary.netGstLiability = summary.gstCollected - summary.gstPaid;
      setTaxSummary(summary);
      setTaxDetails(details.sort((a, b) => b.date.getTime() - a.date.getTime()));
    } catch (error) {
      console.error('Error fetching tax data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportTaxData = () => {
    const csvContent = [
      ['Date', 'Invoice Number', 'Type', 'Taxable Amount', 'GST Rate', 'GST Amount', 'Total'],
      ...taxDetails.map(detail => [
        detail.date.toLocaleDateString(),
        detail.invoiceNumber,
        detail.type,
        detail.taxableAmount.toFixed(2),
        `${detail.gstRate}%`,
        detail.gstAmount.toFixed(2),
        detail.total.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_report_${startDate.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax Period</label>
            <select
              value={taxPeriod}
              onChange={(e) => setTaxPeriod(e.target.value as 'monthly' | 'quarterly')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportTaxData}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Export Tax Data
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">GST Collected</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">₹{taxSummary.gstCollected.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">GST Paid</h3>
          <p className="mt-2 text-3xl font-semibold text-red-600">₹{taxSummary.gstPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Net GST Liability</h3>
          <p className={`mt-2 text-3xl font-semibold ${taxSummary.netGstLiability >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
            ₹{taxSummary.netGstLiability.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tax Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Rate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxDetails.map((detail, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {detail.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{detail.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{detail.taxableAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detail.gstRate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{detail.gstAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{detail.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculation; 