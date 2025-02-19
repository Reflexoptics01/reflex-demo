import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CashFlowReportProps {
  period: 'daily' | 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
}

interface CashFlowData {
  openingBalance: number;
  totalInflow: number;
  totalOutflow: number;
  closingBalance: number;
  inflowBreakdown: {
    sales: number;
    paymentsReceived: number;
  };
  outflowBreakdown: {
    purchases: number;
    paymentsMade: number;
  };
  chartData: {
    labels: string[];
    inflow: number[];
    outflow: number[];
    balance: number[];
  };
}

export default function CashFlowReport({ period, startDate, endDate }: CashFlowReportProps) {
  const [cashFlowData, setCashFlowData] = useState<CashFlowData>({
    openingBalance: 0,
    totalInflow: 0,
    totalOutflow: 0,
    closingBalance: 0,
    inflowBreakdown: {
      sales: 0,
      paymentsReceived: 0,
    },
    outflowBreakdown: {
      purchases: 0,
      paymentsMade: 0,
    },
    chartData: {
      labels: [],
      inflow: [],
      outflow: [],
      balance: [],
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCashFlowData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Calculate date ranges based on period
      const now = new Date();
      let periodStart = startDate || new Date();
      let periodEnd = endDate || now;
      
      if (!startDate && !endDate) {
        switch (period) {
          case 'daily':
            periodStart = new Date(now.setHours(0, 0, 0, 0));
            periodEnd = new Date(now.setHours(23, 59, 59, 999));
            break;
          case 'monthly':
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case 'yearly':
            periodStart = new Date(now.getFullYear(), 0, 1);
            periodEnd = new Date(now.getFullYear(), 11, 31);
            break;
        }
      }

      // Fetch customer payments (inflow)
      const customerPaymentsRef = collection(db, 'payment');
      const customerPaymentsQuery = query(
        customerPaymentsRef,
        where('timestamp', '>=', periodStart.getTime()),
        where('timestamp', '<=', periodEnd.getTime()),
        orderBy('timestamp')
      );
      const customerPaymentsSnapshot = await getDocs(customerPaymentsQuery);

      // Fetch vendor payments (outflow)
      const vendorPaymentsRef = collection(db, 'distledger');
      const vendorPaymentsQuery = query(
        vendorPaymentsRef,
        where('timestamp', '>=', periodStart.getTime()),
        where('timestamp', '<=', periodEnd.getTime()),
        orderBy('timestamp')
      );
      const vendorPaymentsSnapshot = await getDocs(vendorPaymentsQuery);

      // Process the data
      let totalInflow = 0;
      let totalOutflow = 0;
      const timeSeriesData: Map<string, { inflow: number; outflow: number }> = new Map();

      // Process customer payments
      customerPaymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const amount = parseFloat(data.amount || 0);
        totalInflow += amount;

        const date = new Date(data.timestamp);
        const key = formatDateKey(date, period);
        const existing = timeSeriesData.get(key) || { inflow: 0, outflow: 0 };
        timeSeriesData.set(key, {
          ...existing,
          inflow: existing.inflow + amount,
        });
      });

      // Process vendor payments
      vendorPaymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const amount = parseFloat(data.amount || 0);
        totalOutflow += amount;

        const date = new Date(data.timestamp);
        const key = formatDateKey(date, period);
        const existing = timeSeriesData.get(key) || { inflow: 0, outflow: 0 };
        timeSeriesData.set(key, {
          ...existing,
          outflow: existing.outflow + amount,
        });
      });

      // Calculate opening balance (simplified - you might want to fetch this from a dedicated collection)
      const openingBalance = 0; // This should be fetched from your database

      // Prepare chart data
      const sortedKeys = Array.from(timeSeriesData.keys()).sort();
      const chartData = {
        labels: sortedKeys,
        inflow: sortedKeys.map(key => timeSeriesData.get(key)?.inflow || 0),
        outflow: sortedKeys.map(key => timeSeriesData.get(key)?.outflow || 0),
        balance: [],
      };

      // Calculate running balance for chart
      let runningBalance = openingBalance;
      chartData.balance = sortedKeys.map(key => {
        const data = timeSeriesData.get(key);
        runningBalance += (data?.inflow || 0) - (data?.outflow || 0);
        return runningBalance;
      });

      setCashFlowData({
        openingBalance,
        totalInflow,
        totalOutflow,
        closingBalance: openingBalance + totalInflow - totalOutflow,
        inflowBreakdown: {
          sales: totalInflow * 0.8, // Example breakdown - adjust based on your needs
          paymentsReceived: totalInflow * 0.2,
        },
        outflowBreakdown: {
          purchases: totalOutflow * 0.7,
          paymentsMade: totalOutflow * 0.3,
        },
        chartData,
      });
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    fetchCashFlowData();
  }, [period, startDate, endDate, fetchCashFlowData]);

  const formatDateKey = (date: Date, period: string): string => {
    switch (period) {
      case 'daily':
        return date.toLocaleDateString();
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Cash Flow Trends',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
    },
  };

  const chartDataConfig = {
    labels: cashFlowData.chartData.labels,
    datasets: [
      {
        label: 'Cash Inflow',
        data: cashFlowData.chartData.inflow,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Cash Outflow',
        data: cashFlowData.chartData.outflow,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Balance',
        data: cashFlowData.chartData.balance,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Cash Flow Report</h3>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Opening Balance</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ₹{cashFlowData.openingBalance.toFixed(2)}
              </dd>
            </div>
          </div>
          
          <div className="bg-green-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-green-700 truncate">Total Inflow</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-900">
                ₹{cashFlowData.totalInflow.toFixed(2)}
              </dd>
            </div>
          </div>
          
          <div className="bg-red-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-red-700 truncate">Total Outflow</dt>
              <dd className="mt-1 text-3xl font-semibold text-red-900">
                ₹{cashFlowData.totalOutflow.toFixed(2)}
              </dd>
            </div>
          </div>
          
          <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-blue-700 truncate">Closing Balance</dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-900">
                ₹{cashFlowData.closingBalance.toFixed(2)}
              </dd>
            </div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
          <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Inflow Breakdown</h4>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Sales</dt>
                  <dd className="text-sm font-medium text-gray-900">₹{cashFlowData.inflowBreakdown.sales.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Payments Received</dt>
                  <dd className="text-sm font-medium text-gray-900">₹{cashFlowData.inflowBreakdown.paymentsReceived.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Outflow Breakdown</h4>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Purchases</dt>
                  <dd className="text-sm font-medium text-gray-900">₹{cashFlowData.outflowBreakdown.purchases.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Payments Made</dt>
                  <dd className="text-sm font-medium text-gray-900">₹{cashFlowData.outflowBreakdown.paymentsMade.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <Line options={chartOptions} data={chartDataConfig} />
          </div>
        </div>
      </div>
    </div>
  );
} 