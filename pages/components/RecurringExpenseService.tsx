import { useEffect } from 'react';
import { collection, query, getDocs, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

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

export default function RecurringExpenseService() {
  useEffect(() => {
    const checkAndGenerateExpenses = async () => {
      try {
        const expensesRef = collection(db, 'recurring_expenses');
        const q = query(expensesRef, where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        
        const today = new Date();
        const expenses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RecurringExpense[];

        for (const expense of expenses) {
          const shouldGenerate = await checkIfShouldGenerate(expense, today);
          if (shouldGenerate) {
            await generateExpense(expense, today);
          }

          const shouldRemind = checkIfShouldRemind(expense, today);
          if (shouldRemind) {
            await generateReminder(expense, today);
          }
        }
      } catch (error) {
        console.error('Error in recurring expense service:', error);
      }
    };

    // Run immediately and then every hour
    checkAndGenerateExpenses();
    const interval = setInterval(checkAndGenerateExpenses, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const checkIfShouldGenerate = async (expense: RecurringExpense, today: Date) => {
    if (!expense.lastGenerated) return true;

    const lastGenerated = new Date(expense.lastGenerated);
    const monthsSinceLastGenerated = (today.getFullYear() - lastGenerated.getFullYear()) * 12 + 
      (today.getMonth() - lastGenerated.getMonth());

    switch (expense.frequency) {
      case 'monthly':
        return monthsSinceLastGenerated >= 1;
      case 'quarterly':
        return monthsSinceLastGenerated >= 3;
      case 'yearly':
        return monthsSinceLastGenerated >= 12;
      default:
        return false;
    }
  };

  const generateExpense = async (recurringExpense: RecurringExpense, today: Date) => {
    try {
      // Create the expense record
      const expenseData = {
        type: recurringExpense.type,
        date: today,
        amount: recurringExpense.amount,
        paymentMode: recurringExpense.paymentMode,
        notes: `Auto-generated from recurring expense: ${recurringExpense.notes || ''}`,
        timestamp: Date.now(),
        isRecurring: true,
        recurringExpenseId: recurringExpense.id
      };

      await addDoc(collection(db, 'expenses'), expenseData);

      // Update the lastGenerated timestamp
      await updateDoc(doc(db, 'recurring_expenses', recurringExpense.id), {
        lastGenerated: Date.now()
      });
    } catch (error) {
      console.error('Error generating expense:', error);
    }
  };

  const checkIfShouldRemind = (expense: RecurringExpense, today: Date) => {
    const dueDate = new Date(today.getFullYear(), today.getMonth(), expense.dueDay);
    
    // If due date has passed, use next month's due date
    if (dueDate < today) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    // Calculate days until due
    const diffTime = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return daysUntilDue <= expense.reminderDays;
  };

  const generateReminder = async (expense: RecurringExpense, today: Date) => {
    try {
      const dueDate = new Date(today.getFullYear(), today.getMonth(), expense.dueDay);
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      const reminderData = {
        type: 'expense',
        expenseId: expense.id,
        expenseType: expense.type,
        amount: expense.amount,
        dueDate: dueDate.getTime(),
        status: 'pending',
        timestamp: Date.now()
      };

      // Check if a reminder already exists for this expense and due date
      const remindersRef = collection(db, 'reminders');
      const q = query(
        remindersRef,
        where('expenseId', '==', expense.id),
        where('dueDate', '==', dueDate.getTime())
      );
      const existingReminders = await getDocs(q);

      if (existingReminders.empty) {
        await addDoc(collection(db, 'reminders'), reminderData);
      }
    } catch (error) {
      console.error('Error generating reminder:', error);
    }
  };

  // This is a service component that runs in the background, so it doesn't render anything
  return null;
} 