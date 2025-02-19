import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { data } from "../home";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderOpenIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import VendorPaymentForm from "../components/VendorPaymentForm";
import VendorSummary from "../components/VendorSummary";
import CustomerPaymentForm from "../components/CustomerPaymentForm";
import CustomerSummary from "../components/CustomerSummary";
import CashFlowReport from "../components/CashFlowReport";
import PaymentReminders from "../components/PaymentReminders";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseSummary from "../components/ExpenseSummary";
import ExpenseList from "../components/ExpenseList";
import RecurringExpenseList from '../components/RecurringExpenseList';
import RecurringExpenseService from '../components/RecurringExpenseService';
import ExpenseIncomeReport from '../components/ExpenseIncomeReport';
import YearlyFinancialReport from '../components/YearlyFinancialReport';
import FinancialReport from '../components/FinancialReport';
import TaxCalculation from '../components/TaxCalculation';
import { Query, DocumentData } from "firebase/firestore";

interface Transaction {
  id: string;
  type: string;
  status: string;
  timestamp: number;
  customerName?: string;
  vendorName?: string;
  invoiceNumber?: string;
  amount?: number;
  paymentMode?: string;
  customerId?: string;
  vendorId?: string;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Ledger() {
  const [activeView, setActiveView] = useState('customer');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vendors, setVendors] = useState([]);
  const [summaryData, setSummaryData] = useState({
    dailySales: 0,
    monthlySales: 0,
    yearlySales: 0,
    dailyPurchases: 0,
    monthlyPurchases: 0,
    yearlyPurchases: 0,
    totalPaymentsReceived: 0,
    totalPaymentsMade: 0,
    outstandingPayables: 0,
    outstandingReceivables: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showCustomerPaymentForm, setShowCustomerPaymentForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [cashFlowPeriod, setCashFlowPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [expenseBank, setExpenseBank] = useState('');
  const [expenseStartDate, setExpenseStartDate] = useState('');
  const [expenseEndDate, setExpenseEndDate] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expensePeriod, setExpensePeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [showRecurringExpenses, setShowRecurringExpenses] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorsRef = collection(data, "distributors");
        const snapshot = await getDocs(vendorsRef);
        const vendorsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVendors(vendorsList);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    const fetchCustomers = async () => {
      try {
        const customersRef = collection(data, "customers");
        const snapshot = await getDocs(customersRef);
        const customersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomers(customersList);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchVendors();
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const collectionName = activeView === 'customer' ? 'payment' : 'distledger';
        const dataRef = collection(data, collectionName);
        let q: Query<DocumentData> = dataRef;

        if (selectedVendor && activeView === 'distributor') {
          q = query(dataRef, where('vendorId', '==', selectedVendor));
        }

        const querySnapshot = await getDocs(q);
        
        let totalAmount = 0;
        let receivables = 0;
        let payables = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const amount = parseFloat(data.price || data.amount || 0);
          totalAmount += amount;
          if (data.sign === "-") {
            activeView === 'customer' ? receivables += amount : payables += amount;
          }
        });

        setSummaryData(prev => ({
          ...prev,
          dailySales: activeView === 'customer' ? totalAmount / 30 : prev.dailySales,
          monthlySales: activeView === 'customer' ? totalAmount : prev.monthlySales,
          yearlySales: activeView === 'customer' ? totalAmount * 12 : prev.yearlySales,
          dailyPurchases: activeView === 'distributor' ? totalAmount / 30 : prev.dailyPurchases,
          monthlyPurchases: activeView === 'distributor' ? totalAmount : prev.monthlyPurchases,
          yearlyPurchases: activeView === 'distributor' ? totalAmount * 12 : prev.yearlyPurchases,
          outstandingPayables: payables,
          outstandingReceivables: receivables,
        }));

        // Format transactions for display
        const formattedTransactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: activeView === 'customer' ? 'Sale' : 'Purchase',
          status: doc.data().sign === '+' ? 'Paid' : 'Pending'
        }));

