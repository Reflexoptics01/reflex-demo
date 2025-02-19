import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/auth-context';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../components/firebase-config';
import { FramePurchaseItem } from '../components/FramePurchaseItem';
import { LensPurchaseItem } from '../components/LensPurchaseItem';
import { ContactLensPurchaseItem } from '../components/ContactLensPurchaseItem';
import { AccessoryPurchaseItem } from '../components/AccessoryPurchaseItem';
import Link from 'next/link';

// Define types

type ItemType = 'frame' | 'lens' | 'contact-lens' | 'accessory';

interface OrderDetails {
  vendorId: string;
  vendorName: string;
  purchaseOrderNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentTerms: string;
  deliveryDate: string;
  notes: string;
  gstType: 'IGST' | 'CGST_SGST' | 'TAXFREE';
  gstRate: string;
  discount: string;
  discountType: 'percentage' | 'amount';
  freightCharge: string;
  itemType: ItemType;
}

// A helper function to create an empty item
const createEmptyItem = (type: ItemType, id: string = Math.random().toString(36).substr(2, 9)) => {
  const baseItem = {
    id,
    brand: '',
    quantity: '1',
    price: '',
    notes: '',
    type
  };
  switch (type) {
    case 'frame':
      return { ...baseItem, modelNumber: '', size: '', frameType: '', shape: '', color: '', type: 'frame' };
    case 'lens':
      return { ...baseItem, material: '', index: '', coating: '', category: '', diameter: '', type: 'lens' };
    case 'contact-lens':
      return { ...baseItem, material: '', replacement: '', diameter: '', baseCurve: '', waterContent: '', type: 'contact-lens' };
    case 'accessory':
      return { ...baseItem, category: '', model: '', material: '', color: '', size: '', type: 'accessory' };
    default:
      return baseItem;
  }
};

