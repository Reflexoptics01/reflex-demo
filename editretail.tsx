import {
  collection,
  doc,
  getCountFromServer,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { data } from "../home";
import { useState ,useEffect} from "react";
import Router, { useRouter } from "next/router";
import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getAuth } from "firebase/auth";

export default function Editretailer() {
  const router = useRouter();

  const {
    query: {
      id,
      bname,
      pname,
      phoneNo,
      gst,
      email,
      balance,
      address,
      city,
      state,
    },
  } = router;
  const props = {
    id,
    bname,
    pname,
    phoneNo,
    gst,
    email,
    balance,
    address,
    city,
    state,
  };

  const [business, setBusiness] = useState(bname.toString());
  const [person, setPerson] = useState(pname.toString());
  const [number, setNumber] = useState(phoneNo.toString());
  const [tgst, setGst] = useState(gst.toString());
  const [temail, setEmail] = useState(email.toString());
  const [tbalance, setBalance] = useState(balance.toString());
  const [taddress, setAddress] = useState(address.toString());
  const [tcity, setCity] = useState(city.toString());
  const [tstate, setState] = useState(state.toString());
  const [open, setOpen] = useState(false);

  const cancelButtonRef = useRef(null);
  const [use,setUser]=useState("")

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUser(user.email)
    } else {
      // No user is signed in.
    }
  }, []);
  async function retailer() {
    console.log(business,person,number,gst,balance,address);
    if (
      business != "" &&
      person != "" &&
      number != "" &&
      tgst != "" &&
      tbalance != "" &&
      taddress != ""
    ) {
     
      await updateDoc(doc(data, "retailers", props.id.toString()), {
        name: business,
        pname: person,
        phoneNo: number,
        gst: tgst,
        balance: tbalance,
        address: taddress,
        city: tcity,
        state: tstate,
        email: temail,
      });

    const coll2 = collection(data, "log");
    const snapshot1 = await getCountFromServer(coll2);
    const ids = (snapshot1.data().count + 101).toString();
    await setDoc(doc(data, "log", ids), {
      change: "Edited retailer : "+ "name:" +business,
       user: use,
            timestamp:Date.now()
    });
      Router.push({
        pathname: "/pages/retail",
      });
    } else {
      setOpen(true);
    }
  }
  return (
    <div className="grid grid-cols-1 justify-items-center">
      <div className="col-span-6 sm:col-span-3">
        <div className="bg-white w-screen shadow">
          <div className="mx-auto max-w-4xl py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
              Edit Retail Users
            </h1>
          </div>
        </div>
      </div>
      <div className="pt-10   sm:mt-0">
        <div className=" md:gap-6">
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form action="#" method="POST">
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="bg-white px-4 py-5 sm:p-6">
                  <div className="grid  grid-cols-6 gap-6">
                    <div className="col-span-6  sm:col-span-3">
                      <label
                        htmlFor="business-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={business}
                        required
                        onChange={(value) => {
                          setBusiness(value.target.value);
                        }}
                        name="business-name"
                        id="businerss-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 w-96 sm:col-span-3">
                      <label
                        htmlFor="person-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Contact Person Name
                      </label>
                      <input
                        type="text"
                        value={person}
                        required
                        onChange={(value) => {
                          setPerson(value.target.value);
                        }}
                        name="person-name"
                        id="person-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="contact-no"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Contact Number
                      </label>
                      <input
                        type="text"
                        name="contact-no"
                        value={number}
                        required
                        onChange={(value) => {
                          setNumber(value.target.value);
                        }}
                        id="contact-no"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="gst-no"
                        className="block text-sm font-medium text-gray-700"
                      >
                        GST No.
                      </label>
                      <input
                        type="text"
                        value={tgst}
                        required
                        onChange={(value) => {
                          setGst(value.target.value);
                        }}
                        name="gst-no"
                        id="gst-no"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="email-id"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email ID
                      </label>
                      <input
                        type="text"
                        value={temail}
                        required
                        onChange={(value) => {
                          setEmail(value.target.value);
                        }}
                        name="email"
                        id="email-id"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="balance"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Opening Balance
                      </label>
                      <input
                        type="number"
                        value={tbalance}
                        required
                        onChange={(value) => {
                          setBalance(value.target.value);
                        }}
                        name="balance"
                        id="balance"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="email-address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Address
                      </label>
                      <input
                        type="text"
                        value={taddress}
                        required
                        onChange={(value) => {
                          setAddress(value.target.value);
                        }}
                        name="address"
                        id="address"
                        autoComplete="address"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="email-address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        value={tcity}
                        required
                        onChange={(value) => {
                          setCity(value.target.value);
                        }}
                        name="city"
                        id="city"
                        autoComplete="city"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="email-address"
                        className="block text-sm font-medium text-gray-700"
                      >
                       State
                      </label>
                      <input
                        type="text"
                        value={tstate}
                        required
                        onChange={(value) => {
                          setState(value.target.value);
                        }}
                        name="state"
                        id="state"
                        autoComplete="state"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                      
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <a
                    onClick={() => {
                      retailer();
                    }}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
