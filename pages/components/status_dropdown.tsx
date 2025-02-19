import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  addDoc,
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
import { db } from "../../components/firebase-config";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export default function StatusDrop(props) {
  var sets = props.status;
  const [currstat, setCurrstat] = useState(sets);
  const [color, setColor] = useState("");
  const [phone, setPhone] = useState(props.phone);

  useEffect(() => {
    if (props.status == "Received") {
      setColor("bg-lime-400");
    } else if (props.status == "Pending") {
      setColor("bg-yellow-500");
    } else if (props.status == "Processed") {
      setColor("bg-yellow-300");
    } else if (props.status == "Dispatched") {
      setColor("bg-blue-800");
    } else if (props.status == "Declined") {
      setColor("bg-red-800");
    } else if (props.status == "Cancelled") {
      setColor("bg-gray-600");
    } else if (props.status == "Delivered") {
      setColor("bg-green-600");
    }
  }, []);

  var odid;
  odid = props.odid;
  const [use, setUser] = useState("");
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUser(user.email);
    } else {
      // No user is signed in.
    }
  }, []);
  async function setstatus(stat) {
    var odRef = doc(data, "orders", odid);
    if (stat == "Received") {
      setColor("bg-lime-400");
    } else if (stat == "Pending") {
      setColor("bg-yellow-500");
    } else if (stat == "Processed") {
      setColor("bg-yellow-300");
    } else if (stat == "Dispatched") {
      setColor("bg-blue-800");
    } else if (stat == "Declined") {
      setColor("bg-red-800");
    } else if (stat == "Cancelled") {
      setColor("bg-gray-600");
    } else if (props.status == "Delivered") {
      setColor("bg-green-600");
    }
    var x = new Date();
    var time = (
      x.getHours() +
      ":" +
      x.getMinutes() +
      ":" +
      x.getSeconds()
    ).toString();
    const time1 = time.toString();

    await updateDoc(odRef, {
      status: stat,
      statlog: use + " | " + time1,
    });
    const coll = collection(data, "log");
    const snapshot = await getCountFromServer(coll);
    const ids = (snapshot.data().count + 101).toString();
    await setDoc(doc(data, "log", ids), {
      change: "Order status : " + stat + " of " + odid,

      user: use,
      timestamp: Date.now()
    });

    await updateDoc(odRef, {
      status: stat,
      statlog: use + " | " + time1,
    });
    if (stat == "Dispatched") {
      await updateDoc(odRef, {
        status: stat,
        statlog: use + " | " + time1,
        track: "",
        tracking: false,
        partner: "None",
        tracker: false,
      });
    } else {
      await updateDoc(odRef, {
        status: stat,
        statlog: use + " | " + time1,
      });
    }
    setCurrstat(stat);
  }
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className={`inline-flex w-full ${color} justify-center rounded-md border border-gray-300  bg-white px-4 py-2 text-sm font-medium text-white shadow-sm  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100`}
        >
          {currstat}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className="relative right-0 z-100 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {currstat != "Declined" && currstat != "Cancelled" && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    onClick={() => {
                      setstatus("Pending");
                    }}
                    className={classNames(
                      active ? " text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Pending
                  </a>
                )}
              </Menu.Item>
            )}
            {currstat != "Declined" && currstat != "Cancelled" && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    onClick={() => {
                      setstatus("Received");
                    }}
                    className={classNames(
                      active ? " text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Received
                  </a>
                )}
              </Menu.Item>
            )}
            {currstat != "Declined" && currstat != "Cancelled" && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    onClick={() => {
                      setstatus("Processed");
                    }}
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Processed
                  </a>
                )}
              </Menu.Item>
            )}
            {currstat != "Declined" && currstat != "Cancelled" && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    onClick={() => {
                      setstatus("Dispatched");
                    }}
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Dispatched
                  </a>
                )}
              </Menu.Item>
            )}
            {currstat != "Declined" && currstat != "Cancelled" && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    onClick={() => {
                      setstatus("Delivered");
                    }}
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Delivered
                  </a>
                )}
              </Menu.Item>
            )}
            {currstat != "Cancelled" && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    onClick={async () => {
                      if (
                        confirm("Are you sure you want to Decline this order?")
                      ) {
                        var idd;
                        var bal;
                        const userreff = collection(db, "retailers");
                        const q = query(
                          userreff,
                          where("phoneNo", "==", phone)
                        );
                        const querySnapshot = await getDocs(q);
                        const doc1 = querySnapshot.docs
                          .slice(-1)
                          .forEach((doc) => {
                            idd = doc.id.toString();
                            bal = doc.data()["balance"];
                          });
                        const current = new Date();

                        const date = `${current.getDate()}-${current.getMonth() + 1
                          }-${current.getFullYear()}`;
                        const time = `${current.getHours()}-${current.getMinutes() + 1
                          }-${current.getSeconds()}`;
                        var temp =
                          parseFloat(bal) +
                          parseFloat(props.price) -
                          parseFloat(props.discount);
                        await setDoc(doc(data, "payment", odid), {
                          balance: temp.toString(),
                          type: "Declined",
                          price: props.price.toString(),
                          timestamp: Math.round(+new Date()),
                          id: parseInt(odid),
                          odid: parseInt(odid),
                          phone: phone,
                          date: date,
                          time:time,
                          sign: "+",
                          username: props.name,

                        });
                        await updateDoc(doc(data, "retailers", idd), {
                          balance: temp.toString(),
                        });
                        setstatus("Declined");
                      } else {
                      }
                    }}
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Declined
                  </a>
                )}
              </Menu.Item>
            )}
            {currstat != "Declined" && (
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    onClick={async () => {
                      if (
                        confirm("Are you sure you want to Cancel this order?")
                      ) {
                        var idd;
                        var bal;
                        const userreff = collection(db, "retailers");
                        const q = query(
                          userreff,
                          where("phoneNo", "==", phone)
                        );
                        const querySnapshot = await getDocs(q);
                        const doc1 = querySnapshot.docs
                          .slice(-1)
                          .forEach((doc) => {
                            idd = doc.id.toString();
                            bal = doc.data()["balance"];
                          });
                          const current = new Date();

                        const date = `${current.getDate()}-${current.getMonth() + 1
                          }-${current.getFullYear()}`;
                        const time = `${current.getHours()}-${current.getMinutes() + 1
                          }-${current.getSeconds()}`;
                        var temp =
                          parseFloat(bal) +
                          parseFloat(props.price) -
                          parseFloat(props.discount);
                        await setDoc(doc(data, "payment", odid), {
                          balance: temp.toString(),
                          type: "Cancelled",
                          price: props.price.toString(),
                          timestamp: Math.round(+new Date()),
                          id: parseInt(odid),
                          odid: parseInt(odid),
                          phone: phone,
                          date: date,
                          time:time,
                          sign: "+",
                          username: props.name,
                        });
                        await updateDoc(doc(data, "retailers", idd), {
                          balance: temp.toString(),
                        });

                        setstatus("Cancelled");
                      } else {
                      }
                    }}
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    Cancelled
                  </a>
                )}
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
