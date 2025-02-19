// eslint-disable-file no-use-before-define
import { useState } from "react";
import Orders, { data } from "../home";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import qr from "./qr.jpeg";
import sign from "./sign.png";
import logo from "./logo.png";
import Head from "next/head";

export default function Details() {
  const router = useRouter();

  const [product, setProd] = useState([]);

  const [orders, setOrders] = useState([]);
  const [dist, setDist] = useState([]);
  const {
    query: { currorder, userid, prod, assign, type },
  } = router;
  const props = {
    currorder,
    userid,
    prod,
    assign,
    type,
  };
  const id = parseInt(props.currorder);
  const assigned = props.assign;
  const prodid = props.prod.toString();
  const prodtype = props.type.toString();
  const usid = props.userid.toString();
  const [Users, setUsers] = useState([]);
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    if (prodid == "custom") {
      setCustom(true);
    }
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
    const collref2 = collection(data, "distributors");
    const q2 = query(collref2, where("name", "==", assign));
    const getOrders2 = async () => {
      const data = await getDocs(q2);
      setDist(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getOrders2();

    if (prodtype == "Rx") {
      console.log("rx");
      const collref4 = collection(data, "rx");
      const q4 = query(collref4, where("id", "==", prodid));
      const getOrders4 = async () => {
        const data = await getDocs(q4);
        setProd(
          data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
      };
      getOrders4();
    } else if (prodtype == "Stock") {
      const collref4 = collection(data, "stock");
      const q4 = query(collref4, where("id", "==", prodid));
      const getOrders4 = async () => {
        const data = await getDocs(q4);
        setProd(
          data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
      };
      getOrders4();
    } else if (prodtype == "Contact") {
      const collref4 = collection(data, "contact");
      const q4 = query(collref4, where("id", "==", prodid));
      const getOrders4 = async () => {
        const data = await getDocs(q4);
        setProd(
          data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
      };
      getOrders4();
    } else if (prodtype == "Accessory") {
      const collref4 = collection(data, "customprod");
      const q4 = query(collref4, where("id", "==", prodid));
      const getOrders4 = async () => {
        const data = await getDocs(q4);
        setProd(
          data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
      };
      getOrders4();
    }
  }, []);
  const uid = parseInt(props.userid);
  useEffect(() => {
    const collref = collection(data, "orders");
    const q = query(collref, where("id", "==", id));
    const getOrders = async () => {
      const data2 = await getDocs(q);
      setOrders(
        data2.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getOrders();

  }, []);
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
    <section id="printarea" class="py-5  bg-slate-300">
      <Head>
        {orders.map((det) => {
          return <title key={det.id}>INVOICE - {det.id}</title>;
        })}
      </Head>
      <a
        onClick={() => {
          print();
        }}
        className="no-print flex my-5 mx-auto max-w-max  items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
      >
        Print{" "}
      </a>
      <div class="max-w-5xl mx-auto py-5 px-5  bg-white">
        <article class="overflow-hidden border border-black border-1">
          <div>
            <div className="font-bold text-center border-b border-black border-1 grid grid-cols-3 justify-center">
              <div className="justify-left flex p-3">
                <Image src={logo} width={150} height={150} alt={""} />
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
                      <div className="font-normal">{det.gst.toUpperCase()}</div>
                    </div>
                  );
                })}
              </div>
              <div className="font-bold px-5 py-2 text-start ">
                {orders.map((det) => {
                  return (
                    <div
                      key={det.id}
                      className="grid grid-cols-2 justify-center"
                    >
                      <div className="font-normal">Receipt No :</div>
                      <div>{det.id}</div>
                      <div className="font-normal">Receipt Date :</div>
                      <div>{det.date}</div>
                      <div className="font-normal">Delivery Date :</div>
                      <div className="font-normal">{det.ed}</div>
                      <br />
                      <div className="col-span-2"></div>
                      <div className="font-normal">Mobile No :</div>

                      <div className="font-normal">{det.phone}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {orders.map((det) => {
              return (
                <table
                  key={det.id}
                  className="min-w-full table border-collapse border-t border-1 border-black"
                >
                  {det.type == "Accessory" && (
                    <thead>
                      <tr>
                        <th>SN.</th>
                        <th>Particulars</th>
                        <th>HSN</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Amt</th>
                      </tr>
                    </thead>
                  )}
                  {det.type == "Accessory" && (
                    <tbody className="text-center">
                      <tr>
                        <td>1</td>
                        <td>{det.name}</td>
                        <td></td>
                        <td>{det.qty}</td>
                        <td>{det.mrp}</td>
                        <td>{det.price}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Taxable Amount</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>{det.price}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Courier & Extra Charges</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>{det.courier}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Discount</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>{det.discount}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>SGST (6%)</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                          {((parseFloat(det.total) * 9) / 100).toString()}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>CGST (6%)</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                          {((parseFloat(det.total) * 9) / 100).toString()}
                        </td>
                      </tr>
                    </tbody>
                  )}
                  {(det.type == "Stock" ||
                    det.type == "Rx" ||
                    det.type == "Contact" ||
                    det.type == "All") && (
                      <thead>
                        <tr>
                          <th>SN.</th>
                          <th>Particulars</th>
                          <th>HSN</th>
                          <th>Sph</th>
                          <th>Cyl</th>
                          <th>Axis</th>
                          <th>Add</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Amt</th>
                        </tr>
                      </thead>
                    )}
                  {(det.type == "Stock" ||
                    det.type == "Rx" ||
                    det.type == "Contact" ||
                    det.type == "All") && (
                      <tbody className="text-center">
                        <tr>
                          <td>1</td>
                          <td>{det.brand}</td>
                          <td>9001</td>
                          <td>{det.sph_1}</td>
                          <td>{det.cyl_1}</td>
                          <td>{det.axis_1}</td>
                          <td>{det.add_1}</td>
                          <td>
                            {parseInt(det.items) == 1
                              ? parseInt(det["no_1"]) / 2
                              : null}
                            {parseInt(det.items) == 2
                              ? (parseInt(det["no_1"]) + parseInt(det["no_2"])) /
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
                                  ((parseFloat(det.price) * 25) / 28) * 100
                                ) / 100
                              ) /
                              (parseInt(det["no_1"]) / 2)
                              : null}
                            {parseInt(det.items) == 2
                              ? parseFloat(
                                Math.round(
                                  ((parseFloat(det.price) * 25) / 28) * 100
                                ) / 100
                              ) /
                              ((parseInt(det["no_1"]) + parseInt(det["no_2"])) /
                                2)
                              : null}
                            {parseInt(det.items) == 3
                              ? parseFloat(
                                Math.round(
                                  ((parseFloat(det.price) * 25) / 28) * 100
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
                                  ((parseFloat(det.price) * 25) / 28) * 100
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
                                  ((parseFloat(det.price) * 25) / 28) * 100
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
                                  ((parseFloat(det.price) * 25) / 28) * 100
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
                                  ((parseFloat(det.price) * 25) / 28) * 100
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
                                  ((parseFloat(det.price) * 25) / 28) * 100
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
                                  ((parseFloat(det.price) * 25) / 28) * 100
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
                                  ((parseFloat(det.price) * 25) / 28) * 100
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
                          <td>
                            {Math.round(
                              ((parseFloat(det.price) * 25) / 28) * 100
                            ) / 100}
                          </td>
                        </tr>

                        <tr>
                          <td></td>
                          <td>Discount</td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td>{det.discount + " %"}</td>
                        </tr>

                        <tr>
                          <td></td>
                          <td>Taxable Amount</td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td>
                            {Math.round(
                              ((parseFloat(det.total) * 25) / 28) * 100
                            ) / 100}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>CGST (6%)</td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td>
                            {det.type == "Accessory" ||
                              (det.company == "NORMAL LENS" && det.type == "Stock")
                              ? 0
                              : Math.round(
                                ((parseFloat(det.total) * 3) / 56) * 100
                              ) / 100}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>SGST (6%)</td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td id="nob"></td>
                          <td>
                            {det.type == "Accessory" ||
                              (det.company == "NORMAL LENS" && det.type == "Stock")
                              ? 0
                              : Math.round(
                                ((parseFloat(det.total) * 3) / 56) * 100
                              ) / 100}
                          </td>
                        </tr>
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

                          <td>
                            {parseFloat(det.courier) + parseFloat(det.extra)}
                          </td>
                        </tr>
                      </tbody>
                    )}
                </table>
              );
            })}
            {orders.map((det) => {
              return (
                <div key={det.id} className="p-5 pt-2  font-bold ">
                  {det.type == "Accessory" && (
                    <div className="grid grid-cols-2">
                      <div></div>
                      <div className="grid grid-cols-3 text-end">
                        <div> Total: {det.qty}</div> <div>PRS PAIRS</div>
                        <div>
                          {(
                            Math.round(
                              (parseFloat(det.total) + Number.EPSILON) * 100
                            ) / 100
                          ).toString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        Total Invoice Value : Rupees{" "}
                        {test(Math.round(parseFloat(det.total)))} only
                      </div>
                      <div className="grid mt-5 grid-cols-2 justify-around text-end">
                        <div>Total Amount:</div>
                        <div>
                          {(
                            Math.round(
                              (parseFloat(det.total) + Number.EPSILON) * 100
                            ) / 100
                          ).toString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {(det.type == "Stock" ||
                    det.type == "Rx" ||
                    det.type == "Contact" ||
                    det.type == "All") && (
                      <div className="grid grid-cols-2">
                        <div className="mt-2">
                          Total Invoice Value : Rupees{" "}
                          {test(Math.round(parseFloat(det.total)))} only
                        </div>
                        <div className="grid mt-2 grid-cols-3 justify-around text-end">
                          <div></div>
                          <div>Total Amount:</div>
                          <div>
                            {(
                              Math.round(parseFloat(det.total) * 100) / 100
                            ).toString()}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
          <div className="grid  border-t border-black border-1  font-bold grid-cols-3">
            {Users.map((det) => {
              return (
                <div key={det.id} className="p-2  justify-center">
                  Current Balance : &nbsp;
                  {(Math.round(parseFloat(det.balance) * 100) / 100).toString()}
                  /-
                </div>
              );
            })}
          </div>
          <div className="grid  border-t border-black border-1  p-2 ">
            <span className="font-semibold">
              Declaration : <br />
            </span>
            <br />
            Certified that the particulars given above are true &amp; correct
            and the amount indicated represents the price actually charged and
            there is no additional cosideration flowing directly or indirectly
            from the buyer over and above what has been declared. <br />
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
              2. Requests for returns or exchanges must be made within 48 hours
              of receiving the order.
              <br />
              3. Subject to Karnataka Jurisdiction only.
            </div>
            <div className="justify-center flex p-3">
              <Image src={sign} width={150} height={150} alt={""} />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
