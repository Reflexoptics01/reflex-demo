import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../components/firebase-config';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ItemBarcodes } from '../components/ItemBarcodes';

interface PurchaseOrderItem {
  id: string;
  brand: string;
  quantity: string;
  price: string;
  notes?: string;
  type: 'frame' | 'lens' | 'contact-lens' | 'accessory';
  modelNumber?: string;
  size?: string;
  frameType?: string;
  shape?: string;
  color?: string;
  material?: string;
  index?: string;
  coating?: string;
  category?: string;
  diameter?: string;
  replacement?: string;
  baseCurve?: string;
  waterContent?: string;
}

interface PurchaseOrder {
  id: string;
  vendorName: string;
  vendorId?: string;
  invoiceNumber: string;
  invoiceDate?: string;
  date: string;
  time?: string;
  paymentTerms?: string;
  deliveryDate?: string;
  notes?: string;
  status: string;
  items?: PurchaseOrderItem[];
  gstType?: 'IGST' | 'CGST_SGST' | 'TAXFREE';
  gstRate?: string;
  discount?: number;
  discountType?: 'percentage' | 'amount';
  freightCharge?: number;
  subtotal?: number;
  gstAmount?: number;
  totalAmount: number;
  createdBy?: string;
}

export default function PurchaseOrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;

      try {
        const orderDoc = await getDoc(doc(db, 'purchase_orders', id as string));
        if (orderDoc.exists()) {
          const data = orderDoc.data();
          setOrder({
            id: orderDoc.id,
            vendorName: data.vendorName || 'N/A',
            vendorId: data.vendorId,
            invoiceNumber: data.invoiceNumber || 'N/A',
            invoiceDate: data.invoiceDate,
            date: data.date || 'N/A',
            time: data.time,
            status: data.status || 'N/A',
            items: data.items || [],
            totalAmount: data.totalAmount || 0,
            subtotal: data.subtotal || 0,
            discount: data.discount || 0,
            discountType: data.discountType || 'amount',
            freightCharge: data.freightCharge || 0,
            gstAmount: data.gstAmount || 0,
            gstType: data.gstType || 'IGST',
            gstRate: data.gstRate || '0',
            ...data
          });
        } else {
          setError('Purchase order not found');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load purchase order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading purchase order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{error || 'Order not found'}</div>
      </div>
    );
  }

  const renderItemDetails = (item: PurchaseOrderItem, index: number) => {
    const commonDetails = (
      <div className="grid grid-cols-2 gap-x-4 text-sm">
        <div className="text-gray-500">Brand: {item.brand || 'N/A'}</div>
        <div className="text-gray-500">Quantity: {item.quantity || '0'}</div>
        <div className="text-gray-500">Price: ₹{parseFloat(item.price || '0').toFixed(2)}</div>
        {item.notes && <div className="col-span-2 text-gray-500">Notes: {item.notes}</div>}
      </div>
    );

    let specificDetails;
    switch (item.type) {
      case 'frame':
        specificDetails = (
          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div className="text-gray-500">Model: {item.modelNumber || 'N/A'}</div>
            <div className="text-gray-500">Size: {item.size || 'N/A'}</div>
            <div className="text-gray-500">Type: {item.frameType || 'N/A'}</div>
            <div className="text-gray-500">Shape: {item.shape || 'N/A'}</div>
            <div className="text-gray-500">Color: {item.color || 'N/A'}</div>
          </div>
        );
        break;
      case 'lens':
        specificDetails = (
          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div className="text-gray-500">Material: {item.material || 'N/A'}</div>
            <div className="text-gray-500">Index: {item.index || 'N/A'}</div>
            <div className="text-gray-500">Coating: {item.coating || 'N/A'}</div>
            <div className="text-gray-500">Category: {item.category || 'N/A'}</div>
            <div className="text-gray-500">Diameter: {item.diameter || 'N/A'}</div>
          </div>
        );
        break;
      case 'contact-lens':
        specificDetails = (
          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div className="text-gray-500">Material: {item.material || 'N/A'}</div>
            <div className="text-gray-500">Replacement: {item.replacement || 'N/A'}</div>
            <div className="text-gray-500">Diameter: {item.diameter || 'N/A'}</div>
            <div className="text-gray-500">Base Curve: {item.baseCurve || 'N/A'}</div>
            <div className="text-gray-500">Water Content: {item.waterContent || 'N/A'}</div>
          </div>
        );
        break;
      case 'accessory':
        specificDetails = (
          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div className="text-gray-500">Category: {item.category || 'N/A'}</div>
            <div className="text-gray-500">Model: {item.modelNumber || 'N/A'}</div>
            <div className="text-gray-500">Material: {item.material || 'N/A'}</div>
            <div className="text-gray-500">Color: {item.color || 'N/A'}</div>
            <div className="text-gray-500">Size: {item.size || 'N/A'}</div>
          </div>
        );
        break;
      default:
        specificDetails = null;
    }

    return (
      <div key={item.id || index} className="bg-gray-50 p-3 rounded-lg mb-2">
        <div className="flex justify-between items-start mb-2">
          <h5 className="text-sm font-medium text-gray-900">
            Item {index + 1} - {item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1)) : 'N/A'}
          </h5>
          <ItemBarcodes item={item} purchaseOrderId={order.id} itemIndex={index} />
        </div>
        <div className="space-y-2">
          {commonDetails}
          {specificDetails}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/purchase-orders"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Purchase Orders
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Purchase Order Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Created on {order.date} {order.time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                #PO-{order.id}
              </p>
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Vendor Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{order.vendorName}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{order.invoiceNumber}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Invoice Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{order.invoiceDate || 'N/A'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </dd>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-lg font-medium text-gray-900">Items</h4>
            <div className="mt-6 space-y-6">
              {order.items && order.items.map((item, index) => renderItemDetails(item, index))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal:</span>
              <span className="text-gray-900">₹{(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount ({order.discountType || 'amount'}):</span>
              <span className="text-gray-900">₹{(order.discount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Freight Charge:</span>
              <span className="text-gray-900">₹{(order.freightCharge || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GST ({order.gstType || 'IGST'} @ {order.gstRate || '0'}%):</span>
              <span className="text-gray-900">₹{(order.gstAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-900">Total Amount:</span>
              <span className="text-gray-900">₹{(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 