import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, Square3Stack3DIcon, EyeIcon, CircleStackIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/auth-context';
import { collection, doc, setDoc, getCountFromServer, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../components/firebase-config';
import { SaleFrameItem } from '../../components/SaleFrameItem';
import { SaleLensItem } from '../../components/SaleLensItem';
import { SaleContactLensItem } from '../../components/SaleContactLensItem';
import { SaleAccessoryItem } from '../../components/SaleAccessoryItem';
import Link from 'next/link';
import AddCustomer from './addcustomer';
import ImportPatient from '../components/ImportPatient';
import Router from 'next/router';

type ItemType = 'frame' | 'lens' | 'contact-lens' | 'accessory';

interface Customer {
  id: string;
  name: string;
  phone: string;
  phoneNo: string;
  email: string;
  address: string;
  prescriptions?: { 
    rightEye?: { 
      sph: string; 
      cyl: string; 
      axis: string; 
      add: string; 
      pd: string;
      near: string;
    }; 
    leftEye?: { 
      sph: string; 
      cyl: string; 
      axis: string; 
      add: string; 
      pd: string;
      near: string;
    } 
  }[];
}

interface OrderDetails {
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  notes: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'other';
  paymentStatus: 'pending' | 'partial' | 'completed';
  paidAmount: string;
  discount: string;
  discountType: 'percentage' | 'amount';
  itemType: ItemType;
}

const emptyOrderDetails = (): OrderDetails => ({
  customerId: '',
  customerName: '',
  customerPhone: '',
  orderNumber: '',
  orderDate: new Date().toISOString().split('T')[0],
  deliveryDate: '',
  notes: '',
  paymentMethod: 'cash',
  paymentStatus: 'pending',
  paidAmount: '0',
  discount: '0',
  discountType: 'percentage',
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
        type: 'frame',
        prescription: {
          right: { sph: '', cyl: '', axis: '', add: '', pd: '' },
          left: { sph: '', cyl: '', axis: '', add: '', pd: '' }
        }
      };
    case 'lens':
      return {
        ...baseItem,
        material: '',
        index: '',
        coating: '',
        category: '',
        diameter: '',
        company: '',
        tint: '',
        fog: 'false',
        clean: 'false',
        card: 'false',
        channel: 'false',
        type: 'lens',
        prescription: {
          right: { sph: '', cyl: '', axis: '', add: '', pd: '' },
          left: { sph: '', cyl: '', axis: '', add: '', pd: '' }
        }
      };
    case 'contact-lens':
      return {
        ...baseItem,
        material: '',
        replacement: '',
        diameter: '',
        baseCurve: '',
        waterContent: '',
        company: '',
        pack: '',
        modality: '',
        col: 'NA',
        ctype: '',
        powertype: '',
        clean: 'false',
        card: 'false',
        channel: 'false',
        type: 'contact-lens',
        prescription: {
          right: { sph: '', cyl: '', axis: '', add: '', bc: '', dia: '' },
          left: { sph: '', cyl: '', axis: '', add: '', bc: '', dia: '' }
        }
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

export default function CreateSaleOrder() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([
    createEmptyItem('frame'),
    createEmptyItem('lens')
  ]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>(emptyOrderDetails());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [selectedTab, setSelectedTab] = useState<ItemType>('frame');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [showImportPatientModal, setShowImportPatientModal] = useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAddCustomerModal) {
        setShowAddCustomerModal(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showAddCustomerModal]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersRef = collection(db, 'retailers');
        const querySnapshot = await getDocs(customersRef);
        const customersList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            phone: data.phoneNo || '',
            phoneNo: data.phoneNo || '',
            email: data.email || '',
            address: data.address || '',
            prescriptions: data.prescriptions || []
          };
        }) as Customer[];
        console.log('Loaded customers:', customersList.length);
        setCustomers(customersList);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };

    const savedDetails = localStorage.getItem('saleOrderShowDetails');
    if (savedDetails) {
      setShowDetails(JSON.parse(savedDetails));
    }

    loadCustomers();
  }, []);

  useEffect(() => {
    localStorage.setItem('saleOrderShowDetails', JSON.stringify(showDetails));
  }, [showDetails]);

  useEffect(() => {
    const generateOrderNumber = async () => {
      try {
        // Get today's date in DD-MM-YYYY format
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB'); // Will give DD/MM/YYYY
        
        // Query only today's orders
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("date", "==", formattedDate));
        const querySnapshot = await getDocs(q);
        
        // Get count of today's orders and add 1
        const nextNumber = querySnapshot.size + 1;
        
        setOrderDetails(prev => ({ ...prev, orderNumber: nextNumber.toString() }));
      } catch (error) {
        console.error('Error generating order number:', error);
        // Start from 1 if there's an error
        setOrderDetails(prev => ({ ...prev, orderNumber: "1" }));
      }
    };

    generateOrderNumber();
  }, []);

  const calculateTotals = useCallback(() => {
    const validItems = items.filter(item => item.brand && item.quantity && item.price);
    const subtotal = validItems.reduce((sum, item) => 
      sum + (parseFloat(item.price || '0') * parseInt(item.quantity || '0')), 0
    );
    
    const discountAmount = orderDetails.discountType === 'percentage' 
      ? (subtotal * parseFloat(orderDetails.discount || '0')) / 100
      : parseFloat(orderDetails.discount || '0');

    const total = subtotal - discountAmount;
    const balance = total - parseFloat(orderDetails.paidAmount || '0');

    return {
      subtotal,
      discountAmount,
      total,
      balance,
      totalQuantity: validItems.reduce((sum, item) => sum + parseInt(item.quantity || '0'), 0)
    };
  }, [items, orderDetails.discount, orderDetails.discountType, orderDetails.paidAmount]);

  // Automatic update of paymentStatus based on advance amount and order total
  useEffect(() => {
    const totals = calculateTotals();
    const paid = parseFloat(orderDetails.paidAmount || '0');
    let newStatus: 'pending' | 'partial' | 'completed';
    if (paid === 0) {
      newStatus = 'pending';
    } else if (paid >= totals.total) {
      newStatus = 'completed';
    } else {
      newStatus = 'partial';
    }
    if (orderDetails.paymentStatus !== newStatus) {
      setOrderDetails(prev => ({ ...prev, paymentStatus: newStatus }));
    }
  }, [calculateTotals, orderDetails.paymentStatus, orderDetails.paidAmount]);

  const toggleDetails = (itemId: string) => {
    setShowDetails(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const addMoreItems = () => {
    const newItem = createEmptyItem('frame');
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.slice(0, 10);
  };

  const handleCustomerSearch = (searchTerm: string) => {
    updateOrderDetails('customerName', searchTerm);
    setShowCustomerSuggestions(false);
  };

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    updateOrderDetails('customerPhone', numericValue);
    
    if (numericValue.length >= 3) {
      const matches = customers.filter(customer => {
        const customerPhone = (customer.phone || customer.phoneNo || '').replace(/\D/g, '');
        return customerPhone.includes(numericValue);
      });
      setFilteredCustomers(matches);
      setShowCustomerSuggestions(true);
    } else {
      setFilteredCustomers([]);
      setShowCustomerSuggestions(false);
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Tab' || e.key === 'Enter') && orderDetails.customerPhone.length === 10) {
      e.preventDefault();
      
      // Check if phone number exists in customers list
      const phoneExists = customers.some(customer => {
        const customerPhone = (customer.phone || customer.phoneNo || '').replace(/\D/g, '');
        return customerPhone === orderDetails.customerPhone;
      });

      if (!phoneExists) {
        setShowCustomerSuggestions(false);
        setShowAddCustomerModal(true);
      }
    }
  };

  const selectCustomer = (customer: Customer) => {
    const phoneNumber = (customer.phone || customer.phoneNo || '').replace(/\D/g, '').slice(0, 10);
    updateOrderDetails('customerId', customer.id);
    updateOrderDetails('customerName', customer.name);
    updateOrderDetails('customerPhone', phoneNumber);
    setShowCustomerSuggestions(false);
  };

  const updateOrderDetails = (field: keyof OrderDetails, value: string) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerCreated = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    updateOrderDetails('customerId', newCustomer.id);
    updateOrderDetails('customerName', newCustomer.name);
    updateOrderDetails('customerPhone', newCustomer.phone);

    // If prescription data is available, update the lens items
    if (newCustomer.prescriptions && newCustomer.prescriptions.length > 0) {
      const latestPrescription = newCustomer.prescriptions[0];
      const updatedItems = items.map(item => {
        if (item.type === 'lens') {
          return {
            ...item,
            prescription: {
              right: {
                sph: latestPrescription.rightEye?.sph || '',
                cyl: latestPrescription.rightEye?.cyl || '',
                axis: latestPrescription.rightEye?.axis || '',
                add: latestPrescription.rightEye?.add || '',
                pd: latestPrescription.rightEye?.pd || ''
              },
              left: {
                sph: latestPrescription.leftEye?.sph || '',
                cyl: latestPrescription.leftEye?.cyl || '',
                axis: latestPrescription.leftEye?.axis || '',
                add: latestPrescription.leftEye?.add || '',
                pd: latestPrescription.leftEye?.pd || ''
              }
            }
          };
        }
        return item;
      });
      setItems(updatedItems);
    }

    setShowAddCustomerModal(false);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!orderDetails.customerName) newErrors.name = 'Customer name is required';
    if (!orderDetails.customerPhone) newErrors.phone = 'Customer phone is required';
    if (!orderDetails.orderDate) newErrors.orderDate = 'Order date is required';

    const filledItems = items.filter(item => 
      item.brand || item.quantity !== '1' || item.price || item.notes
    );

    if (filledItems.length === 0) {
      newErrors.items = 'At least one item must be added to the sale order';
    } else {
      filledItems.forEach((item, index) => {
        const itemNumber = items.indexOf(item) + 1;
        if (!item.brand) newErrors[`item${itemNumber}Brand`] = `Item ${itemNumber}: Brand is required`;
        if (!item.quantity || parseInt(item.quantity) < 1) newErrors[`item${itemNumber}Quantity`] = `Item ${itemNumber}: Valid quantity is required`;
        if (!item.price || parseFloat(item.price) <= 0) newErrors[`item${itemNumber}Price`] = `Item ${itemNumber}: Valid price is required`;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      const saleOrderData = {
        id: orderDetails.orderNumber,
        username: orderDetails.customerName,
        phone: orderDetails.customerPhone,
        date,
        time,
        items: validItems,
        ...orderDetails,
        status: orderDetails.paymentStatus === 'completed' ? 'Completed' : 'Pending',
        createdBy: user?.email,
        totalQuantity: totals.totalQuantity,
        subtotal: totals.subtotal,
        discount: totals.discountAmount,
        price: totals.total - totals.balance,
        total: totals.total,
        balance: totals.balance,
        brand: validItems[0]?.brand || '',
        ed: orderDetails.deliveryDate
      };

      await setDoc(doc(db, "orders", saleOrderData.id), saleOrderData);

      const logRef = collection(db, "log");
      const logSnapshot = await getCountFromServer(logRef);
      const logId = (logSnapshot.data().count + 101).toString();
      
      await setDoc(doc(db, "log", logId), {
        change: `Added sale order: ${saleOrderData.id}`,
        user: user?.email,
        timestamp: Date.now()
      });

      setItems(Array(2).fill(null).map(() => createEmptyItem('frame')));
      setOrderDetails(emptyOrderDetails());
      setErrors({});
      alert('Sale order created successfully!');
      
      // Clear the orders cache and redirect to home
      localStorage.removeItem('ods');
      Router.push('/home');

    } catch (error) {
      console.error('Error creating sale order:', error);
      setErrors({ general: 'Failed to create sale order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientImport = (patient: any) => {
    // Update customer details
    updateOrderDetails('customerName', patient.name || patient.patientName || '');
    updateOrderDetails('customerPhone', patient.phone || patient.phoneNo || '');

    // If there's a prescription, update the lens item with prescription data
    if (patient.prescriptions && patient.prescriptions.length > 0) {
      const latestPrescription = patient.prescriptions[0];
      const updatedItems = items.map(item => {
        if (item.type === 'lens') {
          const rightNear = calculateNear(latestPrescription.rightEye?.sph || '', latestPrescription.rightEye?.add || '');
          const leftNear = calculateNear(latestPrescription.leftEye?.sph || '', latestPrescription.leftEye?.add || '');
          
          return {
            ...item,
            prescription: {
              right: {
                sph: latestPrescription.rightEye?.sph || '',
                cyl: latestPrescription.rightEye?.cyl || '',
                axis: latestPrescription.rightEye?.axis || '',
                add: latestPrescription.rightEye?.add || '',
                pd: latestPrescription.rightEye?.pd || '',
                near: rightNear
              },
              left: {
                sph: latestPrescription.leftEye?.sph || '',
                cyl: latestPrescription.leftEye?.cyl || '',
                axis: latestPrescription.leftEye?.axis || '',
                add: latestPrescription.leftEye?.add || '',
                pd: latestPrescription.leftEye?.pd || '',
                near: leftNear
              }
            },
            material: latestPrescription.material || item.material || '',
            index: latestPrescription.index || item.index || '',
            coating: latestPrescription.coating || item.coating || '',
            category: latestPrescription.category || item.category || '',
            diameter: latestPrescription.diameter || item.diameter || '',
            company: latestPrescription.company || item.company || '',
            tint: latestPrescription.tint || item.tint || ''
          };
        }
        return item;
      });
      setItems(updatedItems);
    }

    setShowImportPatientModal(false);
  };

  const calculateNear = (sph: string, add: string): string => {
    const sphNum = parseFloat(sph) || 0;
    const addNum = parseFloat(add) || 0;
    if (!isNaN(sphNum) && !isNaN(addNum)) {
      return (sphNum + addNum).toFixed(2);
    }
    return '';
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-36">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Create Sale Order</h1>
        {Object.keys(errors).length > 0 && (
          <div className="text-sm text-red-600">
            {Object.keys(errors).length} error(s) found
            <div className="absolute z-10 mt-2 w-64 bg-white shadow-lg rounded-md p-2 border text-xs">
              {Object.entries(errors).map(([key, error]) => (
                <div key={key} className="text-red-600 mb-1">{error}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative">
        {/* Order Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Order Number</label>
            <input
              type="text"
              value={orderDetails.orderNumber}
              readOnly
              className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={orderDetails.customerName}
              onChange={(e) => handleCustomerSearch(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm"
              placeholder="Enter customer name..."
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
            <div className="relative flex gap-2 items-start">
              <input
                type="tel"
                value={orderDetails.customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === 'Tab' || e.key === 'Enter') && orderDetails.customerPhone.length === 10) {
                    e.preventDefault();
                    const phoneExists = customers.some(customer => {
                      const customerPhone = (customer.phone || customer.phoneNo || '').replace(/\D/g, '');
                      return customerPhone === orderDetails.customerPhone;
                    });
                    if (!phoneExists) {
                      setShowCustomerSuggestions(false);
                      setShowAddCustomerModal(true);
                    }
                  }
                }}
                className={`w-full rounded-md ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 h-[38px]`}
                placeholder="Enter phone number..."
              />
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="inline-flex items-center px-3 h-[38px] border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
              >
                Add Customer
              </button>
              {showCustomerSuggestions && filteredCustomers.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                  <div className="p-2 bg-gray-50 border-b text-sm font-medium text-gray-700">
                    {filteredCustomers.length} matching customer{filteredCustomers.length !== 1 ? 's' : ''} found
                  </div>
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{formatPhoneNumber(customer.phone || customer.phoneNo || '')}</div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectCustomer(customer);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Select
                        </button>
                      </div>
                      {customer.address && (
                        <div className="mt-1 text-xs text-gray-500">{customer.address}</div>
                      )}
                    </div>
                  ))}
                  <div className="p-2 bg-gray-50 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCustomerModal(true);
                        setShowCustomerSuggestions(false);
                      }}
                      className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      + Create New Customer
                    </button>
                  </div>
                </div>
              )}
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Order Date</label>
            <input
              type="date"
              value={orderDetails.orderDate}
              onChange={(e) => updateOrderDetails('orderDate', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm"
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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={orderDetails.paymentMethod}
              onChange={(e) => updateOrderDetails('paymentMethod', e.target.value as any)}
              className="w-full rounded-md border-gray-300 shadow-sm text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col gap-2 p-3 border rounded-md mb-2">
                <div className="flex items-center space-x-4 mb-2">
                  <button
                    onClick={() => {
                      const newItem = createEmptyItem('frame', item.id);
                      setItems(items.map(i => i.id === item.id ? newItem : i));
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1 ${
                      item.type === 'frame' 
                        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Square3Stack3DIcon className="h-4 w-4" />
                    Frame
                  </button>
                  <button
                    onClick={() => {
                      const newItem = createEmptyItem('lens', item.id);
                      setItems(items.map(i => i.id === item.id ? newItem : i));
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1 ${
                      item.type === 'lens'
                        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <EyeIcon className="h-4 w-4" />
                    Lens
                  </button>
                  <button
                    onClick={() => {
                      const newItem = createEmptyItem('contact-lens', item.id);
                      setItems(items.map(i => i.id === item.id ? newItem : i));
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1 ${
                      item.type === 'contact-lens'
                        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CircleStackIcon className="h-4 w-4" />
                    Contact Lens
                  </button>
                  <button
                    onClick={() => {
                      const newItem = createEmptyItem('accessory', item.id);
                      setItems(items.map(i => i.id === item.id ? newItem : i));
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1 ${
                      item.type === 'accessory'
                        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingBagIcon className="h-4 w-4" />
                    Accessory
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    {item.type === 'frame' && <SaleFrameItem item={item} index={index} showDetails={showDetails[item.id]} onUpdateItem={updateItem} onToggleDetails={toggleDetails} />}
                    {item.type === 'lens' && <SaleLensItem item={item} index={index} showDetails={showDetails[item.id]} onUpdateItem={updateItem} onToggleDetails={toggleDetails} />}
                    {item.type === 'contact-lens' && <SaleContactLensItem item={item} index={index} showDetails={showDetails[item.id]} onUpdateItem={updateItem} onToggleDetails={toggleDetails} />}
                    {item.type === 'accessory' && <SaleAccessoryItem item={item} index={index} showDetails={showDetails[item.id]} onUpdateItem={updateItem} onToggleDetails={toggleDetails} />}
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="ml-2 text-red-500 hover:text-red-700">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMoreItems}
            className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Item
          </button>
        </div>

        {/* Fixed Footer with Payment Details and Summary */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <div className="flex flex-wrap items-center gap-4">
                {/* Left side - Payment Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-700">Discount Type:</div>
                    <select
                      value={orderDetails.discountType}
                      onChange={(e) => updateOrderDetails('discountType', e.target.value as any)}
                      className="w-40 rounded-md border-gray-300 shadow-sm text-sm"
                    >
                      <option value="percentage">Discount in %</option>
                      <option value="amount">Discount in Rupees</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={orderDetails.discount}
                      onChange={(e) => updateOrderDetails('discount', e.target.value)}
                      className="w-24 rounded-md border-gray-300 shadow-sm text-sm"
                      placeholder="Enter discount"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-700">Advance:</div>
                    <input
                      type="number"
                      min="0"
                      value={orderDetails.paidAmount}
                      onChange={(e) => updateOrderDetails('paidAmount', e.target.value)}
                      placeholder="Enter advance"
                      className="w-32 rounded-md border-gray-300 shadow-sm text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-700">Status:</div>
                    <select
                      value={orderDetails.paymentStatus}
                      onChange={(e) => updateOrderDetails('paymentStatus', e.target.value as any)}
                      className="w-40 rounded-md border-gray-300 shadow-sm text-sm"
                    >
                      <option value="pending">Payment Pending</option>
                      <option value="partial">Partial Payment</option>
                      <option value="completed">Full Payment Done</option>
                    </select>
                  </div>
                </div>

                {/* Right side - Totals */}
                {(() => {
                  const totals = calculateTotals();
                  return (
                    <div className="flex items-center gap-4 ml-auto text-sm">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        <div className="text-gray-600">Bill Amount:</div>
                        <div className="font-medium">₹{totals.subtotal.toFixed(2)}</div>
                        
                        <div className="text-gray-600">Discount:</div>
                        <div className="text-green-600">- ₹{totals.discountAmount.toFixed(2)}</div>
                        
                        <div className="text-gray-600">Net Amount:</div>
                        <div className="font-medium">₹{totals.total.toFixed(2)}</div>
                        
                        <div className="text-gray-600">Advance Paid:</div>
                        <div className="text-blue-600">₹{orderDetails.paidAmount || '0.00'}</div>
                        
                        <div className="text-gray-600 font-medium">Balance Due:</div>
                        <div className="font-bold text-red-600">₹{totals.balance.toFixed(2)}</div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-8 inline-flex justify-center items-center px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Creating Bill...' : 'Generate Bill'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </form>
      {showAddCustomerModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
            <AddCustomer 
              isModal={true}
              initialData={{
                name: orderDetails.customerName,
                phone: orderDetails.customerPhone
              }}
              onSuccess={handleCustomerCreated}
              onCancel={() => setShowAddCustomerModal(false)}
            />
          </div>
        </div>
      )}
      {/* Import Patient Modal */}
      {showImportPatientModal && (
        <div className="z-[65]">
          <ImportPatient
            onSelect={handlePatientImport}
            onClose={() => setShowImportPatientModal(false)}
          />
        </div>
      )}
    </div>
  );
} 