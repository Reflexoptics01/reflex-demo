import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface ExpenseFormProps {
  onExpenseSubmit: () => void;
}

const EXPENSE_TYPES = [
  'Rent',
  'Tea',
  'Newspaper',
  'Salary',
  'Electricity',
  'Internet',
  'Water',
  'Pigmi Savings',
  'Miscellaneous'
] as const;

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer'] as const;

export default function ExpenseForm({ onExpenseSubmit }: ExpenseFormProps) {
  const [expenseType, setExpenseType] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [bankName, setBankName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!expenseType || !amount || !expenseDate) {
        throw new Error('Please fill in all required fields');
      }

      const expenseData = {
        type: expenseType,
        date: new Date(expenseDate),
        amount: parseFloat(amount),
        paymentMode,
        bankName: expenseType === 'Pigmi Savings' ? bankName : '',
        notes,
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'expenses'), expenseData);

      // Reset form
      setExpenseType('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setPaymentMode('Cash');
      setBankName('');
      setNotes('');
      
      onExpenseSubmit();
    } catch (error) {
      console.error('Error submitting expense:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="expenseType" className="block text-sm font-medium text-gray-700">
            Expense Type *
          </label>
          <select
            id="expenseType"
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Type</option>
            {EXPENSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700">
            Date *
          </label>
          <input
            type="date"
            id="expenseDate"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700">
            Payment Mode *
          </label>
          <select
            id="paymentMode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        {expenseType === 'Pigmi Savings' && (
          <div className="sm:col-span-2">
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
              Bank Name *
            </label>
            <input
              type="text"
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required={expenseType === 'Pigmi Savings'}
            />
          </div>
        )}

        <div className="sm:col-span-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Record Expense'}
        </button>
      </div>
    </form>
  );
} 