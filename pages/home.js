import ReactPaginate from "react-paginate";
import {
  collection, getDocs, query, where, deleteDoc, doc
} from "firebase/firestore";
import Router from "next/router";
import { useState, useEffect, Fragment, useRef } from "react";
import { db } from "../components/firebase-config";
import { useAuth } from "../context/auth-context";
import Courier from "./components/courier";
import EstimatedDate from "./components/datechange";
import StatusDrop from "./components/status_dropdown";
import { storage } from "../components/firebase-config";
import { getAuth } from "firebase/auth";
import VendorSelect from "./components/partner";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
export const data = db;
export const store = storage;

const auth = getAuth();

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  timeStr = timeStr.replace(/-/g, ':'); // replace hyphens with colons
  const parts = timeStr.split(":");
  if(parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if(hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
};

export default function Orders() {
  const { user, logout } = useAuth();

  function sendProps(currorder, userid, prod, assign, type) {
    Router.push({
      pathname: "pages/odetails",
      query: {
        currorder,
        userid,
        prod,
        assign,
        type,
      },
    });
  }

  const [orders, setOrders] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemOffset, setItemOffset] = useState(() => {
    // Initialize from localStorage if available
    const savedOffset = localStorage.getItem('scrollOffset');
    return savedOffset ? parseInt(savedOffset) : 0;
  });

  // Initialize search states from localStorage
  const [idsearch, setIds] = useState(() => localStorage.getItem('idsearch') || "");
  const [namesearch, setName] = useState(() => localStorage.getItem('namesearch') || "");
  const [statsearch, setStats] = useState(() => localStorage.getItem('statsearch') || "");
  const [date1, setDate1] = useState(() => localStorage.getItem('date1') || "");
  const [date1f, setDate1f] = useState(() => localStorage.getItem('date1f') || "");
  const [date2, setDate2] = useState(() => localStorage.getItem('date2') || "");
  const current = new Date();
  const [dist, setDist] = useState([]);
  const cancelButtonRef = useRef(null);

  const [show, setShow] = useState(true);
  var exc;

  const [date2f, setDate2f] = useState(() => localStorage.getItem('date2f') || `${current.getDate()}-${current.getMonth() + 1}-${current.getFullYear()}`);

  useEffect(() => {
    const collref = collection(db, "orders");
    const getOrders = async () => {
      const data = await getDocs(collref);
      const ordersData = data.docs.reverse().map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setOrders(ordersData);
      localStorage.setItem('ods', JSON.stringify(ordersData));
    };
    getOrders();

    const collref2 = collection(data, "retailers");
    const getOrders2 = async () => {
      const data = await getDocs(collref2);
      setDist(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getOrders2();

    // Cleanup function to clear localStorage when component unmounts
    return () => {
      localStorage.removeItem('ods');
    };
  }, []);

  async function exportxl() {
    const array = [];
    Object.keys(orders).forEach((key) => {
      const value = orders[key];
      array.push({
        "GSTIN/UIN of Recipient": orders[key]["gst"],
        "Receiver Name": orders[key]["username"],
        "Invoice Number": orders[key]["id"],
        "Invoice date": orders[key]["date"],
        "Invoice Value": orders[key]["price"],
        "Place Of Supply": "29-Karnataka",
        "Reverse Charge": "N",
        "Applicable % of Tax Rate": "12%",
        "Invoice Type": "Regular B2B",
        "E-Commerce GSTIN": "29ABGFR3699R1ZX",
        Rate: Math.round((parseFloat(orders[key]["price"]) * 100) / 1.12) / 100,
        "Taxable Value":
          Math.round((parseFloat(orders[key]["price"]) * 100) / 1.12) / 100,
        "Cess Amount":
          Math.round(
            (parseFloat(orders[key]["price"]) -
              parseFloat(orders[key]["price"]) / 1.12) *
            100
          ) / 100,
      });
    });
    function convertToCSV(arr) {
      const array1 = [Object.keys(arr[0])].concat(arr);

      return array1
        .map((it) => {
          return Object.values(it).toString();
        })
        .join("\n");
    }
    const download = (data, fileName) => {
      const blob = new Blob([data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", fileName + ".csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    download(convertToCSV(array), "Gst Export " + Date());
  }

  async function search() {
    const collref = collection(db, "orders");
    const getOrders = async () => {
      const data = await getDocs(collref);
      let filteredOrders = data.docs.reverse().map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Apply ID filter
      if (idsearch) {
        filteredOrders = filteredOrders.filter(order => order.id === parseInt(idsearch));
      }

      // Apply name filter
      if (namesearch) {
        filteredOrders = filteredOrders.filter(order => 
          order.username.toLowerCase().includes(namesearch.toLowerCase())
        );
      }

      // Apply status filter
      if (statsearch) {
        filteredOrders = filteredOrders.filter(order => order.status === statsearch);
      }

      // Apply date filters
      if (date1 && date2) {
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.date.split('-').reverse().join('-'));
          const startDate = new Date(date1.split('-').reverse().join('-'));
          const endDate = new Date(date2.split('-').reverse().join('-'));
          return orderDate >= startDate && orderDate <= endDate;
        });
      } else if (date1) {
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.date.split('-').reverse().join('-'));
          const startDate = new Date(date1.split('-').reverse().join('-'));
          return orderDate >= startDate;
        });
      } else if (date2) {
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.date.split('-').reverse().join('-'));
          const endDate = new Date(date2.split('-').reverse().join('-'));
          return orderDate <= endDate;
        });
      }

      setOrders(filteredOrders);
      localStorage.setItem('ods', JSON.stringify(filteredOrders));
    };

    getOrders();
  }

  async function clrsearch() {
    setIds("");
    setName("");
    setStats("");
    setDate1("");
    setDate2("");
    setDate2f("");
    setDate1f("");
    setItemOffset(0);
    
    // Clear localStorage
    localStorage.removeItem('idsearch');
    localStorage.removeItem('namesearch');
    localStorage.removeItem('statsearch');
    localStorage.removeItem('date1');
    localStorage.removeItem('date1f');
    localStorage.removeItem('date2');
    localStorage.removeItem('date2f');
    localStorage.removeItem('scrollOffset');
    localStorage.setItem('ods', null);

    const collref = collection(db, "orders");
    const getOrders = async () => {
      const data = await getDocs(collref);
      setOrders(
        data.docs.reverse().map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getOrders();
  }

  function Items({ currentItems }) {
    return (
      <>
        {currentItems &&
          currentItems.map((order) => (
            <tr
              key={order.id}
              className="bg-white border-b  transition duration-300 ease-in-out hover:bg-gray-100"
            >
              <td className="text-sm cursor-pointer  font-bold text-gray-900  px-3  py-3 whitespace-nowrap">
                <a
                  className="rounded-md border border-transparent bg-indigo-600 px-5 py-1 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-30 md:text-lg"
                  onClick={() => {
                    sendProps(
                      order.id,
                      order.phone,
                      order.prodid,
                      order.assign,
                      order.type
                    );
                  }}
                >
                  {order.id}
                </a>
              </td>
              <td className="text-sm text-gray-900 font-light px-3 py-3 whitespace-nowrap">
                <span className="text-lg font-medium">{order.username}</span>{" "}
                <br />
                {order.dvt && <span>({order.dvt})</span>}
              </td>
              <td className="text-sm text-gray-900 font-light px-3 py-3 whitespace-nowrap">
                {order.date} <br /> {formatTime(order.time)}
              </td>
              <td className="text-sm text-gray-900 font-light px-3 py-3 whitespace-nowrap">
                <StatusDrop
                  price={order.total}
                  phone={order.phone}
                  discount={order.discount}
                  odid={order.id}
                  status={order.status}
                  name={order.username}
                />
              </td>
              <td className="text-sm text-gray-900 font-light px-3 py-3 whitespace-nowrap">
                {Number(order.price).toFixed(2)} ₹
              </td>
              <td className="text-sm text-gray-900 font-light px-3 py-3 whitespace-nowrap">
                {(Number(order.total) - Number(order.price)).toFixed(2)} ₹
              </td>
              <td className="text-sm text-gray-900 font-light  py-3 whitespace-nowrap">
                <EstimatedDate date={order.ed} odid={order.id} />
              </td>
              <td className="text-sm text-gray-900 font-light px-3 py-3 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Add WhatsApp message functionality
                      const message = `Dear Customer, your order #${order.id} is ready for delivery. Thank you for choosing our service!`;
                      const whatsappUrl = `https://wa.me/${order.phone}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this order?')) {
                        deleteOrder(order.id);
                      }
                    }}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
      </>
    );
  }
  const handlePageClick = (event) => {
    const newOffset = (event.selected * 50) % orders.length;
    setItemOffset(newOffset);
    localStorage.setItem('scrollOffset', newOffset.toString());
  };
  const endOffset = itemOffset + 50;
  console.log(`Loading items from ${itemOffset} to ${endOffset}`);
  const pageCount = Math.ceil(orders.length / 50);

  function PaginatedItems() {
    const currentItems = orders.slice(itemOffset, endOffset);

    // Invoke when user click to request another page.

    return (
      <>
        <Items currentItems={currentItems} />
      </>
    );
  }

  // Modify search state setters to persist values
  const updateIds = (value) => {
    setIds(value);
    localStorage.setItem('idsearch', value);
  };

  const updateName = (value) => {
    setName(value);
    localStorage.setItem('namesearch', value);
  };

  const updateStats = (value) => {
    setStats(value);
    localStorage.setItem('statsearch', value);
  };

  const updateDate1 = (value) => {
    setDate1(value);
    localStorage.setItem('date1', value);
  };

  const updateDate1f = (value) => {
    setDate1f(value);
    localStorage.setItem('date1f', value);
  };

  const updateDate2 = (value) => {
    setDate2(value);
    localStorage.setItem('date2', value);
  };

  const updateDate2f = (value) => {
    setDate2f(value);
    localStorage.setItem('date2f', value);
  };

  const deleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, "orders", orderId.toString()));
      // Update the orders state to remove the deleted order
      setOrders(orders.filter(order => order.id !== orderId));
      alert("Order deleted successfully!");
    } catch (error) {
      console.error("Error deleting order: ", error);
      alert("Error deleting order. Please try again.");
    }
  };

  return (
    <>
      {user && (
        <div>
          <header className="bg-white shadow mb-4">
            <div className="mx-auto px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-4">
                <Link
                  href="/pages/create-sale-order"
                  className="rounded-md border border-transparent bg-indigo-600 px-5 py-1 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-30 md:text-lg"
                >
                  + Add Order
                </Link>
                <div className="flex gap-3">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://docs.google.com/spreadsheets/d/1ETTanrh-LveXVu1hHXbNScj9MBLWBnwywLAcIoEyONA/edit#gid=0"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Excel Generation
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                {/* ID Search */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Search</label>
                  <input
                    type="text"
                    value={idsearch}
                    onChange={(e) => updateIds(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter ID..."
                  />
                </div>

                {/* Name Filter */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={namesearch}
                      onChange={(e) => {
                        const searchValue = e.target.value;
                        updateName(searchValue);
                        const filtered = dist.filter(item =>
                          item.name.toLowerCase().includes(searchValue.toLowerCase())
                        );
                        setFilteredItems(filtered);
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Search names..."
                    />
                    {namesearch && filteredItems && filteredItems.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredItems.map((dis) => (
                          <div
                            key={dis.id}
                            onClick={() => {
                              updateName(dis.name);
                              setFilteredItems([]);
                            }}
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            {dis.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                  <Menu as="div" className="relative w-full">
                    <Menu.Button className="w-full inline-flex justify-between items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                      {statsearch || 'Select Status'}
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {['Pending', 'Received', 'Processed', 'Dispatched', 'Delivered', 'Declined', 'Cancelled'].map((status) => (
                          <Menu.Item key={status}>
                            {({ active }) => (
                              <a
                                href="#"
                                onClick={() => updateStats(status)}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {status}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                {/* Date Filters */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={date1f}
                    onChange={(e) => {
                      updateDate1f(e.target.value);
                      const dateParts = e.target.value.split("-");
                      dateParts.reverse();
                      updateDate1(dateParts.join("-"));
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={date2f}
                    onChange={(e) => {
                      updateDate2f(e.target.value);
                      const dateParts = e.target.value.split("-");
                      dateParts.reverse();
                      updateDate2(dateParts.join("-"));
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-3">
                <button
                  onClick={search}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Search 🔎
                </button>
                <button
                  onClick={clrsearch}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Search
                </button>
                <button
                  onClick={() => setShow(false)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  PDF Export
                </button>
              </div>
            </div>
          </header>
          <main>
            <div
              className={`mx-auto  py-6 sm:px-3 lg:px-8 ${show ? "block" : "hidden"
                }`}
            >
              <div className="flex flex-col">
                <div className="overflow-x-auto overflow-y-hidden min-h-max sm:-mx-6 lg:-mx-8">
                  <div className="py-2 inline-block min-w-full sm:px-3 lg:px-8">
                    <div className="mb-20">
                      <table className="min-w-full">
                        <thead className="bg-white border-b">
                          <tr>
                            <th
                              scope="col"
                              className="text-sm font-medium text-gray-900 px-3 py-4 text-left"
                            >
                              Order ID
                            </th>
                            <th
                              scope="col"
                              className="text-sm font-medium text-gray-900 px-3 py-4 text-left"
                            >
                              Optical Name
                            </th>
                            <th
                              scope="col"
                              className="text-sm font-medium text-gray-900 px-3 py-4 text-left"
                            >
                              Date / Time
                            </th>
                            <th
                              scope="col"
                              className="text-sm font-medium text-gray-900 px-3 py-4 text-left"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="text-sm font-medium text-gray-900 px-3 py-4 text-left"
                            >
                              Value
                            </th>
                            <th
                              scope="col"
                              className="text-sm font-medium text-gray-900 px-3 py-4 text-left"
                            >
                              Balance
                            </th>
                            <th
                              scope="col"
                              className="text-sm font-medium text-gray-900 px-3 py-4 text-left"
                            >
                              Expected date of Delivery
                            </th>
                            <th
                              scope="col"
                              className="text-sm font-medium text-gray-900 px-3 py-4 text-left"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <PaginatedItems />
                        </tbody>
                      </table>
                      
                      <div className="mt-4 mb-16">
                        <ReactPaginate
                          breakLabel="..."
                          breakClassName="page-item"
                          breakLinkClassName="page-link"
                          containerClassName="pagination flex justify-center items-center gap-2"
                          pageClassName="page-item rounded-md border border-gray-300"
                          pageLinkClassName="page-link px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 block"
                          previousClassName="page-item rounded-md border border-gray-300"
                          previousLinkClassName="page-link px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 block"
                          nextClassName="page-item rounded-md border border-gray-300"
                          nextLinkClassName="page-link px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 block"
                          activeClassName="!bg-indigo-600 !text-white border-indigo-600"
                          nextLabel=">"
                          onPageChange={handlePageClick}
                          pageRangeDisplayed={5}
                          pageCount={pageCount}
                          previousLabel="<"
                          renderOnZeroPageCount={null}
                        />
                      </div>

                      <div className="fixed bottom-0 left-0 right-0 text-center text-sm text-gray-600 py-3 border-t bg-white shadow-md">
                        Reflexoptics © 2025 • For any Query call <a href="tel:+916361773719" className="text-blue-600 hover:underline">+91 6361773719</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={` flex-col lg:flex-row grid list-none bg-white px-4 pb-4  sm:p-6 sm:pb-4 col-span-12 ${!show ? "block" : "hidden"
                }`}
            >
              <div className="bg-gray-50 no-print mx-auto px-4 py-3  sm:px-6">
                <button
                  type="button"
                  className="inline-flex no-print w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                  onClick={() => print()}
                >
                  Print
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => setShow(true)}
                  ref={cancelButtonRef}
                >
                  Cancel
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <div className="">
                    <div class="max-w-5xl mx-auto py-5 px-5  h-screen mb-80 bg-white">
                      <article class=" border border-black border-1">
                        <div>
                          <div className="font-bold text-center border-b border-black border-1 grid grid-cols-3 justify-center">
                            <div className="justify-left flex p-3"></div>
                            <div className="font-bold">
                              Order History
                              <br />
                              <h1 className="text-2xl col-span-3 pt-2">
                                Demo
                              </h1>
                              <h1 className="col-span-3 font-semibold pt-2">
                                No. 26/2, Old No. 34. Kilari Road,
                                R.T. Street, Bengaluru 560 053
                              </h1>
                              <h1 className="col-span-3 font-semibold pb-2">
                                +916364267806
                              </h1>
                            </div>{" "}
                          </div>

                          <table className="min-w-full text-center py-5 table border-collapse border-t border-1 border-black">
                            <thead>
                              <tr>
                                <th>SN.</th>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Inv No.</th>
                                <th>Brand</th>
                                <th>Total Amount</th>
                              </tr>
                            </thead>{" "}
                            <tbody className="text-lg font-medium">
                              {orders.map((det, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="font-bold">
                                      {det.username}
                                    </td>
                                    <td>{det.date}</td>
                                    <td>{det.id}</td>
                                    <td>{det.brand}</td>
                                    <td className="font-bold">
                                      {Math.round(parseFloat(det.total) * 100) /
                                        100}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
