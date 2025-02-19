import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyData {
  sales: number;
  purchases: number;
  expenses: number;
  advancesReceived: number;
  advancesPaid: number;
}

interface YearlyReport {
  monthlyData: { [key: string]: MonthlyData };
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalAdvancesReceived: number;
  totalAdvancesPaid: number;
  stockValue: number;
  netProfit: number;
}

export default function YearlyFinancialReport() {
  const [yearlyReport, setYearlyReport] = useState<YearlyReport>({
    monthlyData: {},
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalAdvancesReceived: 0,
    totalAdvancesPaid: 0,
    stockValue: 0,
    netProfit: 0
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  const fetchYearlyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

      // Initialize monthly data
      const monthlyData: { [key: string]: MonthlyData } = {};
      for (let i = 0; i < 12; i++) {
        const monthKey = new Date(selectedYear, i, 1).toLocaleString('default', { month: 'short' });
        monthlyData[monthKey] = {
          sales: 0,
          purchases: 0,
          expenses: 0,
          advancesReceived: 0,
          advancesPaid: 0
        };
      }

      // Fetch sales data
      const salesRef = collection(db, 'payment');
      const salesQuery = query(
        salesRef,
        where('timestamp', '>=', startDate.getTime()),
        where('timestamp', '<=', endDate.getTime()),
        orderBy('timestamp')
      );
      const salesSnapshot = await getDocs(salesQuery);

      // Fetch purchases data
      const purchasesRef = collection(db, 'distledger');
      const purchasesQuery = query(
        purchasesRef,
        where('timestamp', '>=', startDate.getTime()),
        where('timestamp', '<=', endDate.getTime()),
        orderBy('timestamp')
      );
      const purchasesSnapshot = await getDocs(purchasesQuery);

      // Fetch expenses data
      const expensesRef = collection(db, 'expenses');
      const expensesQuery = query(
        expensesRef,
        where('timestamp', '>=', startDate.getTime()),
        where('timestamp', '<=', endDate.getTime()),
        orderBy('timestamp')
      );
      const expensesSnapshot = await getDocs(expensesQuery);

      // Fetch stock value
      const stockRef = collection(db, 'inventory');
      const stockSnapshot = await getDocs(stockRef);
      let currentStockValue = 0;
      stockSnapshot.docs.forEach(doc => {
        const item = doc.data();
        currentStockValue += (item.quantity || 0) * (item.costPrice || 0);
      });

      // Process sales data
      salesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.timestamp);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlyData[monthKey].sales += parseFloat(data.amount || 0);
        if (data.isAdvance) {
          monthlyData[monthKey].advancesReceived += parseFloat(data.amount || 0);
        }
      });

      // Process purchases data
      purchasesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.timestamp);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlyData[monthKey].purchases += parseFloat(data.amount || 0);
        if (data.isAdvance) {
          monthlyData[monthKey].advancesPaid += parseFloat(data.amount || 0);
        }
      });

      // Process expenses data
      expensesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.timestamp);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlyData[monthKey].expenses += parseFloat(data.amount || 0);
      });

      // Calculate totals
      const totals = Object.values(monthlyData).reduce(
        (acc, month) => ({
          totalSales: acc.totalSales + month.sales,
          totalPurchases: acc.totalPurchases + month.purchases,
          totalExpenses: acc.totalExpenses + month.expenses,
          totalAdvancesReceived: acc.totalAdvancesReceived + month.advancesReceived,
          totalAdvancesPaid: acc.totalAdvancesPaid + month.advancesPaid
        }),
        {
          totalSales: 0,
          totalPurchases: 0,
          totalExpenses: 0,
          totalAdvancesReceived: 0,
          totalAdvancesPaid: 0
        }
      );

      // Calculate net profit
      const netProfit = totals.totalSales - totals.totalPurchases - totals.totalExpenses +
        totals.totalAdvancesReceived - totals.totalAdvancesPaid - currentStockValue;

      setYearlyReport({
        monthlyData,
        ...totals,
        stockValue: currentStockValue,
        netProfit
      });
    } catch (error) {
      console.error('Error fetching yearly data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchYearlyData();
  }, [fetchYearlyData, selectedYear]);

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Monthly Summary Sheet
    const monthlyData = Object.entries(yearlyReport.monthlyData).map(([month, data]) => ({
      Month: month,
      Sales: data.sales,
      Purchases: data.purchases,
      Expenses: data.expenses,
      'Advances Received': data.advancesReceived,
      'Advances Paid': data.advancesPaid,
      'Net Amount': data.sales - data.purchases - data.expenses + data.advancesReceived - data.advancesPaid
    }));
    
    const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Summary');

    // Yearly Summary Sheet
    const yearlyData = [{
      'Total Sales': yearlyReport.totalSales,
      'Total Purchases': yearlyReport.totalPurchases,
      'Total Expenses': yearlyReport.totalExpenses,
      'Total Advances Received': yearlyReport.totalAdvancesReceived,
      'Total Advances Paid': yearlyReport.totalAdvancesPaid,
      'Current Stock Value': yearlyReport.stockValue,
      'Net Profit/Loss': yearlyReport.netProfit
    }];
    
    const yearlySheet = XLSX.utils.json_to_sheet(yearlyData);
    XLSX.utils.book_append_sheet(workbook, yearlySheet, 'Yearly Summary');

    // Save the file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Financial_Report_${selectedYear}.xlsx`);
  };

  const generatePDF = async () => {
    try {
      // Create a new PDFDocument
      const pdfDoc = await PDFDocument.create();

      // Add a page to the document
      const page = pdfDoc.addPage();

      // Get the page dimensions
      const { height } = page.getSize();

      // Create the content array
      const lines = [
        `Yearly Financial Report ${selectedYear}`,
        '',
        `Total Sales: ₹${yearlyReport.totalSales.toFixed(2)}`,
        `Total Purchases: ₹${yearlyReport.totalPurchases.toFixed(2)}`,
        `Total Expenses: ₹${yearlyReport.totalExpenses.toFixed(2)}`,
        `Total Advances Received: ₹${yearlyReport.totalAdvancesReceived.toFixed(2)}`,
        `Total Advances Paid: ₹${yearlyReport.totalAdvancesPaid.toFixed(2)}`,
        `Current Stock Value: ₹${yearlyReport.stockValue.toFixed(2)}`,
        `Net Profit/Loss: ₹${yearlyReport.netProfit.toFixed(2)}`
      ];

      // Draw each line of text
      let y = height - 50;
      for (let i = 0; i < lines.length; i++) {
        const text = lines[i];
        page.drawText(text, {
          x: 50,
          y: y - (i * 30),
          size: i === 0 ? 16 : 12
        });
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Create a blob and download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `Financial_Report_${selectedYear}.pdf`);

    } catch (error) {
      console.error('Error details:', error);
      alert('Error generating PDF. Please check the console for details.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(yearlyReport.monthlyData),
    datasets: [
      {
        label: 'Sales',
        data: Object.values(yearlyReport.monthlyData).map(data => data.sales),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      },
      {
        label: 'Purchases',
        data: Object.values(yearlyReport.monthlyData).map(data => data.purchases),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: Object.values(yearlyReport.monthlyData).map(data => data.expenses),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header with Year Selection and Export Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Export to Excel
          </button>
          <button
            onClick={generatePDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generate PDF Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{yearlyReport.totalSales.toFixed(2)}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Purchases</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{yearlyReport.totalPurchases.toFixed(2)}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{yearlyReport.totalExpenses.toFixed(2)}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Net Profit/Loss</dt>
            <dd className={`mt-1 text-3xl font-semibold ${yearlyReport.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(yearlyReport.netProfit).toFixed(2)}
              <span className="text-sm font-normal text-gray-500 ml-1">
                ({yearlyReport.netProfit >= 0 ? 'Profit' : 'Loss'})
              </span>
            </dd>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Breakdown</h3>
        <div className="h-96">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
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

      {/* Monthly Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Monthly Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchases</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advances Received</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Advances Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(yearlyReport.monthlyData).map(([month, data]) => (
                <tr key={month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{data.sales.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{data.purchases.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{data.expenses.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{data.advancesReceived.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{data.advancesPaid.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{(data.sales - data.purchases - data.expenses + data.advancesReceived - data.advancesPaid).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 