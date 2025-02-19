import { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";
import { db } from "../../components/firebase-config";

export default function Details() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [showPrescriptionOnly, setShowPrescriptionOnly] = useState(false);
  const [showBillOnly, setShowBillOnly] = useState(false);
  const [printMode, setPrintMode] = useState('none'); // 'none', 'prescription', 'order', 'bill'
  const {
    query: { currorder, userid, prod, assign, type },
  } = router;

  const id = currorder ? parseInt(currorder) : null;
  const usid = userid ? userid.toString() : "";
  const [Users, setUsers] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !usid) return;

      try {
        // Fetch order details
        const ordersRef = collection(db, "orders");
        const orderQuery = query(ordersRef, where("id", "==", id));
        const orderSnapshot = await getDocs(orderQuery);
        const orderData = orderSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setOrders(orderData);

        // Fetch user/retailer details
        const retailersRef = collection(db, "retailers");
        const retailerQuery = query(retailersRef, where("phoneNo", "==", usid));
        const retailerSnapshot = await getDocs(retailerQuery);
        const retailerData = retailerSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setUsers(retailerData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id, usid]);

  useEffect(() => {
    const fetchAndUpdateVendor = async () => {
      if (!orders.length) return;
      
      try {
        let vendorId = null;
        const currentOrder = orders[0];

        // First check if vendor was assigned from home page
        if (assign) {
          vendorId = assign;
          // Update order document to maintain consistency
          const orderRef = doc(db, "orders", currentOrder.id);
          await updateDoc(orderRef, {
            vendorId: assign,
            assign: assign
          });
          console.log('Order updated with vendor from home page:', assign);
        } 
        // If no assign parameter, use vendorId from order
        else if (currentOrder.vendorId) {
          vendorId = currentOrder.vendorId;
        }

        // Fetch vendor details if we have a vendorId
        if (vendorId) {
          const vendorDoc = await getDoc(doc(db, 'distributors', vendorId));
          if (vendorDoc.exists()) {
            const vendorData = { ...vendorDoc.data(), id: vendorDoc.id };
            setVendor(vendorData);
            setSelectedVendorId(vendorId); // Set the dropdown to show current vendor
            console.log('Vendor data fetched:', vendorData);
          }
        }
      } catch (error) {
        console.error('Error in fetchAndUpdateVendor:', error);
      }
    };

    fetchAndUpdateVendor();
  }, [orders, assign]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorsRef = collection(db, "distributors");
        const vendorsSnapshot = await getDocs(vendorsRef);
        const vendorsData = vendorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVendorsList(vendorsData);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  const sendInstruction = (order) => {
    let instructionURL = '';
    if (order.type === 'Lens') {
      instructionURL = 'https://example.com/instructions/lens.pdf';
    } else if (order.type === 'Contact') {
      instructionURL = 'https://example.com/instructions/contact.pdf';
    } else if (order.type === 'Spectacle') {
      instructionURL = 'https://example.com/instructions/spectacle.pdf';
    }
    if (vendor && vendor.phoneNo) {
      let phoneNumber = vendor.phoneNo;
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = phoneNumber.replace(/^0+/, '');
        if (!phoneNumber.startsWith('91')) {
          phoneNumber = '91' + phoneNumber;
        }
      } else {
        phoneNumber = phoneNumber.replace('+', '').replace(/^0+/, '');
      }
      const message = encodeURIComponent(`Dear ${vendor.name}, please find the fitting instructions here: ${instructionURL}`);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Vendor phone details are not available.');
    }
  };

  const renderPrescriptionDetails = (order) => {
    if (!order.type || (order.type !== "Lens" && order.type !== "Contact")) return null;
    
    return (
      <div className={`${showPrescriptionOnly ? 'print-only' : ''} mt-4 bg-white rounded-lg shadow-sm p-4`}>
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Prescription Details</h2>
          <p className="text-lg text-gray-600 mt-1">Order ID: {order.id}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Left Section - Brand and Additional Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Product Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Brand:</span>
                  <span className="ml-2 font-bold">{order.brand}</span>
                </div>
                {order.type === "Lens" && (
                  <>
                    <div>
                      <span className="text-gray-600">Material:</span>
                      <span className="ml-2 font-bold">{order.material}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Index:</span>
                      <span className="ml-2 font-bold">{order.index}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Lens Type:</span>
                      <span className="ml-2 font-bold">{order.lensType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Base Tint:</span>
                      <span className="ml-2 font-bold">{order.baseTint}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Coating:</span>
                      <span className="ml-2 font-bold">{order.coatingType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Diameter:</span>
                      <span className="ml-2 font-bold">{order.dia}</span>
                    </div>
                  </>
                )}
                {order.type === "Contact" && (
                  <>
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <span className="ml-2 font-bold">{order.company}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Modality:</span>
                      <span className="ml-2 font-bold">{order.modality}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pack Size:</span>
                      <span className="ml-2 font-bold">{order.pack}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Contact Type:</span>
                      <span className="ml-2 font-bold">{order.ctype}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Color:</span>
                      <span className="ml-2 font-bold">{order.col}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Power Type:</span>
                      <span className="ml-2 font-bold">{order.powertype}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Additional Features</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Fog Free:</span>
                  <span className="ml-2 font-bold">{order.fog ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cleaning Solution:</span>
                  <span className="ml-2 font-bold">{order.clean ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Auth. Card:</span>
                  <span className="ml-2 font-bold">{order.card ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Delivery Channel:</span>
                  <span className="ml-2 font-bold">{order.channel ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Prescription Table */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Power Details</h3>
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 text-left text-sm font-medium text-gray-500">Eye</th>
                  <th className="border px-3 py-2 text-left text-sm font-medium text-gray-500">Sph</th>
                  <th className="border px-3 py-2 text-left text-sm font-medium text-gray-500">Cyl</th>
                  <th className="border px-3 py-2 text-left text-sm font-medium text-gray-500">Axis</th>
                  <th className="border px-3 py-2 text-left text-sm font-medium text-gray-500">Add</th>
                  <th className="border px-3 py-2 text-left text-sm font-medium text-gray-500">PD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2 text-base font-medium">OD</td>
                  <td className="border px-3 py-2 text-base font-bold">{parseFloat(order.sph_1) > 0 ? "+" : ""}{order.sph_1}</td>
                  <td className="border px-3 py-2 text-base font-bold">{parseFloat(order.cyl_1) > 0 ? "+" : ""}{order.cyl_1}</td>
                  <td className="border px-3 py-2 text-base font-bold">{order.axis_1}</td>
                  <td className="border px-3 py-2 text-base font-bold">{parseFloat(order.add_1) > 0 ? "+" : ""}{order.add_1}</td>
                  <td className="border px-3 py-2 text-base font-bold">{order.pd_1 || "-"}</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2 text-base font-medium">OS</td>
                  <td className="border px-3 py-2 text-base font-bold">{parseFloat(order.sph_2) > 0 ? "+" : ""}{order.sph_2}</td>
                  <td className="border px-3 py-2 text-base font-bold">{parseFloat(order.cyl_2) > 0 ? "+" : ""}{order.cyl_2}</td>
                  <td className="border px-3 py-2 text-base font-bold">{order.axis_2}</td>
                  <td className="border px-3 py-2 text-base font-bold">{parseFloat(order.add_2) > 0 ? "+" : ""}{order.add_2}</td>
                  <td className="border px-3 py-2 text-base font-bold">{order.pd_2 || "-"}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Reference IDs</h4>
                {order.refid_1 && (
                  <div className="text-sm">
                    <span className="text-gray-600">OD:</span>
                    <span className="ml-2 font-medium">{order.refid_1}</span>
                  </div>
                )}
                {order.refid_2 && (
                  <div className="text-sm">
                    <span className="text-gray-600">OS:</span>
                    <span className="ml-2 font-medium">{order.refid_2}</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Quantity</h4>
                <div className="text-sm">
                  <span className="text-gray-600">OD:</span>
                  <span className="ml-2 font-medium">{order.no_1} Pc</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">OS:</span>
                  <span className="ml-2 font-medium">{order.no_2} Pc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderDetails = (order) => {
    return (
      <div className="space-y-4">
        {/* Order Information */}
        <div className="bg-blue-50 rounded-lg shadow-sm p-4">
          <h3 className="text-2xl font-bold text-blue-900 mb-3">Order Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-base text-blue-600">Order ID</span>
              <p className="mt-1 text-lg font-bold text-blue-900">{order.id}</p>
            </div>
            <div>
              <span className="text-base text-blue-600">Order Type</span>
              <p className="mt-1 text-lg font-bold text-blue-900">{order.type}</p>
            </div>
            <div>
              <span className="text-base text-blue-600">Order Date</span>
              <p className="mt-1 text-lg font-bold text-blue-900">{order.date}</p>
            </div>
            <div>
              <span className="text-base text-blue-600">Status</span>
              <p className="mt-1 text-lg font-bold text-blue-900">{order.status}</p>
            </div>
          </div>
        </div>

        {/* Product and Price Details in Two Columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column - Product Details */}
          <div className="bg-green-50 rounded-lg shadow-sm p-4">
            <h3 className="text-2xl font-bold text-green-900 mb-3">Product Details</h3>
            <div className="space-y-3">
              {order.brand && (
                <div>
                  <span className="text-base text-green-600">Brand</span>
                  <p className="mt-1 text-lg font-bold text-green-900">{order.brand}</p>
                </div>
              )}
              {order.type === "Frame" && (
                <>
                  {order.modelNumber && (
                    <div>
                      <span className="text-base text-green-600">Model Number</span>
                      <p className="mt-1 text-lg font-bold text-green-900">{order.modelNumber}</p>
                    </div>
                  )}
                  {order.size && (
                    <div>
                      <span className="text-base text-green-600">Size</span>
                      <p className="mt-1 text-lg font-bold text-green-900">{order.size}</p>
                    </div>
                  )}
                  {order.frameType && (
                    <div>
                      <span className="text-base text-green-600">Frame Type</span>
                      <p className="mt-1 text-lg font-bold text-green-900">{order.frameType}</p>
                    </div>
                  )}
                </>
              )}
              {(order.type === "Lens" || order.type === "Contact") && (
                <>
                  {order.material && (
                    <div>
                      <span className="text-base text-green-600">Material</span>
                      <p className="mt-1 text-lg font-bold text-green-900">{order.material}</p>
                    </div>
                  )}
                  {order.index && (
                    <div>
                      <span className="text-base text-green-600">Index</span>
                      <p className="mt-1 text-lg font-bold text-green-900">{order.index}</p>
                    </div>
                  )}
                  {order.lensType && (
                    <div>
                      <span className="text-base text-green-600">Lens Type</span>
                      <p className="mt-1 text-lg font-bold text-green-900">{order.lensType}</p>
                    </div>
                  )}
                  {order.baseTint && (
                    <div>
                      <span className="text-base text-green-600">Base Tint</span>
                      <p className="mt-1 text-lg font-bold text-green-900">{order.baseTint}</p>
                    </div>
                  )}
                  {order.coatingType && (
                    <div>
                      <span className="text-base text-green-600">Coating</span>
                      <p className="mt-1 text-lg font-bold text-green-900">{order.coatingType}</p>
                    </div>
                  )}
                </>
              )}
              {/* Additional Options */}
              {(order.type === "Lens" || order.type === "Contact") && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <h4 className="text-lg font-bold text-green-900 mb-2">Additional Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm text-green-600">Fog Free</span>
                      <p className="text-base font-bold text-green-900">{order.fog ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">Cleaning Solution</span>
                      <p className="text-base font-bold text-green-900">{order.clean ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">Auth. Card</span>
                      <p className="text-base font-bold text-green-900">{order.card ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">Delivery Channel</span>
                      <p className="text-base font-bold text-green-900">{order.channel ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Price Details */}
          <div className="bg-amber-50 rounded-lg shadow-sm p-4">
            <h3 className="text-2xl font-bold text-amber-900 mb-3">Price Details</h3>
            <div className="space-y-4">
              <div>
                <span className="text-base text-amber-600">Base Price</span>
                <p className="mt-1 text-lg font-bold text-amber-900">₹ {parseFloat(order.price).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-base text-amber-600">Discount</span>
                <p className="mt-1 text-lg font-bold text-amber-900">{order.discount}%</p>
                <p className="text-sm text-amber-600">
                  (- ₹ {((parseFloat(order.price) * parseFloat(order.discount)) / 100).toFixed(2)})
                </p>
              </div>
              <div>
                <span className="text-base text-amber-600">Courier Charges</span>
                <p className="mt-1 text-lg font-bold text-amber-900">₹ {parseFloat(order.courier).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-base text-amber-600">Extra Charges</span>
                <p className="mt-1 text-lg font-bold text-amber-900">₹ {parseFloat(order.extra).toFixed(2)}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-medium text-amber-900">Total Amount</span>
                  <span className="text-3xl font-bold text-amber-900">₹ {(
                    parseFloat(order.price) +
                    parseFloat(order.courier) +
                    parseFloat(order.extra) -
                    (parseFloat(order.price) * parseFloat(order.discount)) / 100
                  ).toFixed(2)}</span>
                </div>
              </div>

              {order.note && (
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <span className="text-base text-amber-600">Notes</span>
                  <p className="mt-1 text-base text-amber-900">{order.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerBill = (order, user) => {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Demo Optical</h1>
          <p className="text-gray-600">No. 26/2, Old No. 34. Kilari Road,</p>
          <p className="text-gray-600">R.T. Street, Bengaluru 560 053</p>
          <p className="text-gray-600">Phone: +91 6364267806</p>
        </div>

        <div className="border-t-2 border-b-2 border-gray-300 py-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Bill To:</span> {order.username}</p>
              {user && user.address && <p className="text-gray-600">{user.address}</p>}
              {user && user.phoneNo && <p className="text-gray-600">Phone: {user.phoneNo}</p>}
            </div>
            <div className="text-right">
              <p><span className="font-medium">Bill No:</span> {order.id}</p>
              <p><span className="font-medium">Date:</span> {order.date}</p>
              <p><span className="font-medium">Expected Delivery:</span> {order.ed}</p>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">
                <p className="font-medium">{order.type}</p>
                <p className="text-gray-600">Brand: {order.brand}</p>
                {order.type === "Frame" && order.modelNumber && (
                  <p className="text-gray-600">Model: {order.modelNumber}</p>
                )}
              </td>
              <td className="text-right py-2">₹ {parseFloat(order.price).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Price Breakdown */}
        <div className="border-t border-gray-300 pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>₹ {parseFloat(order.price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Discount ({order.discount}%):</span>
            <span>- ₹ {((parseFloat(order.price) * parseFloat(order.discount)) / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Courier Charges:</span>
            <span>₹ {parseFloat(order.courier).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Extra Charges:</span>
            <span>₹ {parseFloat(order.extra).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
            <span>Total Amount:</span>
            <span>₹ {(
              parseFloat(order.price) +
              parseFloat(order.courier) +
              parseFloat(order.extra) -
              (parseFloat(order.price) * parseFloat(order.discount)) / 100
            ).toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-600 text-sm">Terms & Conditions</p>
              <p className="text-gray-600 text-sm">* This is a computer generated bill</p>
            </div>
            <div className="text-center">
              <p className="mb-8">For Demo Optical</p>
              <p>Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const assignVendorToOrder = async (orderId, vendorId) => {
    if (!vendorId || !orderId) return;
    
    setIsAssigning(true);
    try {
      // Update order document with new vendor
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        vendorId: vendorId,
        assign: vendorId
      });
      
      // Fetch and update vendor details in state
      const vendorDoc = await getDoc(doc(db, 'distributors', vendorId));
      if (vendorDoc.exists()) {
        const vendorData = { ...vendorDoc.data(), id: vendorDoc.id };
        setVendor(vendorData);
        console.log('Vendor successfully assigned:', vendorData);
      }
    } catch (error) {
      console.error("Error assigning vendor:", error);
      alert("Failed to assign vendor. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow no-print">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <div className="flex gap-4">
              {orders.length > 0 && orders[0].type && (orders[0].type === 'Lens' || orders[0].type === 'Contact') && (
                <button
                  onClick={() => {
                    setPrintMode('prescription');
                    setTimeout(() => {
                      window.print();
                      setPrintMode('none');
                    }, 100);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Print Prescription
                </button>
              )}
              <button
                onClick={() => {
                  setPrintMode('order');
                  setTimeout(() => {
                    window.print();
                    setPrintMode('none');
                  }, 100);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Print Order
              </button>
              <button
                onClick={() => {
                  setPrintMode('bill');
                  setTimeout(() => {
                    window.print();
                    setPrintMode('none');
                  }, 100);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Print Customer Bill
              </button>
              {id && (
                <Link
                  href={{
                    pathname: './editorder',
                    query: { id }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Order
                </Link>
              )}
              {orders.length > 0 && vendor && (['Lens', 'Contact', 'Spectacle'].includes(orders[0].type)) && (
                <button
                  onClick={() => sendInstruction(orders[0])}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Send Fitting Instruction
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {orders.map((order) => (
          <div key={order.id}>
            {printMode === 'none' && (
              <div className="space-y-6">
                {renderOrderDetails(order)}
                {renderPrescriptionDetails(order)}
              </div>
            )}
            <div className={printMode === 'none' ? 'hidden' : ''}>
              {printMode === 'prescription' && renderPrescriptionDetails(order)}
              {printMode === 'order' && (
                <div className="space-y-6">
                  {renderOrderDetails(order)}
                  {renderPrescriptionDetails(order)}
                </div>
              )}
              {printMode === 'bill' && renderCustomerBill(order, Users[0])}
            </div>
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Vendor Details</h2>
              {vendor ? (
                <div className="space-y-4">
                  <div className="mt-4 space-y-2">
                    <p><span className="font-medium">Name:</span> {vendor.name}</p>
                    <p><span className="font-medium">Contact:</span> {vendor.phoneNo}</p>
                    <p><span className="font-medium">Email:</span> {vendor.email}</p>
                    {vendor.address && <p><span className="font-medium">Address:</span> {vendor.address}</p>}
                  </div>
                  <div className="mt-4">
                    <label htmlFor="change-vendor" className="block text-sm font-medium text-gray-700">
                      Change Vendor
                    </label>
                    <div className="mt-1 flex space-x-2">
                      <select
                        id="change-vendor"
                        value={selectedVendorId}
                        onChange={(e) => setSelectedVendorId(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Choose a new vendor</option>
                        {vendorsList.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} - {v.phoneNo}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => assignVendorToOrder(order.id, selectedVendorId)}
                        disabled={!selectedVendorId || isAssigning}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isAssigning ? 'Changing...' : 'Change'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="vendor-select" className="block text-sm font-medium text-gray-700">
                      Select Vendor
                    </label>
                    <select
                      id="vendor-select"
                      value={selectedVendorId}
                      onChange={(e) => setSelectedVendorId(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Choose a vendor</option>
                      {vendorsList.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} - {v.phoneNo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => assignVendorToOrder(order.id, selectedVendorId)}
                    disabled={!selectedVendorId || isAssigning}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? 'Assigning...' : 'Assign Vendor'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f8f9fa !important;
          }
          .shadow-sm {
            box-shadow: none !important;
          }
          .bg-blue-50, .bg-green-50, .bg-purple-50, .bg-amber-50, .bg-gray-50 {
            background-color: white !important;
          }
          .text-blue-600, .text-green-600, .text-purple-600, .text-amber-600 {
            color: #374151 !important;
          }
          .text-blue-900, .text-green-900, .text-purple-900, .text-amber-900 {
            color: #111827 !important;
          }
        }
      `}</style>
    </div>
  );
}