        setTransactions(formattedTransactions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchSummaryData();
  }, [activeView, selectedVendor]);

  const handlePaymentSubmit = () => {
    setShowPaymentForm(false);
    // Refresh the data
    const fetchSummaryData = async () => {
      // ... (keep existing fetchSummaryData implementation)
    };
    fetchSummaryData();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Tabs */}
      <div className="bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            <button
              onClick={() => setActiveView('customer')}
              className={classNames(
                'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none',
                activeView === 'customer'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Customer Ledger
            </button>
            <button
              onClick={() => setActiveView('distributor')}
              className={classNames(
                'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none',
                activeView === 'distributor'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Vendors Ledger
            </button>
            <button
              onClick={() => setActiveView('cashflow')}
              className={classNames(
                'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none',
                activeView === 'cashflow'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Cash Flow
            </button>
            <button
              onClick={() => setActiveView('expenses')}
              className={classNames(
                'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none',
                activeView === 'expenses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveView('profitloss')}
              className={classNames(
                'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none',
                activeView === 'profitloss'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Profit & Loss
            </button>
            <button
              onClick={() => setActiveView('tax')}
              className={classNames(
                'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none',
                activeView === 'tax'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Tax/GST
            </button>
            <button
              onClick={() => setActiveView('yearlyreport')}
              className={classNames(
                'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none',
                activeView === 'yearlyreport'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Financial Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Financial Summary Cards - Only show for customer and distributor views */}
        {(activeView === 'customer' || activeView === 'distributor') && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {activeView === 'customer' ? 'Total Sales' : 'Total Purchases'} ({selectedPeriod})
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          ₹{activeView === 'customer' 
                            ? (selectedPeriod === 'daily' ? summaryData.dailySales.toFixed(2) 
                               : selectedPeriod === 'monthly' ? summaryData.monthlySales.toFixed(2)
                               : summaryData.yearlySales.toFixed(2))
                            : (selectedPeriod === 'daily' ? summaryData.dailyPurchases.toFixed(2)
                               : selectedPeriod === 'monthly' ? summaryData.monthlyPurchases.toFixed(2)
                               : summaryData.yearlyPurchases.toFixed(2))
                          }
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FolderOpenIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {activeView === 'customer' ? 'Outstanding Receivables' : 'Outstanding Payables'}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          ₹{activeView === 'customer' 
                            ? summaryData.outstandingReceivables.toFixed(2)
                            : summaryData.outstandingPayables.toFixed(2)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeView === 'expenses' ? (
          <div className="relative">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Business Expenses</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowRecurringExpenses(!showRecurringExpenses)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {showRecurringExpenses ? 'Show Regular Expenses' : 'Show Recurring Expenses'}
                </button>
                {!showRecurringExpenses && (
                  <button
                    onClick={() => setShowExpenseForm(!showExpenseForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {showExpenseForm ? 'Hide Form' : 'Record Expense'}
                  </button>
                )}
              </div>
            </div>

            {/* Background service for recurring expenses */}
            <RecurringExpenseService />

            {showRecurringExpenses ? (
              <RecurringExpenseList />
            ) : (
              <>
                {showExpenseForm && (
                  <div className="mb-8">
                    <ExpenseForm onExpenseSubmit={() => {
                      setShowExpenseForm(false);
                    }} />
                  </div>
                )}

                <div className="mb-8">
                  <ExpenseSummary period={expensePeriod} />
                </div>

                {/* Filters */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-8">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="expenseType" className="block text-sm font-medium text-gray-700">
                        Expense Type
                      </label>
                      <select
                        id="expenseType"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={expenseType}
                        onChange={(e) => setExpenseType(e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="Rent">Rent</option>
                        <option value="Tea">Tea</option>
                        <option value="Newspaper">Newspaper</option>
                        <option value="Salary">Salary</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Internet">Internet</option>
                        <option value="Water">Water</option>
                        <option value="Pigmi Savings">Pigmi Savings</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="period" className="block text-sm font-medium text-gray-700">
                        Period
                      </label>
                      <select
                        id="period"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={expensePeriod}
                        onChange={(e) => setExpensePeriod(e.target.value as 'daily' | 'monthly' | 'yearly')}
                      >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="expenseSearch" className="block text-sm font-medium text-gray-700">
                        Search
                      </label>
                      <input
                        type="text"
                        id="expenseSearch"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Search expenses..."
                        value={expenseSearchQuery}
                        onChange={(e) => setExpenseSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={expenseStartDate}
                        onChange={(e) => setExpenseStartDate(e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={expenseEndDate}
                        onChange={(e) => setExpenseEndDate(e.target.value)}
                      />
                    </div>

                    {expenseType === 'Pigmi Savings' && (
                      <div className="sm:col-span-2">
                        <label htmlFor="bank" className="block text-sm font-medium text-gray-700">
                          Bank
                        </label>
                        <input
                          type="text"
                          id="bank"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Filter by bank..."
                          value={expenseBank}
                          onChange={(e) => setExpenseBank(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <ExpenseList
                    searchQuery={expenseSearchQuery}
                    selectedType={expenseType}
                    selectedBank={expenseBank}
                    startDate={expenseStartDate}
                    endDate={expenseEndDate}
                  />
                </div>
              </>
            )}
          </div>
        ) : activeView === 'cashflow' ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Cash Flow Report</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={cashFlowPeriod}
                  onChange={(e) => setCashFlowPeriod(e.target.value as 'daily' | 'monthly' | 'yearly')}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <CashFlowReport period={cashFlowPeriod} />
          </>
        ) : activeView === 'profitloss' ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Profit & Loss Report</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'monthly' | 'yearly')}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <ExpenseIncomeReport period={selectedPeriod} />
          </>
        ) : activeView === 'tax' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tax & GST Calculations</h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage GST calculations, tax summaries, and generate reports for compliance
              </p>
            </div>
            <TaxCalculation />
          </div>
        ) : activeView === 'yearlyreport' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
              <p className="mt-1 text-sm text-gray-500">
                Analyze financial data with custom date ranges, category filters, and period comparisons
              </p>
            </div>
            <FinancialReport />
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Customer Payments</h2>
              <button
                onClick={() => setShowCustomerPaymentForm(!showCustomerPaymentForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showCustomerPaymentForm ? 'Hide Payment Form' : 'Record Payment'}
              </button>
            </div>

            {showCustomerPaymentForm && (
              <div className="mb-8">
                <CustomerPaymentForm onPaymentSubmit={handlePaymentSubmit} />
              </div>
            )}

            {/* Add Payment Reminders section */}
            <div className="mb-8">
              <PaymentReminders type="customer" />
            </div>

            {selectedCustomer && <CustomerSummary customerId={selectedCustomer} />}
          </>
        )}

        {/* Filters */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-8">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {activeView === 'customer' && (
              <div className="sm:col-span-2">
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                  Customer
                </label>
                <select
                  id="customer"
                  name="customer"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeView === 'distributor' && (
              <div className="sm:col-span-2">
                <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
                  Vendor
                </label>
                <select
                  id="vendor"
                  name="vendor"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                >
                  <option value="">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <label htmlFor="period" className="block text-sm font-medium text-gray-700">
                Period
              </label>
              <select
                id="period"
                name="period"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'monthly' | 'yearly')}
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {activeView === 'customer' && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                    )}
                    {activeView === 'distributor' && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Mode
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions
                    .filter(transaction => {
                      if (activeView === 'customer' && selectedCustomer && transaction.customerId !== selectedCustomer) return false;
                      if (activeView === 'distributor' && selectedVendor && transaction.vendorId !== selectedVendor) return false;
                      if (status !== 'all' && transaction.status.toLowerCase() !== status.toLowerCase()) return false;
                      if (searchQuery) {
                        const searchLower = searchQuery.toLowerCase();
                        const nameMatch = (activeView === 'customer' ? transaction.customerName : transaction.vendorName)?.toLowerCase().includes(searchLower);
                        const invoiceMatch = transaction.invoiceNumber?.toLowerCase().includes(searchLower);
                        if (!nameMatch && !invoiceMatch) return false;
                      }
                      return true;
                    })
                    .map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </td>
                        {activeView === 'customer' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.customerName}
                          </td>
                        )}
                        {activeView === 'distributor' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.vendorName}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{transaction.amount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.paymentMode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={classNames(
                            'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                            transaction.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          )}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

