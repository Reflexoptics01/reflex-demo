import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../components/firebase-config';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/router';

interface PurchaseOrder {
  id: string;
  vendorName: string;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  status: string;
}

export default function PurchaseOrders() {
  const router = useRouter();
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        console.log('Fetching purchase orders...');
        const ordersRef = collection(db, "purchase_orders");
        const querySnapshot = await getDocs(ordersRef);
        
        const orders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            vendorName: data.vendorName || 'N/A',
            invoiceNumber: data.invoiceNumber || 'N/A',
            date: data.date || 'N/A',
            totalAmount: data.totalAmount || 0,
            status: data.status || 'Pending'
          };
        });

        // Sort by ID in descending order (assuming newer orders have higher IDs)
        const sortedOrders = orders.sort((a, b) => {
          const idA = parseInt(a.id);
          const idB = parseInt(b.id);
          return idB - idA;
        });

        console.log('Fetched orders:', sortedOrders);
        setPurchaseOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  const handleDelete = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await deleteDoc(doc(db, "purchase_orders", orderId));
        setPurchaseOrders(prevOrders => 
          prevOrders.filter(order => order.id !== orderId)
        );
      } catch (error) {
        console.error("Error deleting purchase order:", error);
        alert('Failed to delete purchase order. Please try again.');
      }
    }
  };

  const handleRowClick = (orderId: string) => {
    router.push(`/purchase-order/${orderId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all your purchase orders in one place
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/pages/create-purchase-order"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Purchase Order
          </Link>
        </div>
      </div>
      
      <div className="mt-8">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading purchase orders...</div>
        ) : purchaseOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No purchase orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Party Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Invoice Number</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Amount</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {purchaseOrders.map((order) => (
                  <tr 
                    key={order.id}
                    onClick={() => handleRowClick(order.id)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.vendorName}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.invoiceNumber}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.date}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/edit-purchase-order/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={(e) => handleDelete(e, order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 