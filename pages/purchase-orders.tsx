import React from 'react';
import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/auth-context';
import { collection, doc, setDoc, getCountFromServer, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../components/firebase-config';
import { FramePurchaseItem, FrameItem } from '../components/FramePurchaseItem';
import { LensPurchaseItem, LensItem } from '../components/LensPurchaseItem';
import { ContactLensPurchaseItem, ContactLensItem } from '../components/ContactLensPurchaseItem';
import { AccessoryPurchaseItem, AccessoryItem } from '../components/AccessoryPurchaseItem';
import { PurchaseItemProps } from '../components/PurchaseItem';
import Link from 'next/link';

type ItemType = 'frame' | 'lens' | 'contact-lens' | 'accessory';
type PurchaseItem = FrameItem | LensItem | ContactLensItem | AccessoryItem;

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

const createEmptyItem = (type: ItemType, id: string = Math.random().toString(36).substr(2, 9)): PurchaseItem => {
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
      } as FrameItem;
    case 'lens':
      return {
        ...baseItem,
        material: '',
        index: '',
        coating: '',
        category: '',
        diameter: '',
        type: 'lens'
      } as LensItem;
    case 'contact-lens':
      return {
        ...baseItem,
        material: '',
        replacement: '',
        diameter: '',
        baseCurve: '',
        waterContent: '',
        type: 'contact-lens'
      } as ContactLensItem;
    case 'accessory':
      return {
        ...baseItem,
        category: '',
        model: '',
        material: '',
        color: '',
        size: '',
        type: 'accessory'
      } as AccessoryItem;
  }
};

interface User {
  email: string | null;
}

export default function PurchaseOrders() {
  const { user } = useAuth() as { user: User | null };
  const [selectedType, setSelectedType] = useState<ItemType>('frame');
  const [items, setItems] = useState<PurchaseItem[]>(
    Array(10).fill(null).map(() => createEmptyItem('frame'))
  );
  const [orderDetails, setOrderDetails] = useState<OrderDetails>(emptyOrderDetails());
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});

  // Frame type options
  const frameTypes = ['full-frame', 'supra', 'rimless'];
  const shapeTypes = ['square', 'rectangular', 'round', 'different'];

  // Load vendors and user preferences
  useEffect(() => {
    const loadVendors = async () => {
      const vendorsRef = collection(db, "distributors");
      const querySnapshot = await getDocs(vendorsRef);
      const vendorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vendor));
      setVendors(vendorsList);
    };

    // Load user preferences for showing details
    const savedDetails = localStorage.getItem('purchaseOrderShowDetails');
    if (savedDetails) {
      setShowDetails(JSON.parse(savedDetails));
    }

    loadVendors();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('purchaseOrderShowDetails', JSON.stringify(showDetails));
  }, [showDetails]);

  const handleTypeChange = (type: ItemType) => {
    setSelectedType(type);
    setItems(Array(10).fill(null).map(() => createEmptyItem(type)));
    setOrderDetails(prev => ({ ...prev, itemType: type }));
  };

  const toggleDetails = (itemId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const addMoreItems = () => {
    setItems([...items, ...Array(10).fill(null).map(() => createEmptyItem(selectedType))]);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // NEW: Function to remove an item
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

  const selectVendor = (vendor: Vendor) => {
    updateOrderDetails('vendorId', vendor.id);
    updateOrderDetails('vendorName', vendor.name);
    setFilteredVendors([]);
  };

  const updateOrderDetails = (field: keyof OrderDetails, value: string) => {
    setOrderDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!orderDetails.vendorName) newErrors.push('Vendor is required');
    if (!orderDetails.invoiceNumber) newErrors.push('Invoice number is required');
    if (!orderDetails.invoiceDate) newErrors.push('Invoice date is required');

    const filledItems = items.filter(item => 
      item.brand || item.quantity !== '1' || item.price || item.notes
    );

    if (filledItems.length === 0) {
      newErrors.push('At least one item must be added to the purchase order');
    } else {
      filledItems.forEach((item, index) => {
        const itemNumber = items.indexOf(item) + 1;
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
    const subtotal = validItems.reduce((sum, item) => 
      sum + (parseFloat(item.price || '0') * parseInt(item.quantity || '0')), 0
    );
    
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

      // Get next order ID
      const ordersRef = collection(db, "purchase_orders");
      const snapshot = await getCountFromServer(ordersRef);
      const nextId = (snapshot.data().count + 1001).toString();

      // Create purchase order document data
      const purchaseOrderData = {
        id: nextId,
        date,
        time,
        items: validItems,
        ...orderDetails, // This will include itemType
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
      await setDoc(doc(db, "purchase_orders", nextId), purchaseOrderData);

      // Add to log
      const logRef = collection(db, "log");
      const logSnapshot = await getCountFromServer(logRef);
      const logId = (logSnapshot.data().count + 101).toString();
      
      await setDoc(doc(db, "log", logId), {
        change: `Added purchase order: ${nextId}`,
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

  const renderItem = (item: PurchaseItem, index: number) => {
    let itemComponent;
    switch (item.type) {
      case 'frame': {
        const frameProps: Omit<PurchaseItemProps<FrameItem>, 'renderAdditionalFields'> = {
          item: item as FrameItem,
          index,
          showDetails: showDetails[item.id],
          onUpdateItem: updateItem,
          onToggleDetails: toggleDetails,
        };
        itemComponent = <FramePurchaseItem {...frameProps} />;
        break;
      }
      case 'lens': {
        const lensProps: Omit<PurchaseItemProps<LensItem>, 'renderAdditionalFields'> = {
          item: item as LensItem,
          index,
          showDetails: showDetails[item.id],
          onUpdateItem: updateItem,
          onToggleDetails: toggleDetails,
        };
        itemComponent = <LensPurchaseItem {...lensProps} />;
        break;
      }
      case 'contact-lens': {
        const contactLensProps: Omit<PurchaseItemProps<ContactLensItem>, 'renderAdditionalFields'> = {
          item: item as ContactLensItem,
          index,
          showDetails: showDetails[item.id],
          onUpdateItem: updateItem,
          onToggleDetails: toggleDetails,
        };
        itemComponent = <ContactLensPurchaseItem {...contactLensProps} />;
        break;
      }
      case 'accessory': {
        const accessoryProps: Omit<PurchaseItemProps<AccessoryItem>, 'renderAdditionalFields'> = {
          item: item as AccessoryItem,
          index,
          showDetails: showDetails[item.id],
          onUpdateItem: updateItem,
          onToggleDetails: toggleDetails,
        };
        itemComponent = <AccessoryPurchaseItem {...accessoryProps} />;
        break;
      }
      default:
        itemComponent = null;
    }
    return (
      <div className="flex items-center gap-2 p-1 border rounded-sm">
        <div className="flex-1">
          {itemComponent}
        </div>
        <button type="button" onClick={() => removeItem(item.id)} className="ml-2 text-red-500 hover:text-red-700">
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    );
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
        <div className="text-center text-gray-500 py-8">
          Purchase order list will be added here based on your requirements
        </div>
      </div>
    </div>
  );
} 