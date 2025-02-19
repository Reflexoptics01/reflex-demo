import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/auth-context';
import { collection, doc, setDoc, getCountFromServer, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../components/firebase-config';
import { FramePurchaseItem } from '../components/FramePurchaseItem';
import { LensPurchaseItem } from '../components/LensPurchaseItem';
import { ContactLensPurchaseItem } from '../components/ContactLensPurchaseItem';
import { AccessoryPurchaseItem } from '../components/AccessoryPurchaseItem';
import Link from 'next/link';

// Define types

type ItemType = 'frame' | 'lens' | 'contact-lens' | 'accessory';

interface Vendor {
  id: string;
  name: string;
  gst: string;
  phoneNo: string;
  pname: string;
  email: string;
  address: string;
  city: string;
  state: string;
}

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

const emptyOrderDetails = (): OrderDetails => ({
  vendorId: '',
  vendorName: '',
  purchaseOrderNumber: '',
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  paymentTerms: '30',
  deliveryDate: '',
  notes: '',
  gstType: 'IGST',
  gstRate: '12',
  discount: '0',
  discountType: 'percentage',
  freightCharge: '0',
  itemType: 'frame'
});

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
      return {
        ...baseItem,
        modelNumber: '',
        size: '',
        frameType: '',
        shape: '',
        color: '',
        type: 'frame'
      };
    case 'lens':
      return {
        ...baseItem,
        material: '',
        index: '',
        coating: '',
        category: '',
        diameter: '',
        type: 'lens'
      };
    case 'contact-lens':
      return {
        ...baseItem,
        material: '',
        replacement: '',
        diameter: '',
        baseCurve: '',
        waterContent: '',
        type: 'contact-lens'
      };
    case 'accessory':
      return {
        ...baseItem,
        category: '',
        model: '',
        material: '',
        color: '',
        size: '',
        type: 'accessory'
      };
  }
};

interface User {
  email: string | null;
}

// Add this function after the interfaces and before the component
const generatePONumber = async () => {
  const current = new Date();
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, '0');
  const day = String(current.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Get all POs for today to determine the next sequence number
  const ordersRef = collection(db, "purchase_orders");
  const todayPrefix = `PO-${dateStr}`;
  const q = query(ordersRef, where("id", ">=", todayPrefix), where("id", "<=", todayPrefix + "\uf8ff"));
  const querySnapshot = await getDocs(q);
  
  // Find the highest sequence number for today
  let maxSequence = 0;
  querySnapshot.forEach((doc) => {
    const sequence = parseInt(doc.id.split('-')[2]);
    if (!isNaN(sequence) && sequence > maxSequence) {
      maxSequence = sequence;
    }
  });
  
  // Generate new sequence number (padded to 3 digits)
  const newSequence = String(maxSequence + 1).padStart(3, '0');
  return `PO-${dateStr}-${newSequence}`;
};

