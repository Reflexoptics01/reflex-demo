import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { data } from "../home";
import { useState, useEffect } from "react";

import { getAuth } from "firebase/auth";
import { Fragment, useRef } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { db } from "../../components/firebase-config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.css";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Ledgerd() {
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gst, setGst] = useState("");
  const [bal, setBal] = useState("");
  const [bal1, setBal1] = useState("0");
  const [startDate, setStartDate] = useState(new Date());
  const [retail, setRetail] = useState([]);
  const col="distledger";

  const [use, setUser] = useState("");
  const [bill, setBill] = useState("");
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const [currassign, setCurrassign] = useState("");

  const [dist, setDist] = useState([]);
  const [ledg, setLedg] = useState([]);

  useEffect(() => {
    const collref = collection(data, "distributors");
    const getOrders = async () => {
      const data = await getDocs(collref);
      setDist(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getOrders();
    const collref2 = collection(data, "distledger");
    const getOrders2 = async () => {
      const data = await getDocs(collref2);
      setLedg(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getOrders2();
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUser(user.email);
    } else {
      // No user is signed in.
    }
    async function billing() {

      const coll = collection(db, "distledger");
      const snapshot = await getCountFromServer(coll);

      const dd3 = snapshot.data().count + 100;

      setBill("P-" + dd3);
    }
    billing();

    const collref4 = collection(data, "distledger");
    const getRetail = async () => {
      const datas = await getDocs(collref4);
      setRetail(
        datas.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getRetail();
  }, []);

  



  async function setstatus(stat, id, gst, balance) {
    setCurrassign(stat);
    setName(stat);
    setPhone(id);
    setGst(gst);
    setBal(balance);
  }

  async function addOrder() {
    if (price != "" && name != "" && phone != "") {
      function formatDate(date) {
        var month = date.getMonth() + 1;
        var day = date.getDate();
        if (day < 10) day = "0" + day;
        if (month < 10) month = "0" + month;
        return day + "-" + month + "-" + date.getFullYear();
      }
      function formattime(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;
        var strTime = hours + ":" + minutes + ":" + seconds;
        return strTime;
      }
      const current = new Date();
      const date = formatDate(startDate);
      const time = formattime(current);
      const date1 = new Date(startDate);

      const timestamp = date1.getTime();

      const coll2 = collection(data, "log");
      const snapshot1 = await getCountFromServer(coll2);
      const ids = (snapshot1.data().count + 101).toString();
      await setDoc(doc(data, "log", ids), {
        change: "Added Dist. Ledger : " + price,
        user: use,
        payment_type: col,
        timestamp: Date.now()
      });
      var idd = "";
      const userreff = collection(db, "distributors");
      const q = query(userreff, where("phoneNo", "==", phone));
      const querySnapshot = await getDocs(q);
      const dd = querySnapshot.docs[0].data();

      querySnapshot.docs.slice(-1).forEach((doc) => {
        idd = doc.id.toString();
      });
      var temp = parseFloat(bal) + parseFloat(price);
      console.log(temp);

      await updateDoc(doc(data, "distributors", idd), {
        balance: temp.toString(),
      });
      const coll = collection(db, col);
      const snapshot = await getCountFromServer(coll);

      const dd3 = snapshot.data().count + 100;

      idd = "P-" + dd3;
      await setDoc(doc(data,"distledger", idd), {
        id: idd,
        phone: phone,
        username: name,
        date: date,
        type: "Payment",
        sign: "+",
        dat: startDate,
        timestamp: timestamp,
        balance: temp.toString(),
        amount: price,
        time: time,
      });
      
      setPrice("");
      window.location.reload();
    } else {
      setOpen(true);
    }
  }
  return (
    <div className="grid grid-cols-1 max-w-7xl mx-auto">
      <div className="pt-10 col-span-6 max-w-6xl sm:mt-0">
        <div className=" md:gap-6">
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form action="#" method="POST">
              <div className="overflow-hidden shadow min-h-96 sm:rounded-md">
                <div className="bg-white px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-9 text-xl gap-6">
                   
                    <div className="col-span-2 ">
                      <label
                        htmlFor="email-address"
                        className="block text-md font-medium text-gray-700"
                      >
                        Record Type
                      </label>
                      <div
                        type="number"
                        name="price"
                        id="price"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                      >
                        Distributor Ledger

                      </div>
                    </div>
                    <div className="col-span-2 ">
                      <label
                        htmlFor="email-address"
                        className="block text-md font-medium text-gray-700"
                      >
                        Bill No
                      </label>
                      <div
                        type="number"
                        name="price"
                        id="price"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                      >
                        {bill}

                      </div>
                    </div>
                    <div className="col-span-4  ">
                      <label
                        htmlFor="contact-no"
                        className="block text-md font-medium text-gray-700"
                      >
                        Particulars
                      </label>
                      <Menu
                        as="div"
                        className="relative mt-1 inline-block min-h-96 w-full text-left"
                      >
                        <div>
                          <Menu.Button className="inline-flex w-full z-100 justify-center  rounded-md border border-gray-300 bg-white px-4 py-2 text-md font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                            {currassign}
                            <ChevronDownIcon
                              className="-mr-1 ml-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          </Menu.Button>
                        </div>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute overflow-y-scroll right-0 mt-2 z-100 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1 z-20">
                              {dist.map((dis) => {
                                return (
                                  <Menu.Item key={dis.id}>
                                    {({ active }) => (
                                      <a
                                        href="#"
                                        onClick={() => {
                                          setstatus(
                                            dis.name,
                                            dis.phoneNo,
                                            dis.gst,
                                            dis.balance
                                          );
                                          setBal1(dis.balance);
                                        }}
                                        className={classNames(
                                          active
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-700",
                                          "block px-4 py-2 text-md z-10"
                                        )}
                                      >
                                        {dis.name}
                                      </a>
                                    )}
                                  </Menu.Item>
                                );
                              })}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                    <div className="col-span-2 ">
                      <label
                        htmlFor="email-address"
                        className="block text-md font-medium text-gray-700"
                      >
                        Balance
                      </label>
                      <div
                        type="number"
                        name="price"
                        id="price"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                      >
                        {bal1}

                      </div>
                    </div>
                    <div className="col-span-2 ">
                      <label
                        htmlFor="email-address"
                        className="block text-md font-medium text-gray-700"
                      >
                        Amount
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(value) => {
                          setPrice(value.target.value);
                        }}
                        name="price"
                        id="price"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                      />
                    </div>
                    <div className="col-span-3">

                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="email-address"
                        className="block text-md font-medium text-gray-700"
                      >
                        Date
                      </label>
                      <DatePicker
                        className="mt-1 block w-full z-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"

                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <a
                    type="submit"
                    onClick={() => {
                      addOrder();
                    }}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save
                  </a>
                  <Transition.Root show={open} as={Fragment}>
                    <Dialog
                      as="div"
                      className="relative z-10"
                      initialFocus={cancelButtonRef}
                      onClose={setOpen}
                    >
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100" 
                        leaveTo="opacity-0"
                      >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                      </Transition.Child>

                      <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                          >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex  sm:items-start">
                                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <ExclamationTriangleIcon
                                      className="h-6 w-6 text-indigo-600"
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <Dialog.Title
                                      as="h3"
                                      className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                      Complete the order
                                    </Dialog.Title>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                  type="button"
                                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-md"
                                  onClick={() => setOpen(false)}
                                >
                                  Go Back
                                </button>
                              </div>
                            </Dialog.Panel>
                          </Transition.Child>
                        </div>
                      </div>
                    </Dialog>
                  </Transition.Root>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <main className="w-full">
        <div className="mx-auto w-full py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <div className="overflow-x-auto min-h-screen sm:-mx-6 lg:-mx-8">
              <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                <div className=" grid grid-cols-1 justify-items-center">
                  <table className="min-w-full">
                    <thead className="bg-white border-b">
                      <tr>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Payment ID
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Name
                        </th>


                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {retail.map((retail) => {
                        return (
                          <tr
                            key={retail.id}
                            className="bg-white bretail-b transition duration-300 ease-in-out hover:bg-gray-100"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {retail.id}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              {retail.username}
                            </td>

                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              {retail.amount}
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <Transition.Root show={open} as={Fragment}>
                    <Dialog
                      as="div"
                      className="relative z-10"
                      initialFocus={cancelButtonRef}
                      onClose={setOpen}
                    >
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                      </Transition.Child>

                      <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                          >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex  sm:items-start">
                                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <ExclamationTriangleIcon
                                      className="h-6 w-6 text-indigo-600"
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <Dialog.Title
                                      as="h3"
                                      className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                      Fill the form completely
                                    </Dialog.Title>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                  type="button"
                                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                  onClick={() => setOpen(false)}
                                >
                                  Return to fill form
                                </button>
                              </div>
                            </Dialog.Panel>
                          </Transition.Child>
                        </div>
                      </div>
                    </Dialog>
                  </Transition.Root>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
