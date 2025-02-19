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
import copy from "copy-to-clipboard";

import { getAuth } from "firebase/auth";
import { Fragment, useRef } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { db } from "../../components/firebase-config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.css";
import Head from "next/head";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Ledgers() {
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gst, setGst] = useState("");
  const [bal, setBal] = useState("");
  const [bal1, setBal1] = useState("0");
  const [startDate, setStartDate] = useState(new Date());
  const [retail, setRetail] = useState([]);
  const [orders, setOrders] = useState([]);

  const [use, setUser] = useState("");
  const [namesearch, setNames] = useState("");
  const [date1, setDate1] = useState("");
  const [date1f, setDate1f] = useState("");
  const [date2, setDate2] = useState("");
  const current = new Date();
  const col = "payment";
  const [date2f, setDate2f] = useState(
    `${current.getDate()}-${current.getMonth() + 1}-${current.getFullYear()}`
  );
  const [bill, setBill] = useState("");
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const cancelButtonRef = useRef(null);
  const [currassign, setCurrassign] = useState("");

  const [ledg, setLedg] = useState([]);

  useEffect(() => {
    const collref2 = collection(data, "payment");
    const getOrders2 = async () => {
      const data = await getDocs(collref2);
      setLedg(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
      setOrders(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
      const od2 = orders;
      od2.sort((a, b) => {
        return b.id - a.id;
      });
      od2.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
      const sorted = od2.sort((a, b) => {
        const [d, m, y] = a.date.split("-"); // splits "26-02-2012" or "26/02/2012"
        const date1 = new Date(y, m - 1, d);
        const [d1, m1, y1] = b.date.split("-"); // splits "26-02-2012" or "26/02/2012"
        const date2 = new Date(y1, m1 - 1, d1);
        const dd1 = date1.getTime();
        const dd2 = date2.getTime();

        return dd2 - dd1;
      });
      setOrders(od2);
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
      const coll = collection(db, "payment");
      const snapshot = await getCountFromServer(coll);

      const dd3 = snapshot.data().count + 100;

      setBill("P-" + dd3);
    }
    billing();

    const collref4 = query(
      collection(data, "retailers"),
    );

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

  async function search() {
    if (namesearch != "" && date1 != "" && date2 != "") {
      const collref = collection(db, "payment");
      const getOrders = async () => {
        const data = await getDocs(collref);
        setOrders(
          data.docs.reverse().map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
        var od2 = orders.filter((x) => {
          var myDate = date1.split("-");
          var newDate = new Date(myDate[2], myDate[1] - 1, myDate[0]);

          var myDate1 = String(x["date"]).split("-");

          var newDate1 = new Date(myDate1[2], myDate1[1] - 1, myDate1[0]);
          var my2Date = date2.split("-");
          var new2Date = new Date(my2Date[2], my2Date[1] - 1, my2Date[0]);
          var my2Date1 = String(x.date).split("-");
          var new2Date1 = new Date(my2Date1[2], my2Date1[1] - 1, my2Date1[0]);
          // console.log(newDate,newDate1);

          return (
            newDate.getTime() <= newDate1.getTime() &&
            new2Date.getTime() >= new2Date1.getTime() &&
            x.username >= namesearch &&
            x.username <= namesearch + "\uf8ff"
          );
        });
        od2.sort((a, b) => {
          return b.id - a.id;
        });
        od2.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
        const sorted = od2.sort((a, b) => {
          const [d, m, y] = a.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date1 = new Date(y, m - 1, d);
          const [d1, m1, y1] = b.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date2 = new Date(y1, m1 - 1, d1);
          const dd1 = date1.getTime();
          const dd2 = date2.getTime();

          return dd2 - dd1;
        });
        setOrders(sorted);
      };
      getOrders();
    } else if (namesearch != "" && date1 != "") {
      const collref = query(collection(db, "payment"));
      const getOrders = async () => {
        const data = await getDocs(collref);
        setOrders(
          data.docs.reverse().map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
        var od2 = orders.filter((x) => {
          var myDate = date1.split("-");
          var newDate = new Date(myDate[2], myDate[1] - 1, myDate[0]);
          var myDate1 = String(x.date).split("-");
          var newDate1 = new Date(myDate1[2], myDate1[1] - 1, myDate1[0]);
          var my2Date = date2.split("-");
          var new2Date = new Date(my2Date[2], my2Date[1] - 1, my2Date[0]);
          var my2Date1 = String(x.date).split("-");
          var new2Date1 = new Date(my2Date1[2], my2Date1[1] - 1, my2Date1[0]);
          return (
            newDate.getTime() <= newDate1.getTime() &&
            x.username >= namesearch &&
            x.username <= namesearch + "\uf8ff"
          );
        });
        od2.sort((a, b) => {
          return b.id - a.id;
        });
        od2.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
        const sorted = od2.sort((a, b) => {
          const [d, m, y] = a.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date1 = new Date(y, m - 1, d);
          const [d1, m1, y1] = b.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date2 = new Date(y1, m1 - 1, d1);
          const dd1 = date1.getTime();
          const dd2 = date2.getTime();

          return dd2 - dd1;
        });
        setOrders(sorted);
      };
      getOrders();
    } else if (namesearch != "" && date2 != "") {
      const collref = query(collection(db, "payment"));
      const getOrders = async () => {
        const data = await getDocs(collref);
        setOrders(
          data.docs.reverse().map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
        var od2 = orders.filter((x) => {
          var myDate = date1.split("-");
          var newDate = new Date(myDate[2], myDate[1] - 1, myDate[0]);
          var myDate1 = String(x.date).split("-");
          var newDate1 = new Date(myDate1[2], myDate1[1] - 1, myDate1[0]);
          var my2Date = date2.split("-");
          var new2Date = new Date(my2Date[2], my2Date[1] - 1, my2Date[0]);
          var my2Date1 = String(x.date).split("-");
          var new2Date1 = new Date(my2Date1[2], my2Date1[1] - 1, my2Date1[0]);
          return (
            new2Date.getTime() >= new2Date1.getTime() &&
            x.username >= namesearch &&
            x.username <= namesearch + "\uf8ff"
          );
        });
        od2.sort((a, b) => {
          return b.id - a.id;
        });
        od2.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
        const sorted = od2.sort((a, b) => {
          const [d, m, y] = a.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date1 = new Date(y, m - 1, d);
          const [d1, m1, y1] = b.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date2 = new Date(y1, m1 - 1, d1);
          const dd1 = date1.getTime();
          const dd2 = date2.getTime();

          return dd2 - dd1;
        });
        setOrders(sorted);
      };
      getOrders();
    } else if (date1 != "" && date2 != "") {
      const collref = query(collection(db, "payment"));
      const getOrders = async () => {
        const data = await getDocs(collref);
        setOrders(
          data.docs.reverse().map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
        var od2 = orders.filter((x) => {
          var myDate = date1.split("-");
          var newDate = new Date(myDate[2], myDate[1] - 1, myDate[0]);
          var myDate1 = String(x.date).split("-");
          var newDate1 = new Date(myDate1[2], myDate1[1] - 1, myDate1[0]);
          var my2Date = date2.split("-");
          var new2Date = new Date(my2Date[2], my2Date[1] - 1, my2Date[0]);
          var my2Date1 = String(x.date).split("-");
          var new2Date1 = new Date(my2Date1[2], my2Date1[1] - 1, my2Date1[0]);
          return (
            newDate.getTime() <= newDate1.getTime() &&
            new2Date.getTime() >= new2Date1.getTime()
          );
        });
        od2.sort((a, b) => {
          return b.id - a.id;
        });
        od2.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
        const sorted = od2.sort((a, b) => {
          const [d, m, y] = a.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date1 = new Date(y, m - 1, d);
          const [d1, m1, y1] = b.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date2 = new Date(y1, m1 - 1, d1);
          const dd1 = date1.getTime();
          const dd2 = date2.getTime();

          return dd2 - dd1;
        });
        setOrders(sorted);
      };
      getOrders();
    } else if (namesearch != "") {
      const collref = query(collection(db, "payment"));
      const getOrders = async () => {
        const data = await getDocs(collref);
        setOrders(
          data.docs.reverse().map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
        var od2 = orders.filter((x) => {
          var myDate = date1.split("-");
          var newDate = new Date(myDate[2], myDate[1] - 1, myDate[0]);
          var myDate1 = String(x.date).split("-");
          var newDate1 = new Date(myDate1[2], myDate1[1] - 1, myDate1[0]);
          var my2Date = date2.split("-");
          var new2Date = new Date(my2Date[2], my2Date[1] - 1, my2Date[0]);
          var my2Date1 = String(x.date).split("-");
          var new2Date1 = new Date(my2Date1[2], my2Date1[1] - 1, my2Date1[0]);

          return (
            x.username >= namesearch && x.username <= namesearch + "\uf8ff"
          );
        });
        od2.sort((a, b) => {
          return b.id - a.id;
        });
        od2.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
        const sorted = od2.sort((a, b) => {
          const [d, m, y] = a.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date1 = new Date(y, m - 1, d);
          const [d1, m1, y1] = b.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date2 = new Date(y1, m1 - 1, d1);
          const dd1 = date1.getTime();
          const dd2 = date2.getTime();

          return dd2 - dd1;
        });
        setOrders(sorted);
      };
      getOrders();
    } else if (date2 != "") {
      const collref = query(collection(db, "payment"));
      const getOrders = async () => {
        const data = await getDocs(collref);
        setOrders(
          data.docs.reverse().map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
        var od2 = orders.filter((x) => {
          var myDate = date1.split("-");
          var newDate = new Date(myDate[2], myDate[1] - 1, myDate[0]);
          var myDate1 = String(x.date).split("-");
          var newDate1 = new Date(myDate1[2], myDate1[1] - 1, myDate1[0]);
          var my2Date = date2.split("-");
          var new2Date = new Date(my2Date[2], my2Date[1] - 1, my2Date[0]);
          var my2Date1 = String(x.date).split("-");
          var new2Date1 = new Date(my2Date1[2], my2Date1[1] - 1, my2Date1[0]);
          return new2Date.getTime() >= new2Date1.getTime();
        });
        od2.sort((a, b) => {
          return b.id - a.id;
        });
        od2.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
        const sorted = od2.sort((a, b) => {
          const [d, m, y] = a.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date1 = new Date(y, m - 1, d);
          const [d1, m1, y1] = b.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date2 = new Date(y1, m1 - 1, d1);
          const dd1 = date1.getTime();
          const dd2 = date2.getTime();

          return dd2 - dd1;
        });
        setOrders(sorted);
      };
      getOrders();
    } else if (date1 != "") {
      const collref = query(collection(db, "payment"));
      const getOrders = async () => {
        const data = await getDocs(collref);
        setOrders(
          data.docs.reverse().map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
        );
        var od2 = orders.filter((x) => {
          var myDate = date1.split("-");
          var newDate = new Date(myDate[2], myDate[1] - 1, myDate[0]);
          var myDate1 = String(x.date).split("-");
          var newDate1 = new Date(myDate1[2], myDate1[1] - 1, myDate1[0]);
          var my2Date = date2.split("-");
          var new2Date = new Date(my2Date[2], my2Date[1] - 1, my2Date[0]);
          var my2Date1 = String(x.date).split("-");
          var new2Date1 = new Date(my2Date1[2], my2Date1[1] - 1, my2Date1[0]);
          return newDate.getTime() <= newDate1.getTime();
        });
        od2.sort((a, b) => {
          return b.id - a.id;
        });
        od2.sort((a, b) => {
          return b.timestamp - a.timestamp;
        });
        const sorted = od2.sort((a, b) => {
          const [d, m, y] = a.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date1 = new Date(y, m - 1, d);
          const [d1, m1, y1] = b.date.split("-"); // splits "26-02-2012" or "26/02/2012"
          const date2 = new Date(y1, m1 - 1, d1);
          const dd1 = date1.getTime();
          const dd2 = date2.getTime();

          return dd2 - dd1;
        });
        setOrders(sorted);
      };
      getOrders();
    }
  }

  async function exportxls() {
    if (orders.length != 0) {
      const array = [];
      var ld = orders;
      ld.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));
      Object.keys(ld).forEach((key) => {
        const value = ld[key];
        array.push({
          "Payment ID": ld[key]["id"],
          Date: ld[key]["date"],
          Time: ld[key]["time"],
          Name: ld[key]["username"],
          Amount: ld[key]["price"],
          Type: ld[key]["type"],
          Timestamp: ld[key]["timestamp"],
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
      download(convertToCSV(array), "Ledger Export " + Date());
    } else {
      alert("No Transaction Found!");
    }
    clrsearch();
  }
  async function clrsearch() {
    setNames("");
    setDate1("");
    setDate2("");
    setDate2f("");
    setDate1f("");
    const collref = collection(db, "payment");
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
        change: "Added payment : " + price,
        user: use,
        payment_type: "Ledger",
        timestamp: Date.now(),
      });
      var idd = "";
      const userreff = collection(db, "retailers");
      const q = query(userreff, where("phoneNo", "==", phone));
      const querySnapshot = await getDocs(q);
      const dd = querySnapshot.docs[0].data();

      querySnapshot.docs.slice(-1).forEach((doc) => {
        idd = doc.id.toString();
      });
      var temp = parseFloat(bal) + parseFloat(price);
      console.log(temp);

      await updateDoc(doc(data, "retailers", idd), {
        balance: temp.toString(),
      });
      const coll = collection(db, "payment");
      const snapshot = await getCountFromServer(coll);

      const dd3 = snapshot.data().count + 100;

      idd = "P-" + dd3;
      await setDoc(doc(data, col, idd), {
        id: idd,
        phone: phone,
        username: name,
        date: date,
        type: "Payment",
        sign: "+",
        dat: startDate,
        timestamp: timestamp,
        balance: temp.toString(),
        price: price,
        time: time,
      });
      var alert_message = `Dear ${dd["name"]
        },\n \n Thank you for making a payment of ${price} rupees on ${date}. Your current balance is ${temp.toFixed(
          2
        )}. \n \n We greatly appreciate your trust in our platform and assure you that we will serve you to the best of our ability. \n \n Thank you again for your payment. \n \n Kind regards, \n Demo`;
      copy(alert_message);
      var form = `Dear ${dd["name"]
        },%0A %0A Thank you for making a payment of ${price} rupees on ${date}. Your current balance is ${temp.toFixed(
          2
        )}. %0A %0A We greatly appreciate your trust in our platform and assure you that we will serve you to the best of our ability. %0A %0A Thank you again for your payment. %0A %0A Kind regards, %0A Demo`;
      alert("You will be redirected to Whatsapp");
      var whtsapp = `https://wa.me/91${phone}?text=${form}`;
      window.open(whtsapp, "_blank");
      setPrice("");
      window.location.reload();
    } else {
      setOpen(true);
    }
  }
  return (
    <div className="grid font-medium grid-cols-1 max-w-7xl mx-auto">
      <div className="pt-10 col-span-6 no-print max-w-6xl sm:mt-0">
        <div className=" md:gap-6">
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form action="#" method="POST">
              <div className=" shadow min-h-max sm:rounded-md">
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
                        Ledger
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
                    <div className="col-span-4">
                      <label
                        htmlFor="contact-no"
                        className="block text-md font-medium text-gray-700"
                      >
                        Particulars
                      </label>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          value={currassign}
                          onChange={(e) => {
                            const searchValue = e.target.value;
                            setstatus(searchValue, '', '', '');
                          }}
                          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-md font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          placeholder="Search particulars..."
                        />
                        {currassign && !retail.find(item => item.name === currassign) && (
                          <div className="absolute z-10 w-full mt-1 max-h-56 overflow-y-auto bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                            {retail
                              .filter((item) =>
                                item.name.toLowerCase().includes(currassign.toLowerCase())
                              )
                              .map((dis) => (
                                <div
                                  key={dis.id}
                                  onClick={() => {
                                    setstatus(dis.name, dis.phoneNo, dis.gst, dis.balance);
                                    setBal1(dis.balance);
                                  }}
                                  className="px-4 py-2 text-md text-gray-700 hover:bg-gray-100 cursor-pointer"
                                >
                                  {dis.name}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
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
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="email-address"
                        className="block text-md font-medium text-gray-700"
                      >
                        Date
                      </label>
                      <DatePicker
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
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
      <div className="grid grid-cols-11 no-print col-span-6 gap-3 px-10 py-5">
        <div className="col-span-3">
          <label
            for="name-filter"
            class="block text-sm font-semibold leading-6 text-gray-900"
          >
            Filter by Name
          </label>
          <div className="mt-2.5">
            <Menu as="div" className="relative inline-block w-full text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                  {namesearch}
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
                <Menu.Items className="absolute overflow-y-scroll h-96 right-0 mt-2 w-56 z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1 z-20">
                    {retail.map((dis) => {
                      return (
                        <Menu.Item key={dis.id}>
                          {({ active }) => (
                            <a
                              href="#"
                              onClick={() => {
                                setNames(dis.name);
                              }}
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
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
          </div>
        </div>

        <div className="col-span-2">
          <label
            for="name-filter"
            class="block w-full text-sm font-semibold leading-6 text-gray-900"
          >
            Date From
          </label>
          <div class="mt-2.5">
            <input
              type="date"
              name="Date"
              id="date"
              value={date1f}
              onChange={(value) => {
                setDate1f(value.target.value);
                const dateParts = value.target.value.split("-");
                dateParts.reverse();

                setDate1(dateParts.join("-"));
              }}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div className="col-span-2">
          <label
            for="name-filter"
            class="block text-sm font-semibold leading-6 text-gray-900"
          >
            Date to
          </label>
          <div class="mt-2.5">
            <input
              type="date"
              name="Date"
              value={date2f}
              onChange={(value) => {
                setDate2f(value.target.value);

                const dateParts = value.target.value.split("-");
                dateParts.reverse();

                setDate2(dateParts.join("-"));
              }}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>
      <div className="flex no-print col-span-6 justify-end px-10 py-5 gap-5">
        <a
          type="submit"
          rel="noopener noreferrer"
          onClick={() => {
            search();
            setOpen2(true);
          }}
          className="flex cursor-pointer max-w-max  items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-30 md:text-lg"
        >
          Search 🔎
        </a>
        <a
          rel="noopener noreferrer"
          onClick={() => {
            clrsearch();
          }}
          className="flex max-w-max cursor-pointer items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-30 md:text-lg"
        >
          Clear Search
        </a>
        <a
          onClick={() => {
            setOpen2(true);
          }}
          rel="noopener noreferrer"
          className="flex max-w-max cursor-pointer items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-30 md:text-lg"
        >
          Export
        </a>
        <a
          onClick={() => {
            exportxls();
          }}
          rel="noopener noreferrer"
          className="flex max-w-max cursor-pointer items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-30 md:text-lg"
        >
          Export Excel
        </a>
      </div>

      <main className="w-full overflow-scoll">
        <div
          className={`mx-auto w-full py-6 sm:px-6 lg:px-8 ${!open2 ? "block" : "hidden"
            }`}
        >
          <div className="flex flex-col">
            <div className="overflow-x-auto min-h-screen sm:-mx-6 lg:-mx-8">
              <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                <div className=" grid grid-cols-1 justify-items-center">
                  <table className="min-w-full text-md">
                    <thead className="bg-white text-xl   border-b">
                      <tr>
                        <th
                          scope="col"
                          className="font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Customer ID
                        </th>
                        <th
                          scope="col"
                          className=" font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Optical Name
                        </th>

                        <th
                          scope="col"
                          className=" font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Balance
                        </th>
                      </tr>
                    </thead>
                    {retail.map((retail) => {
                      return (
                        <tbody key={retail.id}>
                          {retail.balance != "0" && (
                            <tr className="bg-white bretail-b text-xl transition duration-300 ease-in-out hover:bg-gray-100">
                              <td className="px-6 py-4 whitespace-nowrap  font-medium text-gray-900">
                                {retail.id}
                              </td>
                              <td className=" text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {retail.name}
                              </td>

                              <td className="  text-gray-900 font-bold  px-6 py-4 whitespace-nowrap">
                                {Math.round(parseFloat(retail.balance) * 100) /
                                  100}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      );
                    })}
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

                      <div className="fixed inset-0 z-10 ">
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
                            <Dialog.Panel className="relative transform  rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
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
                                      Enter the details
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
                                  Return
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
        <div
          className={` flex-col lg:flex-row text-lg grid list-none bg-white px-4 pb-4  sm:p-6 sm:pb-4 col-span-12 ${open2 ? "block" : "hidden"
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
              onClick={() => setOpen2(false)}
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
                          Ledger Book
                          <br />
                          <h1 className="text-2xl col-span-3 pt-2">
                            Demo
                          </h1>
                          <h1 className="col-span-3 font-semibold pt-2">
                            No. 26/2, Old No. 34. Kilari Road, R.T. Street,
                            Bengaluru 560 053

                          </h1>

                        </div>{" "}
                      </div>

                      <table className="min-w-full py-5 table border-collapse border-t border-1 border-black">
                        <thead>
                          <tr>
                            <th>SN.</th>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Trans Type</th>
                            <th>Voucher/Bill No</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                          </tr>
                        </thead>{" "}
                        <tbody className="text-center">
                          {orders.map((det, index) => {
                            return (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="font-bold">{det.username}</td>
                                <td>{det.date}</td>
                                <td>{det.type}</td>
                                <td>{det.id}</td>
                                <td>{det.sign == "-" ? det.price : "0"}</td>
                                <td>{det.sign == "+" ? det.price : "0"}</td>
                                <td className="font-bold">
                                  {Math.round(parseFloat(det.balance) * 100) /
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
  );
}
