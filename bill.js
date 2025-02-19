// eslint-disable-file no-use-before-define
import { useState } from "react";
import Orders, { data } from "../home";
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
import { useEffect } from "react";
import Router, { useRouter } from "next/router";
import sign from "./sign.png";
import { Fragment, useRef } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import logo from "./logo.png";
import Head from "next/head";

export default function Bill() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ivid, setIvid] = useState("");
  const [ext, setExt] = useState(0.0);
  const [tot, setTot] = useState(0.0);
  const [totl, setTotl] = useState(0.0);
  const [qty, setQty] = useState(0.0);
  var tota = 0;
  var totla = 0;
  var exta = 0;
  var qtya = 0;
  const {
    query: { date, userid, username },
  } = router;
  const props = {
    userid,
    date,
    username,
  };
  const id = parseInt(props.currorder);
  const usid = props.userid.toString();
  const name = props.username;
  const [Users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const collref = collection(data, "retailers");
    const q = query(collref, where("phoneNo", "==", usid));
    const getUsers = async () => {
      const data2 = await getDocs(q);

      setUsers(
        data2.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getUsers();
    const idn = async () => {
      const userreff2 = await getDocs(collection(data, "invoice"));
      const doc2 = userreff2.docs.slice(-1).forEach((doc) => {
        setIvid((parseFloat(doc.id) + 1).toString());
      });
    };
    idn();
  }, []);
  const uid = parseInt(props.userid);
  useEffect(() => {
    const collref = collection(data, "orders");
    const q = query(
      collref,
      where("ed", "==", date),
      where("phone", "==", usid),
    );
    const getOrders = async () => {
      const data2 = await getDocs(q);
      setOrders(
        data2.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
      const doc2 = data2.docs.map((doc) => {
        if (!doc.data().bill && ((doc.data().status == "Delivered") || (doc.data().status == "Dispatched"))) {
          tota = tota + parseFloat(doc.data().price);
          totla = totla + parseFloat(doc.data().total);
          exta =
            exta +
            parseFloat(doc.data().courier) +
            parseFloat(doc.data().extra);
          setTot(tota);
          setTotl(totla);
          qtya = qtya + parseFloat(doc.data().qty);
          setQty(qtya);
          setExt(exta);
        }
      });
    };
    getOrders();

  }, []);

  async function Generate() {
    const coll2 = collection(data, "log");
    const snapshot1 = await getCountFromServer(coll2);
    const ids = (snapshot1.data().count + 101).toString();
    await setDoc(doc(data, "log", ids), {
      change: "Added custom order : " + "order id:" + id,
      user: name,
      timestamp: Date.now(),
    });
    await setDoc(doc(data, "invoice", ivid), {
      id: ivid,
      username: name,
      date: date,
      tot: totl,
      userid: userid
    });
    orders.map(async (det) => {
      if (!det.bill && ((det.status == "Delivered") || (det.status == "Dispatched")))
        await updateDoc(doc(data, "orders", det.id), {
          bill: ivid,
        });
      return 0;
    });
    Router.push({
      pathname: "/pages/bills",
    });
  }

  function test(n) {
    if (n < 0) return false;
    let single_digit = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    let double_digit = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    let below_hundred = [
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    let result;

    if (n === 0) return "Zero";
    function translate(n) {
      let word = "";
      let rem;
      if (n < 0.1) {
        word = single_digit[n] + " ";
      } else if (n < 1) {
        word = "point" + " " + single_digit[n] + " ";
      } else if (n < 10) {
        word = single_digit[n] + " ";
      } else if (n < 20) {
        word = double_digit[n - 10] + " ";
      } else if (n < 100) {
        rem = translate(n % 10);
        word = below_hundred[(n - (n % 10)) / 10 - 2] + " " + rem;
      } else if (n < 1000) {
        word =
          single_digit[Math.trunc(n / 100)] + " Hundred " + translate(n % 100);
      } else if (n < 1000000) {
        word =
          translate(parseInt(n / 1000)).trim() +
          " Thousand " +
          translate(n % 1000);
      } else if (n < 1000000000) {
        word =
          translate(parseInt(n / 1000000)).trim() +
          " Million " +
          translate(n % 1000000);
      } else {
        word =
          translate(parseInt(n / 1000000000)).trim() +
          " Billion " +
          translate(n % 1000000000);
      }
      return word;
    }
    result = translate(n);
    console.log(result.trim() + ".");
    return result.trim();
  }

  return (
    <div>
      {
        tot != 0 &&
        (<section
          id="printarea"
          class="py-5 mx-auto justify-center grid bg-slate-300"
        >
          <Head>
            {orders.map((det) => {
              return <title key={det.id}>INVOICE - {ivid}</title>;
            })}
          </Head>
          <div className="bg-gray-50 no-print px-4 py-3 text-right sm:px-6">
            <a
              type="submit"
              onClick={() => {
                if (confirm("Confirm Bill")) {
                  Generate();
                } else {
                }
              }}
              className="inline-flex justify-center rounded-md cursor-pointer border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Generate Bill
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
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
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
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <div className="">
                <div class="max-w-5xl mx-auto py-5 px-5  h-screen mb-80 bg-white">
                  <article class=" border border-black border-1">
                    <div>
                      <div className="font-bold text-center border-b border-black border-1 grid grid-cols-3 justify-center">
                        <div className="justify-left flex p-3">
                        </div>
                        <div className="font-bold">
                          INVOICE
                          <br />
                          <h1 className="text-2xl col-span-3 pt-2">
                            Demo

                          </h1>
                          <h1 className="col-span-3 font-semibold pt-2">
                            No. 26/2, Old No. 34. Kilari Road, R.T. Street, Bengaluru 560 053

                          </h1>
                          <h1 className="col-span-3 font-semibold pb-2">
                            +916364267806
                          </h1>
                        </div>{" "}
                      </div>
                      <div className="font-bold text-center grid grid-cols-2 justify-center">
                        <div className="font-bold px-5 py-2 text-start border-r border-black border-1 ">
                          {Users.map((det) => {
                            return (
                              <div
                                key={det.id}
                                className="grid grid-cols-3 justify-center"
                              >
                                <div>Party Name :</div>
                                <div className="col-span-2">{det.name}</div>
                                <div className="font-normal">Address :</div>
                                <div className="font-normal col-span-2">
                                  {det.address},
                                </div>
                                <br />
                                {det.city != "" && (
                                  <div className="font-normal col-span-2">
                                    {det.city},
                                  </div>
                                )}
                                {det.city == "" && (
                                  <div className="font-normal col-span-2"></div>
                                )}
                                {(det.state != "" || det.pincode != "") && <br />}
                                {(det.state != "" || det.pincode != "") && (
                                  <div className="font-normal  col-span-2">
                                    {det.state} {det.pincode}
                                  </div>
                                )}

                                <div className="font-normal">GST No :</div>
                                <div className="font-normal">
                                  {det.gst.toUpperCase()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="font-bold px-5 py-2 text-start ">
                          {orders.slice(0, 1).map((det) => {
                            return (
                              <div
                                key={det.id}
                                className="grid grid-cols-2 justify-center"
                              >
                                <div className="font-normal">Receipt No :</div>
                                <div>{ivid}</div>
                                <div className="font-normal">Receipt Date :</div>
                                <div>{det.ed}</div>
                                <div className="col-span-2"></div>
                                <div className="font-normal">Mobile No :</div>
                                <div className="font-normal">{det.phone}</div>
                                <div className="font-normal">Order Ids:</div>
                                <div className="grid grid-cols-5">
                                  {orders.map((det) => {
                                    return (
                                      <div key={det.id}>
                                        {!det.bill && (
                                          <div className="font-normal">
                                            {det.id},
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <table className="min-w-full table text-start border-collapse border-t border-1 border-black">
                        <thead>
                          <tr>
                            <th>SN.</th>
                            <th>Particulars</th>
                            <th>Sph</th>
                            <th>Cyl</th>
                            <th>Axis</th>
                            <th>Add</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Discount</th>
                            <th>Amt</th>
                          </tr>
                        </thead>
                        {orders.map((det, index) => {
                          return (

                            <tbody key={index} className="text-center">
                              {(det.status == "Delivered" || det.status == "Dispatched") && <tr>
                                <td>{index + 1}</td>
                                <td className="text-start">{det.brand}</td>
                                <td>{det.sph_1}</td>
                                <td>{det.cyl_1}</td>
                                <td>{det.axis_1}</td>
                                <td>{det.add_1}</td>
                                <td>
                                  {parseInt(det.items) == 1
                                    ? parseInt(det["no_1"]) / 2
                                    : null}
                                  {parseInt(det.items) == 2
                                    ? (parseInt(det["no_1"]) +
                                      parseInt(det["no_2"])) /
                                    2
                                    : null}
                                  {parseInt(det.items) == 3
                                    ? (parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_3"])) /
                                    2
                                    : null}
                                  {parseInt(det.items) == 4
                                    ? (parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                    2
                                    : null}
                                  {parseInt(det.items) == 5
                                    ? (parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                    2
                                    : null}
                                  {parseInt(det.items) == 6
                                    ? (parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                    2
                                    : null}
                                  {parseInt(det.items) == 7
                                    ? (parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_7"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                    2
                                    : null}
                                  {parseInt(det.items) == 8
                                    ? (parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_8"]) +
                                      parseInt(det["no_7"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                    2
                                    : null}
                                  {parseInt(det.items) == 9
                                    ? (parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_8"]) +
                                      parseInt(det["no_7"]) +
                                      parseInt(det["no_9"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                    2
                                    : null}
                                  {parseInt(det.items) == 10
                                    ? (parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_8"]) +
                                      parseInt(det["no_7"]) +
                                      parseInt(det["no_9"]) +
                                      parseInt(det["no_10"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                    2
                                    : null}
                                </td>

                                <td>
                                  {parseInt(det.items) == 1
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    (parseInt(det["no_1"]) / 2)
                                    : null}
                                  {parseInt(det.items) == 2
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    ((parseInt(det["no_1"]) +
                                      parseInt(det["no_2"])) /
                                      2)
                                    : null}
                                  {parseInt(det.items) == 3
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    ((parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_3"])) /
                                      2)
                                    : null}
                                  {parseInt(det.items) == 4
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    ((parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                      2)
                                    : null}
                                  {parseInt(det.items) == 5
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    ((parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                      2)
                                    : null}
                                  {parseInt(det.items) == 6
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    ((parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                      2)
                                    : null}
                                  {parseInt(det.items) == 7
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    ((parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_7"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                      2)
                                    : null}
                                  {parseInt(det.items) == 8
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    ((parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_8"]) +
                                      parseInt(det["no_7"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                      2)
                                    : null}
                                  {parseInt(det.items) == 9
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    ((parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_8"]) +
                                      parseInt(det["no_7"]) +
                                      parseInt(det["no_9"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                      2)
                                    : null}
                                  {parseInt(det.items) == 10
                                    ? parseFloat(
                                      Math.round(
                                        ((parseFloat(det.price) * 25) / 28) *
                                        100
                                      ) / 100
                                    ) /
                                    ((parseInt(det["no_1"]) +
                                      parseInt(det["no_2"]) +
                                      parseInt(det["no_5"]) +
                                      parseInt(det["no_6"]) +
                                      parseInt(det["no_8"]) +
                                      parseInt(det["no_7"]) +
                                      parseInt(det["no_9"]) +
                                      parseInt(det["no_10"]) +
                                      parseInt(det["no_3"]) +
                                      parseInt(det["no_4"])) /
                                      2)
                                    : null}
                                </td>
                                <td>{det.discount + " %"}</td>

                                <td className="text-start">
                                  {Math.round(parseFloat(det.total) - parseFloat(det.courier) - parseFloat(det.extra))}                                </td>
                              </tr>}
                            </tbody>
                          )
                        }
                        )
                        }



                        <tr>
                          <td></td>
                          <td>Courier & Extra Charges</td>

                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>

                          <td>{ext}</td>
                        </tr>
                        <tr className="p-5 pt-2  font-bold ">
                          <td></td>
                          <td>Total Amount</td>

                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>

                          <td>
                            {(Math.round(parseFloat(totl) * 100) / 100).toString()}
                            /-
                          </td>
                        </tr>
                      </table>
                    </div>
                    <div className="p-5 pt-2  font-bold ">
                      <div className="grid justify-center">
                        <div className="mt-2 text-start col-span-2">
                          Total Invoice Value : Rupees{" "}
                          {test(Math.round(parseFloat(totl)))} only
                        </div>
                      </div>
                    </div>
                    <div className="grid  border-t border-black border-1  p-2 ">
                      <span className="font-semibold">
                        Declaration : <br />
                      </span>
                      <br />
                      Certified that the particulars given above are true &amp;
                      correct and the amount indicated represents the price actually
                      charged and there is no additional cosideration flowing
                      directly or indirectly from the buyer over and above what has
                      been declared. <br />
                      <br />
                    </div>
                    <div className="grid  border-t border-black border-1  grid-cols-3">
                      <div className="col-span-2 grid items-center p-3 ">
                        <span className="font-semibold">
                          Terms & Conditions Receivers Signature :
                          <br />
                        </span>
                        1. Goods once sold will not be taken back.
                        <br />
                        2. Requests for returns or exchanges must be made within 48
                        hours of receiving the order.
                        <br />
                        3. Subject to Karnataka Jurisdiction only.
                      </div>
                      <div className="justify-center flex p-3">
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>)
      }
      {
        tot == 0 && (<div className="text-center p-10 text-2xl font-bold">No bill to be Generated, Try again</div>)
      }
    </div>
  );
}
