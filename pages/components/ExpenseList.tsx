import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface ExpenseListProps {
  searchQuery: string;
  selectedType: string;
  selectedBank: string;
  startDate: string;
  endDate: string;
}

interface Expense {
  id: string;
  type: string;
  date: Date;
  amount: number;
  paymentMode: string;
  bankName?: string;
  notes?: string;
}

export default function ExpenseList({
  searchQuery,
  selectedType,
  selectedBank,
  startDate,
  endDate
}: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Expense;
    direction: 'ascending' | 'descending';
  }>({ key: 'date', direction: 'descending' });

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const expensesRef = collection(db, 'expenses');
        let q = query(expensesRef, orderBy('date', 'desc'));

        // Apply date filters if provided
        if (startDate) {
          q = query(q, where('date', '>=', new Date(startDate)));
        }
        if (endDate) {
          q = query(q, where('date', '<=', new Date(endDate)));
        }

        const querySnapshot = await getDocs(q);
        const expensesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        })) as Expense[];

        // Apply client-side filters
        let filteredExpenses = expensesList;
        
        if (searchQuery) {
          const search = searchQuery.toLowerCase();
          filteredExpenses = filteredExpenses.filter(expense =>
            expense.type.toLowerCase().includes(search) ||
            expense.bankName?.toLowerCase().includes(search) ||
            expense.notes?.toLowerCase().includes(search)
          );
        }

        if (selectedType) {
          filteredExpenses = filteredExpenses.filter(expense =>
            expense.type === selectedType
          );
        }

        if (selectedBank) {
          filteredExpenses = filteredExpenses.filter(expense =>
            expense.bankName === selectedBank
          );
        }

        setExpenses(filteredExpenses);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, [searchQuery, selectedType, selectedBank, startDate, endDate]);

  const requestSort = (key: keyof Expense) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedExpenses = [...expenses].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setExpenses(sortedExpenses);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Expense Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('date')}
              >
                Date
                {sortConfig.key === 'date' && (
                  <span className="ml-2">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('type')}
              >
                Type
                {sortConfig.key === 'type' && (
                  <span className="ml-2">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => requestSort('amount')}
              >
                Amount
                {sortConfig.key === 'amount' && (
                  <span className="ml-2">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Payment Mode
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Bank
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No expenses found
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.paymentMode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.bankName || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {expense.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 