export default function EditPurchaseOrder() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user } = useAuth() as { user: { email: string } | null };

  const [selectedType, setSelectedType] = useState<ItemType>('frame');
  const [items, setItems] = useState<any[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch purchase order data
  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "purchase_orders", orderId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const od: OrderDetails = {
            vendorId: data.vendorId,
            vendorName: data.vendorName,
            purchaseOrderNumber: data.id, // assuming id is used as PO number
            invoiceNumber: data.invoiceNumber,
            invoiceDate: data.invoiceDate,
            paymentTerms: data.paymentTerms,
            deliveryDate: data.deliveryDate,
            notes: data.notes,
            gstType: data.gstType,
            gstRate: data.gstRate,
            discount: data.discount,
            discountType: data.discountType,
            freightCharge: data.freightCharge,
            itemType: data.itemType
          };
          setOrderDetails(od);
          setSelectedType(data.itemType);
          setItems(data.items || []);
        } else {
          setErrors(prev => [...prev, "Purchase order not found"]);
        }
      } catch (error) {
        console.error(error);
        setErrors(prev => [...prev, "Failed to fetch purchase order"]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Fetch vendors
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const vendorsRef = collection(db, "distributors");
        const querySnapshot = await getDocs(vendorsRef);
        const vendorsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVendors(vendorsList);
      } catch (err) {
        console.error(err);
      }
    };
    loadVendors();
  }, []);

  // Handlers
  const handleTypeChange = (type: ItemType) => {
    setSelectedType(type);
    setItems(Array(10).fill(null).map(() => createEmptyItem(type)));
    if (orderDetails) {
      setOrderDetails({ ...orderDetails, itemType: type });
    }
  };

  const toggleDetails = (itemId: string) => {
    setShowDetails(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const addMoreItems = () => {
    setItems([...items, ...Array(10).fill(null).map(() => createEmptyItem(selectedType))]);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleVendorSearch = (searchTerm: string) => {
    updateOrderDetails('vendorName', searchTerm);
    if (searchTerm) {
      const filtered = vendors.filter(vendor => 
        (vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         vendor.pname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         vendor.gst?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors([]);
    }
  };

  const updateOrderDetails = (field: keyof OrderDetails, value: string) => {
    if (orderDetails) {
      setOrderDetails({ ...orderDetails, [field]: value });
    }
  };

  const selectVendor = (vendor: any) => {
    updateOrderDetails('vendorId', vendor.id);
    updateOrderDetails('vendorName', vendor.name);
    setFilteredVendors([]);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (orderDetails) {
      if (!orderDetails.vendorName) newErrors.push('Vendor is required');
      if (!orderDetails.invoiceNumber) newErrors.push('Invoice number is required');
      if (!orderDetails.invoiceDate) newErrors.push('Invoice date is required');
    } else {
      newErrors.push('Order details missing');
    }

    const filledItems = items.filter(item => item.brand || item.quantity !== '1' || item.price || item.notes);
    if (filledItems.length === 0) {
      newErrors.push('At least one item must be added to the purchase order');
    } else {
      filledItems.forEach((item, index) => {
        const itemNumber = index + 1;
        if (!item.brand) newErrors.push(`Item ${itemNumber}: Brand is required`);
        if (!item.quantity || parseInt(item.quantity) < 1) newErrors.push(`Item ${itemNumber}: Valid quantity is required`);
        if (!item.price || parseFloat(item.price) <= 0) newErrors.push(`Item ${itemNumber}: Valid price is required`);
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const calculateTotals = () => {
    const validItems = items.filter(item => item.brand && item.quantity && item.price);
    const subtotal = validItems.reduce((sum, item) => sum + (parseFloat(item.price || '0') * parseInt(item.quantity || '0')), 0);
    const discountAmount = orderDetails && orderDetails.discountType === 'percentage'
      ? (subtotal * parseFloat(orderDetails.discount || '0')) / 100
      : parseFloat(orderDetails?.discount || '0');
    const afterDiscount = subtotal - discountAmount;
    const withFreight = afterDiscount + parseFloat(orderDetails?.freightCharge || '0');
    let gstAmount = 0;
    if (orderDetails && orderDetails.gstType !== 'TAXFREE') {
      gstAmount = (withFreight * parseFloat(orderDetails.gstRate || '0')) / 100;
    }
    const total = withFreight + gstAmount;
    return {
      subtotal,
      discountAmount,
      afterDiscount,
      freightCharge: parseFloat(orderDetails?.freightCharge || '0'),
      gstAmount,
      total,
      totalQuantity: validItems.reduce((sum, item) => sum + parseInt(item.quantity || '0'), 0)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const current = new Date();
      const date = current.toLocaleDateString('en-GB');
      const time = current.toLocaleTimeString('en-US', { hour12: false });
      const validItems = items.filter(item => item.brand && item.quantity && item.price);
      const totals = calculateTotals();

      const purchaseOrderData = {
        id: orderDetails?.purchaseOrderNumber, // using the existing PO number
        date,
        time,
        items: validItems,
        ...orderDetails,
        status: "Pending",
        createdBy: user?.email,
        totalQuantity: totals.totalQuantity,
        subtotal: totals.subtotal,
        discount: totals.discountAmount,
        freightCharge: totals.freightCharge,
        gstAmount: totals.gstAmount,
        totalAmount: totals.total
      };

      const docRef = doc(db, "purchase_orders", orderDetails?.purchaseOrderNumber || "");
      await updateDoc(docRef, purchaseOrderData);
      alert('Purchase order updated successfully!');
      router.push('/purchase-orders');
    } catch (error) {
      console.error('Error updating purchase order:', error);
      setErrors(['Failed to update purchase order. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;
  if (isLoading) return <div>Loading...</div>;
  if (!orderDetails) return <div>Order not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Edit Purchase Order - #{orderDetails.purchaseOrderNumber}</h1>
      {errors.length > 0 && (
        <div className="mb-4 p-2 bg-red-100 text-red-600">
          {errors.map((err, idx) => <div key={idx}>{err}</div>)}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">PO Number</label>
            <input
              type="text"
              value={orderDetails.purchaseOrderNumber}
              readOnly
              className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
            <div className="relative flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={orderDetails.vendorName}
                  onChange={(e) => handleVendorSearch(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  placeholder="Search vendor..."
                />
                {filteredVendors.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto">
                    {filteredVendors.map(vendor => (
                      <div 
                        key={vendor.id}
                        onClick={() => selectVendor(vendor)}
                        className="px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        {vendor.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href="/pages/addvendor"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Link>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              value={orderDetails.invoiceNumber}
              onChange={(e) => updateOrderDetails('invoiceNumber', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Date</label>
            <input
              type="date"
              value={orderDetails.invoiceDate}
              onChange={(e) => updateOrderDetails('invoiceDate', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label>
            <input
              type="number"
              value={orderDetails.paymentTerms}
              onChange={(e) => updateOrderDetails('paymentTerms', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm"
              placeholder="Days"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Date</label>
            <input
              type="date"
              value={orderDetails.deliveryDate}
              onChange={(e) => updateOrderDetails('deliveryDate', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm"
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-medium text-gray-900">Items</h2>
            <button
              type="button"
              onClick={addMoreItems}
              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add More
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => {
              let itemComponent;
              switch (item.type) {
                case 'frame':
                  itemComponent = <FramePurchaseItem item={item} index={index} showDetails={showDetails[item.id]} onUpdateItem={updateItem} onToggleDetails={toggleDetails} />;
                  break;
                case 'lens':
                  itemComponent = <LensPurchaseItem item={item} index={index} showDetails={showDetails[item.id]} onUpdateItem={updateItem} onToggleDetails={toggleDetails} />;
                  break;
                case 'contact-lens':
                  itemComponent = <ContactLensPurchaseItem item={item} index={index} showDetails={showDetails[item.id]} onUpdateItem={updateItem} onToggleDetails={toggleDetails} />;
                  break;
                case 'accessory':
                  itemComponent = <AccessoryPurchaseItem item={item} index={index} showDetails={showDetails[item.id]} onUpdateItem={updateItem} onToggleDetails={toggleDetails} />;
                  break;
                default:
                  itemComponent = null;
              }
              return (
                <div key={item.id} className="flex items-center gap-2 p-1 border rounded-sm">
                  <div className="flex-1">
                    {itemComponent}
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="ml-2 text-red-500 hover:text-red-700">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {orderDetails && (
          <div className="grid grid-cols-5 gap-4 bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Discount</label>
              <input
                type="number"
                value={orderDetails.discount}
                onChange={(e) => updateOrderDetails('discount', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                placeholder="Discount"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={orderDetails.discountType}
                onChange={(e) => updateOrderDetails('discountType', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm"
              >
                <option value="percentage">%</option>
                <option value="amount">₹</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Freight Charge</label>
              <input
                type="number"
                value={orderDetails.freightCharge}
                onChange={(e) => updateOrderDetails('freightCharge', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                placeholder="Freight"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">GST Type</label>
              <select
                value={orderDetails.gstType}
                onChange={(e) => updateOrderDetails('gstType', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm"
              >
                <option value="IGST">IGST</option>
                <option value="CGST_SGST">CGST+SGST</option>
                <option value="TAXFREE">Tax Free</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">GST Rate</label>
              <input
                type="number"
                value={orderDetails.gstRate}
                onChange={(e) => updateOrderDetails('gstRate', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                placeholder="GST %"
                disabled={orderDetails.gstType === 'TAXFREE'}
              />
            </div>
          </div>
        )}

        {/* Summary Section: Final Calculated Totals */}
        {orderDetails && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            {(() => {
              const totals = calculateTotals();
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium">₹{totals.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Before Tax:</span>
                    <span className="font-medium">₹{(totals.afterDiscount + totals.freightCharge).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST:</span>
                    <span className="font-medium">₹{totals.gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-2 border-t pt-2">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">₹{totals.total.toFixed(2)}</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-4 inline-flex justify-center items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Order...' : 'Update Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
} 