// eslint-disable-file no-use-before-define
import { useState } from "react";
import { data } from "../home";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Router from "next/router";
import Image from "next/image";
import logo from "./logo.png";

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

    orders.map(getsome);
  }, []);
  function getsome(order) {}
  function sendProps(currorder, userid, prod, assign, type) {
    Router.push({
      pathname: "./invoice",
      query: {
        currorder,
        userid,
        prod,
        assign,
        type,
      },
    });
  }
  return (
    <div id="sticker" className="flex px-5 pb-5 justify-center">
      {orders.map((order) => {
        return (
          <div key={order.id} className="min-w-full ">
            <header className="bg-white noprint shadow">
              <div className="mx-auto grid grid-cols-3 items-center  max-w-6xl py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
                  Address Print
                </h1>
                <a
                  onClick={() => {
                    print();
                  }}
                  className="no-print flex  max-w-max  items-center justify-center rounded-md border border-transparent bg-indigo-600  text-base font-bold text-white hover:bg-indigo-700 md:py-2 md:px-5 py-0 md:text-2xl"
                >
                  Print
                </a>
              </div>
            </header>
            {dist.map((distr) => {
              return (
                <div id="printarea2" key={dist.phoneNo} className=" text-2xl">
                  <div className="border-0 text-2xl text-center font-bold p-2 mx-0  w-[37.5rem] h-[25rem] border-black">
                    <span className="text-3xl">From</span>
                    <div className="border p-2 w-full text-3xl border-1 border-black">
                      NAME : {order.assign}
                    </div>
                    <div className="border p-2 border-1 w-full border-black">
                      Mobile : {distr.phoneNo} <br />
                    </div>
                    <div className="border p-2 border-1 w-full border-black">
                      Address : {distr.address}, <br />
                      <span className="text-3xl">{distr.city}</span>
                      {distr.state && (
                        <span>
                          <br />
                          {distr.state}
                        </span>
                      )}
                      <br />
                      GST : {distr.gst}
                    </div>
                  </div>
                  {Users.map((ret) => {
                    return (
                      <div
                        key={ret.id}
                        className="border-0 text-center pagebreak text-2xl font-bold p-2 mx-0  w-[37.5rem] h-[25rem] border-black"
                      >
                        <span className="text-3xl">To</span>
                        <div className="border p-2 w-full text-3xl border-1 border-black">
                          NAME : {order.username}
                        </div>
                        <div className="border p-2 border-1 w-full border-black">
                          Mobile : {ret.phoneNo} <br />
                        </div>
                        <div className="border p-2 border-1 w-full border-black">
                          Address : {ret.address}, <br />
                          <span className="text-3xl">
                            {ret.city}- {ret.pincode}
                            <br />
                          </span>
                          {ret.state && <span>{ret.state}</span>}
                          <br />
                          GST : {ret.gst}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
