import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { data } from "../home";
import Router from "next/router";
// eslint-disable-file no-use-before-define


export default function Bills() {
  const [log, setLog] = useState([]);
  function sendProps2(userid,
    date, id,
    username) {
    Router.push({
      pathname: "Printbill",
      query: {
        userid,
        date,
        id
        ,
        username,
      },
    });
  }
  const [orders, setOrders] = useState([]);

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
  useEffect(() => {
    const collref = collection(data, "invoice");
    const getRetail = async () => {
      const datas = await getDocs(collref);
      setLog(
        datas.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getRetail();

    const collref2 = collection(data, "orders");
    const getOrders = async () => {
      const data = await getDocs(collref2);
      setOrders(
        data.docs.reverse().map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    };
    getOrders();
  }, []);
  return (
    <>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
              Bills
            </h1>
            <button
              onClick={exportxl}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-base font-medium text-white hover:bg-indigo-700 transition-colors duration-200"
            >
              GST Export
            </button>
          </div>
        </div>
      </header>      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
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
                          Invoice Number
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
                          Date
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Print
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {log.reverse().map((log) => {
                        return (
                          <tr
                            key={log.id}
                            className="bg-white bretail-b transition duration-300 ease-in-out hover:bg-gray-100"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {log.id}
                            </td> <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {log.username}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {log.date}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              {log.tot}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-3 py-1 whitespace-nowrap">
                              <a
                                onClick={() => {
                                  sendProps2(log.id, log.date, log.userid, log.username);
                                }}
                                className="flex mt-1 max-w-max cursor-pointer items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8  text-base font-medium text-white hover:bg-indigo-700 md:py-1 md:px-30 md:text-md"
                              >
                                Print
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
