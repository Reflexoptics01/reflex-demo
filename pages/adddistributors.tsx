import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { data } from "../home";
import { useState, useEffect } from "react";
import Router from "next/router";
import { getAuth } from "firebase/auth";

export default function Adddistributors() {
  const [business, setBusiness] = useState("");
  const [person, setPerson] = useState("");
  const [number, setNumber] = useState("");
  const [gst, setGst] = useState("");
  const [bank, setBank] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [ac, setAc] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
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
  async function addretailer() {
    if (business != "" && person != "" && number != "") {
      var id;
      const querySnapshot = await getDocs(collection(data, "distributors"));
      const coll = collection(data, "distributors");
      const snapshot = await getCountFromServer(coll);
      const count = snapshot.data().count;
      if (count > 0) {
        const doc1 = querySnapshot.docs.slice(-1).forEach((doc) => {
          id = doc.id;
        });
      } else {
        id = "100";
      }
      id = (parseInt(id) + 1).toString();

      await setDoc(doc(data, "distributors", id), {
        name: business,
        pname: person,
        phoneNo: number,
        gst: gst,
        address: address,
        city: city,
        state: state,
        email:email
      });
      const coll2 = collection(data, "log");
      const snapshot1 = await getCountFromServer(coll2);
      const ids = (snapshot1.data().count + 101).toString();
      await setDoc(doc(data, "log", ids), {
        change: "Added distributor : " + "name:" + business,
         user: use,
            timestamp:Date.now()
      });
      Router.push({
        pathname: "/pages/distributors",
      });
    } else {
      alert(
        "Please fill Business Name, Contact Person Name and Contact Number"
      );
    }
  }
  return (
    <div className="grid grid-cols-1 justify-items-center">
      <div className="col-span-6 sm:col-span-3">
        <div className="bg-white w-screen shadow">
          <div className="mx-auto max-w-4xl py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
              Add Distributors
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
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="business-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={business}
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
                        value={gst}
                        onChange={(value) => {
                          setGst(value.target.value);
                        }}
                        name="gst-no"
                        id="gst-no"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>{" "}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="bank"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bank}
                        onChange={(value) => {
                          setBank(value.target.value);
                        }}
                        name="bank"
                        id="bank"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>{" "}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="ifsc"
                        className="block text-sm font-medium text-gray-700"
                      >
                        IFS Code
                      </label>
                      <input
                        type="text"
                        value={ifsc}
                        onChange={(value) => {
                          setIfsc(value.target.value);
                        }}
                        name="ifsc"
                        id="ifsc"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>{" "}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="ac"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={ac}
                        onChange={(value) => {
                          setAc(value.target.value);
                        }}
                        name="ac"
                        id="ac"
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
                        value={address}
                        onChange={(value) => {
                          setAddress(value.target.value);
                        }}
                        name="address"
                        id="address"
                        autoComplete="address"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        required
                        onChange={(value) => {
                          setCity(value.target.value);
                        }}
                        name="city"
                        id="city"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700"
                      >
                        State
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={state}
                        onChange={(value) => {
                          setState(value.target.value);
                        }}
                        autoComplete="state"
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      >
                        <option>Karnataka</option>
                        <option>Kerala</option>
                        <option>Tamilnadu</option>
                      </select>
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="email-address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="text"
                        value={email}
                        onChange={(value) => {
                          setEmail(value.target.value);
                        }}
                        name="address"
                        id="address"
                        autoComplete="address"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <a
                    type="submit"
                    onClick={() => {
                      addretailer();
                    }}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
