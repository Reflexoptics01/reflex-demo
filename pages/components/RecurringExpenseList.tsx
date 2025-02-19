import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import RecurringExpenseForm from './RecurringExpenseForm';

interface RecurringExpense {
  id: string;
  type: string;
  amount: number;
  dueDay: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  paymentMode: string;
  notes?: string;
  isActive: boolean;
  lastGenerated?: number;
  reminderDays: number;
}

export default function RecurringExpenseList() {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true);
      const expensesRef = collection(db, 'recurring_expenses');
      const q = query(expensesRef);
      const querySnapshot = await getDocs(q);
      
      const expensesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RecurringExpense[];

      setExpenses(expensesList.sort((a, b) => a.dueDay - b.dueDay));
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = () => {
    setEditingExpense(null);
    setShowAddForm(false);
    fetchRecurringExpenses();
  };

  const getNextDueDate = (expense: RecurringExpense) => {
    const today = new Date();
    let nextDue = new Date(today.getFullYear(), today.getMonth(), expense.dueDay);
    
    if (nextDue < today) {
      nextDue = new Date(today.getFullYear(), today.getMonth() + 1, expense.dueDay);
    }

    if (expense.frequency === 'quarterly') {
      while (nextDue < today) {
        nextDue.setMonth(nextDue.getMonth() + 3);
      }
    } else if (expense.frequency === 'yearly') {
      while (nextDue < today) {
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      }
    }

    return nextDue;
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Recurring Expenses</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showAddForm ? 'Cancel' : 'Add Recurring Expense'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6">
          <RecurringExpenseForm onSubmit={handleExpenseSubmit} />
        </div>
      )}

      {editingExpense && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Edit Recurring Expense</h2>
                <button
                  onClick={() => setEditingExpense(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <RecurringExpenseForm onSubmit={handleExpenseSubmit} existingExpense={editingExpense} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Day
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequency
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Due
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => {
              const nextDueDate = getNextDueDate(expense);
              const daysUntilDue = getDaysUntilDue(nextDueDate);
              const isUpcoming = daysUntilDue <= expense.reminderDays;

              return (
                <tr key={expense.id} className={isUpcoming ? 'bg-yellow-50' : undefined}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.dueDay}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {expense.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {nextDueDate.toLocaleDateString()} ({daysUntilDue} days)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      expense.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {expense.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 