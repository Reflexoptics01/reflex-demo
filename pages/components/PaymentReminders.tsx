import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PaymentReminder {
  id: string;
  type: 'customer' | 'vendor';
  entityId: string;
  entityName: string;
  amount: number;
  dueDate: number;
  lastReminderSent?: number;
  autoReminder?: {
    enabled: boolean;
    daysBefore: number;
    method: 'whatsapp' | 'sms' | 'both';
  };
}

interface PaymentRemindersProps {
  type: 'customer' | 'vendor';
}

export default function PaymentReminders({ type }: PaymentRemindersProps) {
  const [pendingPayments, setPendingPayments] = useState<PaymentReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReminderSettings, setShowReminderSettings] = useState<string | null>(null);

  const fetchPendingPayments = useCallback(async () => {
    try {
      setLoading(true);
      const collectionName = type === 'customer' ? 'orders' : 'distledger';
      const paymentsRef = collection(db, collectionName);
      
      // Query for pending payments
      const q = query(
        paymentsRef,
        where('balance', '>', 0),
        orderBy('dueDate', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type,
          entityId: type === 'customer' ? data.customerId : data.vendorId,
          entityName: type === 'customer' ? data.customerName : data.vendorName,
          amount: data.balance || 0,
          dueDate: data.dueDate || Date.now(),
          lastReminderSent: data.lastReminderSent,
          autoReminder: data.autoReminder || {
            enabled: false,
            daysBefore: 3,
            method: 'whatsapp'
          }
        };
      });

      setPendingPayments(payments);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  const sendReminder = async (payment: PaymentReminder, method: 'whatsapp' | 'sms') => {
    try {
      // Get contact information
      const entityCollectionName = type === 'customer' ? 'retailers' : 'distributors';
      const entityDoc = await getDoc(doc(db, entityCollectionName, payment.entityId));
      const entityData = entityDoc.data();
      const phoneNumber = entityData?.phoneNo || entityData?.phone;

      if (!phoneNumber) {
        throw new Error('No phone number found');
      }

      // Prepare message
      const message = `Dear ${payment.entityName},\n\nThis is a reminder for the pending payment of ₹${payment.amount.toFixed(2)} due on ${new Date(payment.dueDate).toLocaleDateString()}.\n\nPlease arrange for the payment at your earliest convenience.\n\nRegards,\nYour Business Name`;

      // Send reminder based on method
      if (method === 'whatsapp') {
        // Format WhatsApp URL
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      } else {
        // Implement SMS sending logic here
        // You'll need to integrate with an SMS service provider
        console.log('SMS reminder to be implemented');
      }

      // Update last reminder sent timestamp
      const paymentRef = doc(db, type === 'customer' ? 'orders' : 'distledger', payment.id);
      await updateDoc(paymentRef, {
        lastReminderSent: Date.now()
      });

      // Refresh the payments list
      fetchPendingPayments();
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  const updateAutoReminder = async (paymentId: string, settings: PaymentReminder['autoReminder']) => {
    try {
      const paymentRef = doc(db, type === 'customer' ? 'orders' : 'distledger', paymentId);
      await updateDoc(paymentRef, {
        autoReminder: settings
      });
      
      setShowReminderSettings(null);
      fetchPendingPayments();
    } catch (error) {
      console.error('Error updating auto-reminder settings:', error);
      alert('Failed to update reminder settings. Please try again.');
    }
  };

  const isOverdue = (dueDate: number) => {
    return Date.now() > dueDate;
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
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Pending Payments {type === 'customer' ? 'from Customers' : 'to Vendors'}
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {pendingPayments.map((payment) => (
            <li key={payment.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    {isOverdue(payment.dueDate) && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${isOverdue(payment.dueDate) ? 'text-red-600' : 'text-gray-900'}`}>
                        {payment.entityName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Amount: ₹{payment.amount.toFixed(2)}
                      </p>
                      {payment.lastReminderSent && (
                        <p className="text-xs text-gray-500">
                          Last reminded: {new Date(payment.lastReminderSent).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => sendReminder(payment, 'whatsapp')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      WhatsApp Reminder
                    </button>
                    <button
                      onClick={() => sendReminder(payment, 'sms')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      SMS Reminder
                    </button>
                  </div>
                  <button
                    onClick={() => setShowReminderSettings(payment.id)}
                    className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Auto-reminder settings modal */}
              {showReminderSettings === payment.id && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-Reminder Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={payment.autoReminder?.enabled}
                            onChange={(e) => updateAutoReminder(payment.id, {
                              ...payment.autoReminder,
                              enabled: e.target.checked
                            })}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900">Enable auto-reminders</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Days before due date</label>
                        <input
                          type="number"
                          value={payment.autoReminder?.daysBefore}
                          onChange={(e) => updateAutoReminder(payment.id, {
                            ...payment.autoReminder,
                            daysBefore: parseInt(e.target.value)
                          })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reminder method</label>
                        <select
                          value={payment.autoReminder?.method}
                          onChange={(e) => updateAutoReminder(payment.id, {
                            ...payment.autoReminder,
                            method: e.target.value as 'whatsapp' | 'sms' | 'both'
                          })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => setShowReminderSettings(null)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateAutoReminder(payment.id, payment.autoReminder)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 