export default function CreatePurchaseOrder() {
  const { user } = useAuth() as { user: User | null };
  const [selectedType, setSelectedType] = useState<ItemType>('frame');
  const [items, setItems] = useState<any[]>(Array(10).fill(null).map(() => createEmptyItem('frame')));
  const [orderDetails, setOrderDetails] = useState<OrderDetails>(emptyOrderDetails());
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadVendors = async () => {
      const vendorsRef = collection(db, 'distributors');
      const querySnapshot = await getDocs(vendorsRef);
      const vendorsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Vendor[];
      setVendors(vendorsList);
    };
    const savedDetails = localStorage.getItem('purchaseOrderShowDetails');
    if (savedDetails) {
      setShowDetails(JSON.parse(savedDetails));
    }
    loadVendors();
  }, []);

  useEffect(() => {
    localStorage.setItem('purchaseOrderShowDetails', JSON.stringify(showDetails));
  }, [showDetails]);

  // Add this useEffect to generate PO number when component mounts
  useEffect(() => {
    const generateInitialPONumber = async () => {
      const poNumber = await generatePONumber();
      updateOrderDetails('purchaseOrderNumber', poNumber);
    };
    generateInitialPONumber();
  }, []);

  const handleTypeChange = (type: ItemType) => {
    setSelectedType(type);
    setItems(Array(10).fill(null).map(() => createEmptyItem(type)));
    setOrderDetails(prev => ({ ...prev, itemType: type }));
  };

  const toggleDetails = (itemId: string) => {
    setShowDetails(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const addMoreItems = () => {
    setItems([...items, ...Array(10).fill(null).map(() => createEmptyItem(selectedType))]);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleVendorSearch = (searchTerm: string) => {
    updateOrderDetails('vendorName', searchTerm);
    if (searchTerm) {
      const filtered = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.pname && vendor.pname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vendor.gst && vendor.gst.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors([]);
    }
  };

  const selectVendor = (vendor: Vendor) => {
    updateOrderDetails('vendorId', vendor.id);
    updateOrderDetails('vendorName', vendor.name);
    setFilteredVendors([]);
  };

  const updateOrderDetails = (field: keyof OrderDetails, value: string) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (!orderDetails.vendorName) newErrors.push('Vendor is required');
    if (!orderDetails.purchaseOrderNumber) newErrors.push('Purchase Order Number is required');
    if (!orderDetails.invoiceNumber) newErrors.push('Invoice number is required');
    if (!orderDetails.invoiceDate) newErrors.push('Invoice date is required');
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
    const discountAmount = orderDetails.discountType === 'percentage'
      ? (subtotal * parseFloat(orderDetails.discount || '0')) / 100
      : parseFloat(orderDetails.discount || '0');
    const afterDiscount = subtotal - discountAmount;
    const withFreight = afterDiscount + parseFloat(orderDetails.freightCharge || '0');
    let gstAmount = 0;
    if (orderDetails.gstType !== 'TAXFREE') {
      gstAmount = (withFreight * parseFloat(orderDetails.gstRate || '0')) / 100;
    }
    const total = withFreight + gstAmount;
    return {
      subtotal,
      discountAmount,
      afterDiscount,
      freightCharge: parseFloat(orderDetails.freightCharge || '0'),
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

      // Create purchase order document data
      const purchaseOrderData = {
        id: orderDetails.purchaseOrderNumber,  // Use the entered PO number as the ID
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

      // Create purchase order
      await setDoc(doc(db, "purchase_orders", purchaseOrderData.id), purchaseOrderData);

      // Add to log
      const logRef = collection(db, "log");
      const logSnapshot = await getCountFromServer(logRef);
      const logId = (logSnapshot.data().count + 101).toString();
      
      await setDoc(doc(db, "log", logId), {
        change: `Added purchase order: ${purchaseOrderData.id}`,
        user: user?.email,
        timestamp: Date.now()
      });

      // Reset form
      setItems(Array(10).fill(null).map(() => createEmptyItem(selectedType)));
      setOrderDetails(emptyOrderDetails());
      setErrors([]);
      alert('Purchase order created successfully!');

    } catch (error) {
      console.error('Error creating purchase order:', error);
      setErrors(['Failed to create purchase order. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const renderItem = (item: any, index: number) => {
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
      <div key={item.id} className="flex items-center gap-2 p-1 border rounded-sm mb-2">
        <div className="flex-1">{itemComponent}</div>
        <button type="button" onClick={() => removeItem(item.id)} className="ml-2 text-red-500 hover:text-red-700">
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Create Purchase Order</h1>
        {errors.length > 0 && (
          <div className="text-sm text-red-600">
            {errors.length} error(s) found
            <div className="absolute z-10 mt-2 w-64 bg-white shadow-lg rounded-md p-2 border text-xs">
              {errors.map((error, idx) => (
                <div key={idx} className="text-red-600 mb-1">{error}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 relative">
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
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            {items.map((item, index) => renderItem(item, index))}
          </div>
        </div>

        {/* Compact Footer with Additional Charges and Summary */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <select
                    value={orderDetails.discountType}
                    onChange={(e) => updateOrderDetails('discountType', e.target.value)}
                    className="w-32 rounded-md border-gray-300 shadow-sm text-sm"
                  >
                    <option value="percentage">Discount (%)</option>
                    <option value="amount">Discount (₹)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={orderDetails.discount}
                    onChange={(e) => updateOrderDetails('discount', e.target.value)}
                    className="w-20 rounded-md border-gray-300 shadow-sm text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    value={orderDetails.freightCharge}
                    placeholder="Freight ₹"
                    onChange={(e) => updateOrderDetails('freightCharge', e.target.value)}
                    className="w-24 rounded-md border-gray-300 shadow-sm text-sm"
                  />
                  <select
                    value={orderDetails.gstType}
                    onChange={(e) => updateOrderDetails('gstType', e.target.value as any)}
                    className="w-28 rounded-md border-gray-300 shadow-sm text-sm"
                  >
                    <option value="IGST">IGST</option>
                    <option value="CGST_SGST">CGST + SGST</option>
                    <option value="TAXFREE">Tax Free</option>
                  </select>
                  {orderDetails.gstType !== 'TAXFREE' && (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={orderDetails.gstRate}
                      onChange={(e) => updateOrderDetails('gstRate', e.target.value)}
                      className="w-20 rounded-md border-gray-300 shadow-sm text-sm"
                      placeholder="GST %"
                    />
                  )}
                </div>

                {(() => {
                  const totals = calculateTotals();
                  return (
                    <div className="flex items-center gap-4 ml-auto text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Discount:</span>
                        <span>₹{totals.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">GST:</span>
                        <span>₹{totals.gstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <span>Total:</span>
                        <span>₹{totals.total.toFixed(2)}</span>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-4 inline-flex justify-center items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Creating Order...' : 'Create Purchase Order'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 