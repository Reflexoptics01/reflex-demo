import { collection, deleteDoc, doc, getCountFromServer, getDocs, setDoc } from "firebase/firestore";
import Link from "next/link";
import Router from "next/router";
import { useState, useEffect } from "react";
import { data } from "../home";
// eslint-disable-file no-use-before-define

import Prodimg from "../components/prodimg";
import { getAuth } from "firebase/auth";

export default function Offers() {
  const [reflex, setreflex] = useState([]);
  const [use, setUser] = useState("");

  function sendProps(id, name, phoneNo, access) {
    Router.push({
      pathname: "/pages/editoffers",
      query: {
        id,
        name,
        phoneNo,
        access,
      },
    });
  }
  async function delete_doc(id) {
    await deleteDoc(doc(data, "offers", id));
    const collref = collection(data, "offers");
    const getRetail = async () => {
      const datas = await getDocs(collref);
      setreflex(
        datas.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getRetail();
    const coll2 = collection(data, "log");
    const snapshot1 = await getCountFromServer(coll2);
    const ids = (snapshot1.data().count + 101).toString();
    await setDoc(doc(data, "log", ids), {
      change: "Deleted Offer: " + "ID:" + id,
      user: use,
      timestamp: Date.now()
    });
  }
  useEffect(() => {
    const collref = collection(data, "offers");
    const getreflex = async () => {
      const datas = await getDocs(collref);
      setreflex(
        datas.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getreflex();
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUser(user.email);
    } else {
      // No user is signed in.
    }
  }, []);
  return (
    <>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
            Offers
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <div className="overflow-x-auto min-h-screen sm:-mx-6 lg:-mx-8">
              <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                <div className="">
                  <table className="min-w-full">
                    <thead className="bg-white border-b">
                      <tr>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Title
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Image
                        </th>

                      </tr>
                    </thead>
                    <tbody>
                      {reflex.map((reflex) => {
                        return (
                          <tr
                            key={reflex.id}
                            className="bg-white breflex-b transition duration-300 ease-in-out hover:bg-gray-100"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {reflex.id}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              {reflex.name}
                            </td>
                            <td className="text-sm text-gray-900 max-w-3xl font-light px-6 py-4 ">
                              <p className="overflow-auto text-justify max-w-3xl">{reflex.details}</p>
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              <Prodimg id={reflex.id} />
                            </td>

                            <td className="text-sm grid grid-cols-2 gap-5 text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              <a onClick={() => {
                                sendProps
                              }}>
                                <svg
                                  className="w-6 hover:text-indigo-800 cursor-pointer h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </a>
                              <a
                                onClick={() => {
                                  delete_doc(reflex.id);
                                }}
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Link
                    href="/pages/addoffers"
                    className="flex mt-10 max-w-max  items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
                  >
                    Add Offers
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
