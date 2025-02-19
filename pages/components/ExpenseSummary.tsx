import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ChartBarIcon, FolderOpenIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ExpenseSummaryProps {
  period: 'daily' | 'monthly' | 'yearly';
}

interface SummaryData {
  totalExpenses: number;
  expensesByType: { [key: string]: number };
  pigmiSavingsByBank: { [key: string]: number };
}

export default function ExpenseSummary({ period }: ExpenseSummaryProps) {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalExpenses: 0,
    expensesByType: {},
    pigmiSavingsByBank: {}
  });

  useEffect(() => {
    const fetchExpenseSummary = async () => {
      try {
        const expensesRef = collection(db, 'expenses');
        let startDate = new Date();

        // Set the date range based on the period
        switch (period) {
          case 'daily':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'monthly':
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            break;
          case 'yearly':
            startDate = new Date(startDate.getFullYear(), 0, 1);
            break;
        }

        const q = query(expensesRef, where('date', '>=', startDate));
        const querySnapshot = await getDocs(q);

        let total = 0;
        const byType: { [key: string]: number } = {};
        const byBank: { [key: string]: number } = {};

        querySnapshot.forEach((doc) => {
          const expense = doc.data();
          const amount = parseFloat(expense.amount) || 0;

          total += amount;
          byType[expense.type] = (byType[expense.type] || 0) + amount;

          if (expense.type === 'Pigmi Savings' && expense.bankName) {
            byBank[expense.bankName] = (byBank[expense.bankName] || 0) + amount;
          }
        });

        setSummaryData({
          totalExpenses: total,
          expensesByType: byType,
          pigmiSavingsByBank: byBank
        });
      } catch (error) {
        console.error('Error fetching expense summary:', error);
      }
    };

    fetchExpenseSummary();
  }, [period]);

  const chartData = {
    labels: Object.keys(summaryData.expensesByType),
    datasets: [
      {
        label: 'Expenses by Type',
        data: Object.values(summaryData.expensesByType),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(199, 199, 199, 0.5)',
          'rgba(83, 102, 255, 0.5)',
          'rgba(40, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Expenses by Category',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Expenses ({period})
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    ₹{summaryData.totalExpenses.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(summaryData.pigmiSavingsByBank).length > 0 && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FolderOpenIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Pigmi Savings
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      ₹{Object.values(summaryData.pigmiSavingsByBank).reduce((a, b) => a + b, 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">By Bank</h4>
                <div className="space-y-2">
                  {Object.entries(summaryData.pigmiSavingsByBank).map(([bank, amount]) => (
                    <div key={bank} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{bank}</span>
                      <span className="text-sm font-medium text-gray-900">₹{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg p-6">
        <div className="h-64">
          <Bar options={chartOptions} data={chartData} />
        </div>
      </div>
    </div>
  );
} 