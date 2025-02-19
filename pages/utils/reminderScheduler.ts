import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface ReminderSettings {
  enabled: boolean;
  daysBefore: number;
  method: 'whatsapp' | 'sms' | 'both';
}

interface PaymentRecord {
  id: string;
  type: 'customer' | 'vendor';
  entityId: string;
  entityName: string;
  amount: number;
  dueDate: number;
  autoReminder: ReminderSettings;
  lastReminderSent?: number;
}

export async function checkAndSendReminders() {
  try {
    // Check customer payments
    await processReminders('orders', 'customer');
    // Check vendor payments
    await processReminders('distledger', 'vendor');
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
}

async function processReminders(collectionName: string, type: 'customer' | 'vendor') {
  const now = Date.now();
  const paymentsRef = collection(db, collectionName);
  
  // Query for payments with enabled auto-reminders and pending balance
  const q = query(
    paymentsRef,
    where('balance', '>', 0),
    where('autoReminder.enabled', '==', true)
  );
  
  const snapshot = await getDocs(q);
  
  for (const doc of snapshot.docs) {
    const payment = doc.data() as PaymentRecord;
    const reminderDue = payment.dueDate - (payment.autoReminder.daysBefore * 24 * 60 * 60 * 1000);
    
    // Check if it's time to send a reminder
    if (now >= reminderDue && (!payment.lastReminderSent || now - payment.lastReminderSent > 24 * 60 * 60 * 1000)) {
      await sendReminder(payment, type);
    }
  }
}

async function sendReminder(payment: PaymentRecord, type: 'customer' | 'vendor') {
  try {
    // Get contact information
    const entityCollectionName = type === 'customer' ? 'retailers' : 'distributors';
    const entityDoc = await getDoc(doc(db, entityCollectionName, payment.entityId));
    const entityData = entityDoc.data();
    const phoneNumber = entityData?.phoneNo || entityData?.phone;

    if (!phoneNumber) {
      console.error(`No phone number found for ${type} ${payment.entityName}`);
      return;
    }

    const message = `Dear ${payment.entityName},\n\nThis is a reminder for the pending payment of ₹${payment.amount.toFixed(2)} due on ${new Date(payment.dueDate).toLocaleDateString()}.\n\nPlease arrange for the payment at your earliest convenience.\n\nRegards,\nYour Business Name`;

    // Send reminders based on method preference
    if (payment.autoReminder.method === 'whatsapp' || payment.autoReminder.method === 'both') {
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      // In a real implementation, you would use a WhatsApp Business API
      console.log('WhatsApp reminder URL:', whatsappUrl);
    }

    if (payment.autoReminder.method === 'sms' || payment.autoReminder.method === 'both') {
      // Implement SMS sending logic here
      // You'll need to integrate with an SMS service provider
      console.log('SMS reminder to be sent to:', phoneNumber);
    }

    // Update last reminder sent timestamp
    const paymentRef = doc(db, type === 'customer' ? 'orders' : 'distledger', payment.id);
    await updateDoc(paymentRef, {
      lastReminderSent: Date.now()
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
}

// Function to initialize the reminder scheduler
export function initializeReminderScheduler() {
  // Check for reminders every hour
  setInterval(checkAndSendReminders, 60 * 60 * 1000);
  
  // Also check immediately on startup
  checkAndSendReminders();
} 