import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc, or } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { formatCurrency } from '../../utils/format';

interface CustomerHistoryProps {
  customerId: string;
  onClose: () => void;
}

interface Prescription {
  date: number;
  rightEye: {
    sph: string;
    cyl: string;
    axis: string;
    add: string;
  };
  leftEye: {
    sph: string;
    cyl: string;
    axis: string;
    add: string;
  };
  doctorNotes?: string;
}

interface Order {
  id: string;
  date: number;
  type: string;
  details: any;
  status: string;
  amount: number;
  paymentStatus?: string;
  dueAmount?: number;
}

interface CustomerDetails {
  name: string;
  phoneNo: string;
  email: string;
  address: string;
  city: string;
  lastVisitDate: string;
  prescriptions: Prescription[];
  orders: Order[];
  totalPurchases: number;
  totalDue: number;
}

export default function CustomerHistory({ customerId, onClose }: CustomerHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'prescriptions' | 'orders'>('overview');

  const fetchCustomerHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch customer details
      const customerDoc = await getDoc(doc(db, "retailers", customerId));
      if (!customerDoc.exists()) {
        throw new Error('Customer not found');
      }
      const customerData = customerDoc.data();

      // Initialize default customer data structure
      const customerDetails: CustomerDetails = {
        name: customerData.name || '',
        phoneNo: customerData.phoneNo || '',
        email: customerData.email || '',
        address: customerData.address || '',
        city: customerData.city || '',
        lastVisitDate: customerData.lastVisitDate || '',
        prescriptions: [],
        orders: [],
        totalPurchases: 0,
        totalDue: 0
      };

      try {
        // Fetch patient records using phone number
        if (customerData.phoneNo) {
          const patientsQuery = query(
            collection(db, "patients"),
            where("phone", "==", customerData.phoneNo)
          );
          const patientSnapshot = await getDocs(patientsQuery);
          
          // Get all patient IDs for this customer
          const patientIds = patientSnapshot.docs.map(doc => doc.id);

          // Fetch examinations for all patient records
          for (const patientId of patientIds) {
            const examinationsQuery = query(
              collection(db, "examinations"),
              where("patientId", "==", patientId),
              orderBy("timestamp", "desc")
            );
            const examinationsSnapshot = await getDocs(examinationsQuery);
            
            const patientPrescriptions = examinationsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                date: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
                rightEye: {
                  sph: data.rightEye?.sph || '',
                  cyl: data.rightEye?.cyl || '',
                  axis: data.rightEye?.axis || '',
                  add: data.rightEye?.add || ''
                },
                leftEye: {
                  sph: data.leftEye?.sph || '',
                  cyl: data.leftEye?.cyl || '',
                  axis: data.leftEye?.axis || '',
                  add: data.leftEye?.add || ''
                },
                doctorNotes: data.notes || ''
              };
            });
            customerDetails.prescriptions.push(...patientPrescriptions);
          }

          // Sort prescriptions by date
          customerDetails.prescriptions.sort((a, b) => b.date - a.date);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        // Don't throw error here, just continue with empty prescriptions
      }

      try {
        // Fetch orders
        const ordersQuery = query(
          collection(db, "orders"),
          or(
            where("customerId", "==", customerId),
            where("patientId", "==", customerData.patientId || '')
          ),
          orderBy("timestamp", "desc")
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        
        // Process orders and calculate totals
        ordersSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const orderAmount = parseFloat(data.amount) || 0;
          const paidAmount = parseFloat(data.paidAmount) || 0;
          const dueAmount = orderAmount - paidAmount;
          
          customerDetails.totalPurchases += orderAmount;
          customerDetails.totalDue += dueAmount;
          
          customerDetails.orders.push({
            id: doc.id,
            status: data.status || 'completed',
            type: data.type?.toLowerCase() || 'frame',
            date: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
            amount: orderAmount,
            paymentStatus: dueAmount > 0 ? 'pending' : 'paid',
            dueAmount: dueAmount,
            details: data.details || {}
          });
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Don't throw error here, just continue with empty orders
      }

      setCustomerDetails(customerDetails);
    } catch (error) {
      console.error('Error fetching customer history:', error);
      setError(error instanceof Error ? error.message : 'Error loading customer details');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerHistory();
  }, [fetchCustomerHistory]);

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-sm w-full">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-center text-gray-900 font-medium mb-4">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!customerDetails) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <p className="text-red-600">No customer data available</p>
          <button
            onClick={onClose}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 overflow-y-auto z-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`ml-8 py-4 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'prescriptions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Prescriptions
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`ml-8 py-4 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'orders'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
            </nav>
          </div>

          <div className="px-6 py-4">
            {activeTab === 'overview' && (
              <div>
                {/* Customer Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{customerDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{customerDetails.phoneNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{customerDetails.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{customerDetails.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Summary Statistics */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600">Total Purchases</p>
                      <p className="text-2xl font-semibold text-green-700">
                        {formatCurrency(customerDetails.totalPurchases)}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-yellow-600">Outstanding Balance</p>
                      <p className="text-2xl font-semibold text-yellow-700">
                        {formatCurrency(customerDetails.totalDue)}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600">Last Visit</p>
                      <p className="text-2xl font-semibold text-blue-700">
                        {customerDetails.lastVisitDate ? formatDate(parseInt(customerDetails.lastVisitDate)) : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {customerDetails.orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              Order #{order.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(order.amount)}
                            </p>
                            <p className={`text-sm ${
                              order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {order.paymentStatus === 'paid' ? 'Paid' : `Due: ${formatCurrency(order.dueAmount || 0)}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Prescription History</h3>
                {customerDetails.prescriptions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Right Eye</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Left Eye</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customerDetails.prescriptions.map((prescription, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(prescription.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              SPH: {prescription.rightEye.sph}, CYL: {prescription.rightEye.cyl},
                              <br />
                              AXIS: {prescription.rightEye.axis}, ADD: {prescription.rightEye.add}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              SPH: {prescription.leftEye.sph}, CYL: {prescription.leftEye.cyl},
                              <br />
                              AXIS: {prescription.leftEye.axis}, ADD: {prescription.leftEye.add}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {prescription.doctorNotes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No prescription history available</p>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order History</h3>
                {customerDetails.orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customerDetails.orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {order.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(order.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.paymentStatus === 'paid' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Due: {formatCurrency(order.dueAmount || 0)}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No order history available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 