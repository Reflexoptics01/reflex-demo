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
  ChartData
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ExpenseIncomeReportProps {
  period: 'daily' | 'monthly' | 'yearly';
}

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  netProfitLoss: number;
  chartData: ChartData<'line'>;
}

export default function ExpenseIncomeReport({ period }: ExpenseIncomeReportProps) {
  const [reportData, setReportData] = useState<ReportData>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfitLoss: 0,
    chartData: {
      labels: [],
      datasets: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Calculate date ranges based on period
      const now = new Date();
      let periodStart = new Date();
      let periodEnd = now;
      
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

      // Fetch sales and payments (income)
      const paymentsRef = collection(db, 'payment');
      const paymentsQuery = query(
        paymentsRef,
        where('timestamp', '>=', periodStart.getTime()),
        where('timestamp', '<=', periodEnd.getTime()),
        orderBy('timestamp')
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);

      // Fetch expenses
      const expensesRef = collection(db, 'expenses');
      const expensesQuery = query(
        expensesRef,
        where('timestamp', '>=', periodStart.getTime()),
        where('timestamp', '<=', periodEnd.getTime()),
        orderBy('timestamp')
      );
      const expensesSnapshot = await getDocs(expensesQuery);

      // Process the data
      let totalIncome = 0;
      let totalExpenses = 0;
      const timeSeriesData = new Map<string, { income: number; expenses: number }>();

      // Process income
      paymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const amount = parseFloat(data.amount || 0);
        totalIncome += amount;

        const date = new Date(data.timestamp);
        const key = formatDateKey(date, period);
        const existing = timeSeriesData.get(key) || { income: 0, expenses: 0 };
        timeSeriesData.set(key, {
          ...existing,
          income: existing.income + amount
        });
      });

      // Process expenses
      expensesSnapshot.forEach((doc) => {
        const data = doc.data();
        const amount = parseFloat(data.amount || 0);
        totalExpenses += amount;

        const date = new Date(data.timestamp);
        const key = formatDateKey(date, period);
        const existing = timeSeriesData.get(key) || { income: 0, expenses: 0 };
        timeSeriesData.set(key, {
          ...existing,
          expenses: existing.expenses + amount
        });
      });

      // Prepare chart data
      const sortedKeys = Array.from(timeSeriesData.keys()).sort();
      const chartData: ChartData<'line'> = {
        labels: sortedKeys,
        datasets: [
          {
            label: 'Income',
            data: sortedKeys.map(key => timeSeriesData.get(key)?.income || 0),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: sortedKeys.map(key => timeSeriesData.get(key)?.expenses || 0),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            tension: 0.4
          }
        ]
      };

      setReportData({
        totalIncome,
        totalExpenses,
        netProfitLoss: totalIncome - totalExpenses,
        chartData
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReportData();
  }, [period, fetchReportData]);

  const formatDateKey = (date: Date, period: string): string => {
    switch (period) {
      case 'daily':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
      case 'monthly':
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      case 'yearly':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString();
    }
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
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Income vs. Expenses Report</h3>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-green-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-green-700 truncate">Total Income</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-900">
                ₹{reportData.totalIncome.toFixed(2)}
              </dd>
            </div>
          </div>
          
          <div className="bg-red-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-red-700 truncate">Total Expenses</dt>
              <dd className="mt-1 text-3xl font-semibold text-red-900">
                ₹{reportData.totalExpenses.toFixed(2)}
              </dd>
            </div>
          </div>
          
          <div className={`${
            reportData.netProfitLoss >= 0 ? 'bg-blue-50' : 'bg-yellow-50'
          } overflow-hidden shadow rounded-lg`}>
            <div className="px-4 py-5 sm:p-6">
              <dt className={`text-sm font-medium ${
                reportData.netProfitLoss >= 0 ? 'text-blue-700' : 'text-yellow-700'
              } truncate`}>
                Net {reportData.netProfitLoss >= 0 ? 'Profit' : 'Loss'}
              </dt>
              <dd className={`mt-1 text-3xl font-semibold ${
                reportData.netProfitLoss >= 0 ? 'text-blue-900' : 'text-yellow-900'
              }`}>
                ₹{Math.abs(reportData.netProfitLoss).toFixed(2)}
              </dd>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-96">
          <Line
            data={reportData.chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index' as const,
                intersect: false,
              },
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `₹${value}`
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 