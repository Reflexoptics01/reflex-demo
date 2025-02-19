import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface RecurringExpenseFormProps {
  onSubmit: () => void;
  existingExpense?: RecurringExpense;
}

interface RecurringExpense {
  id?: string;
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

const EXPENSE_TYPES = [
  'Rent',
  'Salary',
  'Internet',
  'Electricity',
  'Water',
  'Insurance',
  'Maintenance'
] as const;

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer'] as const;

export default function RecurringExpenseForm({ onSubmit, existingExpense }: RecurringExpenseFormProps) {
  const [expenseType, setExpenseType] = useState(existingExpense?.type || '');
  const [amount, setAmount] = useState(existingExpense?.amount.toString() || '');
  const [dueDay, setDueDay] = useState(existingExpense?.dueDay.toString() || '1');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>(existingExpense?.frequency || 'monthly');
  const [paymentMode, setPaymentMode] = useState(existingExpense?.paymentMode || 'Cash');
  const [notes, setNotes] = useState(existingExpense?.notes || '');
  const [isActive, setIsActive] = useState(existingExpense?.isActive ?? true);
  const [reminderDays, setReminderDays] = useState(existingExpense?.reminderDays.toString() || '3');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!expenseType || !amount || !dueDay) {
        throw new Error('Please fill in all required fields');
      }

      const dueDayNum = parseInt(dueDay);
      if (dueDayNum < 1 || dueDayNum > 31) {
        throw new Error('Due day must be between 1 and 31');
      }

      const expenseData: Omit<RecurringExpense, 'id'> = {
        type: expenseType,
        amount: parseFloat(amount),
        dueDay: dueDayNum,
        frequency,
        paymentMode,
        notes,
        isActive,
        reminderDays: parseInt(reminderDays),
        lastGenerated: existingExpense?.lastGenerated || null
      };

      if (existingExpense?.id) {
        // Update existing recurring expense
        await updateDoc(doc(db, 'recurring_expenses', existingExpense.id), expenseData);
      } else {
        // Create new recurring expense
        await addDoc(collection(db, 'recurring_expenses'), expenseData);
      }

      onSubmit();
    } catch (error) {
      console.error('Error submitting recurring expense:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit recurring expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingExpense?.id) return;
    
    try {
      await deleteDoc(doc(db, 'recurring_expenses', existingExpense.id));
      onSubmit();
    } catch (error) {
      console.error('Error deleting recurring expense:', error);
      setError('Failed to delete recurring expense');
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
          <label htmlFor="dueDay" className="block text-sm font-medium text-gray-700">
            Due Day of Month *
          </label>
          <input
            type="number"
            id="dueDay"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            min="1"
            max="31"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
            Frequency *
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
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

        <div className="sm:col-span-2">
          <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-700">
            Reminder Days Before *
          </label>
          <input
            type="number"
            id="reminderDays"
            value={reminderDays}
            onChange={(e) => setReminderDays(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            min="1"
            max="30"
          />
        </div>

        <div className="sm:col-span-4">
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

        <div className="sm:col-span-6">
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>
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

      <div className="flex justify-end space-x-3">
        {existingExpense?.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : existingExpense?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
} 