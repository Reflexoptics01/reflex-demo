import { Fragment, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { data } from "../home";
import { useState } from "react";
import { getAuth } from "firebase/auth";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export default function Nameassign(props) {
  var assign = props.assign;
  const [currassign, setCurrassign] = useState(assign);
  var x = new Date();
  var time = (
    x.getHours() +
    ":" +
    x.getMinutes() +
    ":" +
    x.getSeconds()
  ).toString();
  var odid = props.odid;

  const [dist, setDist] = useState([]);
  useEffect(() => {
    const collref = collection(data, "retailers");
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
  }, []);
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
  const time1 = time.toString();
  async function setstatus(stat, id) {
    const odRef = doc(data, "orders", odid);

    await updateDoc(odRef, {
      assignlog: use + " | " + time1,
      assign: stat,
      disid: id,
    });
    const coll = collection(data, "log");
    const snapshot = await getCountFromServer(coll);
    const ids = (snapshot.data().count + 101).toString();
    await setDoc(doc(data, "log", ids), {
      change: "Order assign : " + stat + " of " + odid,

      user: use,
      timestamp: Date.now()
    });
    setCurrassign(stat);
  }
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          {currassign}
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
        <Menu.Items className="absolute right-0 mt-2 w-56 z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 z-20">
            {dist.map((dis) => {
              return (
                <Menu.Item key={dis.id}>
                  {({ active }) => (
                    <a
                      href="#"
                      onClick={() => {
                        setstatus(dis.name, dis.id);
                      }}
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm z-10"
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
  );
}
