// eslint-disable-file no-use-before-define
import { useState } from "react";
import { data } from "../home";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Router from "next/router";

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
  function getsome(order) { }
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
                <h1 className="text-2xl font-bold tracking-tight text-indigo-900">
                  Sticker Print
                </h1>
                <a
                  onClick={() => {
                    print();
                  }}
                  className="no-print flex  max-w-max  items-center justify-center rounded-md border border-transparent bg-indigo-600  text-base font-bold text-white hover:bg-indigo-700 md:py-2 md:px-5 py-0 md:text-xl"
                >
                  Print
                </a>
              </div>
            </header>
            <div id="printarea2" className="font-bold text-xl  ">
              <div className="border-0 text-xl font-bold p-2 mx-0 pr-12  w-[37.5rem] h-[25rem] border-black">
                <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                  {order.username}
                </div>
                <div className="grid gap-20 pt-1  text-xl pl-5 grid-cols-2">
                  <div>
                    <span className="text-xl">Order ID : {order.id}</span>{" "}
                  </div>
                  <div>
                    <span className="text-xl">Date : {order.date}</span> <br />
                  </div>
                </div>
                <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                  <div>{order.brand} </div>
                </div>
                <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                  <div>{order.material} </div>
                  <div>{order.index} </div>
                  <div>{order.baseTint}</div>
                  <div>{order.coatingType} </div>
                </div>
                <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                  <div className="col-span-3">{order.lensType} </div>
                </div>
                <div className="grid pt-1 text-center text-lg px-10 gap-2 grid-cols-5">
                  <p className="text-center font-bold"></p>
                  <p className="text-center font-bold">SPH</p>
                  <p className="text-center font-bold">CYL</p>
                  <p className="text-center font-bold">Axis</p>
                  <p className="text-center font-bold">Add</p>
                  <button
                    type="button"
                    className="inline-flex items-center cursor-default   bg-white px-2 py-1 text-2xl font-bold text-black  "
                  >
                    {order.eye_1 == 1
                      ? "R.E"
                      : order.eye_1 == 2
                        ? "L.E"
                        : "B.E"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {order.sph_1}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {order.cyl_1}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {order.axis_1}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {order.add_1}
                  </button>
                </div>
                <div className="grid pt-1 pl-4 grid-cols-2">
                  <div>
                    Ref ID : {order.refid && order.refid}
                    {order.refid_1 && order.refid_1}
                  </div>
                  <div className="text-center font-bold text-end  pr-12">
                    ({order.type})
                  </div>
                </div>
                <div className="text-center mt-3">
                  +916364267806
                </div>
              </div>
              {order.items >= 2 && (
                <div className="border-0  text-xl font-bold p-2 pr-12 mx-0 pagebreak  w-[37.5rem] h-[25rem] border-black">
                  <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                    {order.username}
                  </div>
                  <div className="grid gap-20 pt-1  text-xl pl-4 justify grid-cols-2">
                    <div>
                      <span className="text-xl">Order ID : {order.id}</span>{" "}
                    </div>
                    <div>
                      <span className="text-xl">Date : {order.date}</span> <br />
                    </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.brand} </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                  </div>
                  <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                    <div className="col-span-3">{order.lensType} </div>
                  </div>
                  <div className="grid pt-2 text-center text-2xl px-10 gap-2 grid-cols-5">
                    <p className="text-center font-bold"></p>
                    <p className="text-center font-bold">SPH</p>
                    <p className="text-center font-bold">CYL</p>
                    <p className="text-center font-bold">Axis</p>
                    <p className="text-center font-bold">Add</p>
                    <button
                      type="button"
                      className="inline-flex items-center cursor-default   bg-white px-2 py-2 text-2xl font-bold text-black  "
                    >
                      {order.eye_2 == 1
                        ? "R.E"
                        : order.eye_2 == 2
                          ? "L.E"
                          : "B.E"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.sph_2}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.cyl_2}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.axis_2}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.add_2}
                    </button>
                  </div>
                  <div className="grid pt-1 pl-4 grid-cols-2">
                    <div>
                      Ref ID : {order.refid && order.refid}
                      {order.refid_1 && order.refid_1}
                    </div>
                    <div className="text-center font-bold text-end  pr-12">
                      ({order.type})
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    +916364267806
                  </div>
                </div>
              )}
              {order.items >= 3 && (
                <div className="border-0 text-xl font-bold p-2 mx-0  pagebreak w-[37.5rem] h-[25rem] border-black">
                  <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                    {order.username}
                  </div>
                  <div className="grid gap-20 pt-1  text-xl pl-4 justify grid-cols-2">
                    <div>
                      <span className="text-xl">Order ID : {order.id}</span>{" "}
                    </div>
                    <div>
                      <span className="text-xl">Date : {order.date}</span> <br />
                    </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.brand} </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                  </div>
                  <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                    <div className="col-span-3">{order.lensType} </div>
                  </div>
                  <div className="grid pt-2 text-center text-2xl px-10 gap-2  grid-cols-5">
                    <p className="text-center font-bold"></p>
                    <p className="text-center font-bold">SPH</p>
                    <p className="text-center font-bold">CYL</p>
                    <p className="text-center font-bold">Axis</p>
                    <p className="text-center font-bold">Add</p>
                    <button
                      type="button"
                      className="inline-flex items-center cursor-default   bg-white px-2 py-2 text-2xl font-bold text-black  "
                    >
                      {order.eye_3 == 1
                        ? "R.E"
                        : order.eye_3 == 2
                          ? "L.E"
                          : "B.E"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.sph_3}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.cyl_3}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.axis_3}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.add_3}
                    </button>
                  </div>
                  <div className="grid pt-1 pl-4 grid-cols-2">
                    <div>
                      Ref ID : {order.refid && order.refid}
                      {order.refid_1 && order.refid_1}
                    </div>
                    <div className="text-center font-bold text-end  pr-12">
                      ({order.type})
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    +916364267806
                  </div>
                </div>
              )}
              {order.items >= 4 && (
                <div className="border-0 text-xl font-bold p-2 mx-0  pagebreak w-[37.5rem] h-[25rem] border-black">
                  <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                    {order.username}
                  </div>
                  <div className="grid gap-20 pt-1  text-xl pl-4 justify grid-cols-2">
                    <div>
                      <span className="text-xl">Order ID : {order.id}</span>{" "}
                    </div>
                    <div>
                      <span className="text-xl">Date : {order.date}</span> <br />
                    </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.brand} </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                  </div>
                  <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                    <div className="col-span-3">{order.lensType} </div>
                  </div>
                  <div className="grid pt-2 text-center text-2xl px-10 gap-2  grid-cols-5">
                    <p className="text-center font-bold"></p>
                    <p className="text-center font-bold">SPH</p>
                    <p className="text-center font-bold">CYL</p>
                    <p className="text-center font-bold">Axis</p>
                    <p className="text-center font-bold">Add</p>
                    <button
                      type="button"
                      className="inline-flex items-center cursor-default   bg-white px-2 py-2 text-2xl font-bold text-black  "
                    >
                      {order.eye_4 == 1
                        ? "R.E"
                        : order.eye_4 == 2
                          ? "L.E"
                          : "B.E"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.sph_4}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.cyl_4}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.axis_4}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.add_4}
                    </button>
                  </div>
                  <div className="grid pt-1 pl-4 grid-cols-2">
                    <div>
                      Ref ID : {order.refid && order.refid}
                      {order.refid_1 && order.refid_1}
                    </div>
                    <div className="text-center font-bold text-end  pr-12">
                      ({order.type})
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    +916364267806
                  </div>
                </div>
              )}
              {order.items >= 5 && (
                <div className="border-0 text-xl font-bold p-2  mx-0  pagebreak  w-[37.5rem] h-[25rem] border-black">
                  <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                    {order.username}
                  </div>
                  <div className="grid gap-20 pt-1  text-xl pl-4 justify grid-cols-2">
                    <div>
                      <span className="text-xl">Order ID : {order.id}</span>{" "}
                    </div>
                    <div>
                      <span className="text-xl">Date : {order.date}</span> <br />
                    </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.brand} </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                  </div>
                  <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                    <div className="col-span-3">{order.lensType} </div>
                  </div>
                  <div className="grid pt-2 text-center text-2xl px-10 gap-2  grid-cols-5">
                    <p className="text-center font-bold"></p>
                    <p className="text-center font-bold">SPH</p>
                    <p className="text-center font-bold">CYL</p>
                    <p className="text-center font-bold">Axis</p>
                    <p className="text-center font-bold">Add</p>
                    <button
                      type="button"
                      className="inline-flex items-center cursor-default   bg-white px-2 py-2 text-2xl font-bold text-black  "
                    >
                      {order.eye_5 == 1
                        ? "R.E"
                        : order.eye_5 == 2
                          ? "L.E"
                          : "B.E"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.sph_5}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.cyl_5}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.axis_5}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.add_5}
                    </button>
                  </div>
                  <div className="grid pt-1 pl-4 grid-cols-2">
                    <div>
                      Ref ID : {order.refid && order.refid}
                      {order.refid_1 && order.refid_1}
                    </div>
                    <div className="text-center font-bold text-end  pr-12">
                      ({order.type})
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    +916364267806
                  </div>
                </div>
              )}
              {order.items >= 6 && (
                <div className="border-0 text-xl font-bold p-2  mx-0  pagebreak  w-[37.5rem] h-[25rem] border-black">
                  <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                    {order.username}
                  </div>
                  <div className="grid gap-20 pt-1  text-xl pl-4 justify grid-cols-2">
                    <div>
                      <span className="text-xl">Order ID : {order.id}</span>{" "}
                    </div>
                    <div>
                      <span className="text-xl">Date : {order.date}</span> <br />
                    </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.brand} </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                  </div>
                  <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                    <div className="col-span-3">{order.lensType} </div>
                  </div>
                  <div className="grid pt-2 text-center text-2xl px-10 gap-2  grid-cols-5">
                    <p className="text-center font-bold"></p>
                    <p className="text-center font-bold">SPH</p>
                    <p className="text-center font-bold">CYL</p>
                    <p className="text-center font-bold">Axis</p>
                    <p className="text-center font-bold">Add</p>
                    <button
                      type="button"
                      className="inline-flex items-center cursor-default   bg-white px-2 py-2 text-2xl font-bold text-black  "
                    >
                      {order.eye_6 == 1
                        ? "R.E"
                        : order.eye_6 == 2
                          ? "L.E"
                          : "B.E"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.sph_6}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.cyl_6}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.axis_6}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.add_6}
                    </button>
                  </div>
                  <div className="grid pt-1 pl-4 grid-cols-2">
                    <div>
                      Ref ID : {order.refid && order.refid}
                      {order.refid_1 && order.refid_1}
                    </div>
                    <div className="text-center font-bold text-end  pr-12">
                      ({order.type})
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    +916364267806
                  </div>
                </div>
              )}
              {order.items >= 7 && (
                <div className="border-0 text-xl font-bold p-2  mx-0  pagebreak w-[37.5rem] h-[25rem] border-black">
                  <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                    {order.username}
                  </div>
                  <div className="grid gap-20 pt-1  text-xl pl-4 justify grid-cols-2">
                    <div>
                      <span className="text-xl">Order ID : {order.id}</span>{" "}
                    </div>
                    <div>
                      <span className="text-xl">Date : {order.date}</span> <br />
                    </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.brand} </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                  </div>
                  <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                    <div className="col-span-3">{order.lensType} </div>
                  </div>
                  <div className="grid pt-2 text-center text-2xl px-10 gap-2  grid-cols-5">
                    <p className="text-center font-bold"></p>
                    <p className="text-center font-bold">SPH</p>
                    <p className="text-center font-bold">CYL</p>
                    <p className="text-center font-bold">Axis</p>
                    <p className="text-center font-bold">Add</p>
                    <button
                      type="button"
                      className="inline-flex items-center cursor-default   bg-white px-2 py-2 text-2xl font-bold text-black  "
                    >
                      {order.eye_7 == 1
                        ? "R.E"
                        : order.eye_7 == 2
                          ? "L.E"
                          : "B.E"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.sph_7}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.cyl_7}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.axis_7}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.add_7}
                    </button>
                  </div>
                  <div className="grid pt-1 pl-4 grid-cols-2">
                    <div>
                      Ref ID : {order.refid && order.refid}
                      {order.refid_1 && order.refid_1}
                    </div>
                    <div className="text-center font-bold text-end  pr-12">
                      ({order.type})
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    +916364267806
                  </div>
                </div>
              )}
              {order.items >= 8 && (
                <div className="border-0 text-xl font-bold p-2  mx-0  pagebreak  w-[37.5rem] h-[25rem] border-black">
                  <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                    {order.username}
                  </div>
                  <div className="grid gap-20 pt-1  text-xl pl-4 justify grid-cols-2">
                    <div>
                      <span className="text-xl">Order ID : {order.id}</span>{" "}
                    </div>
                    <div>
                      <span className="text-xl">Date : {order.date}</span> <br />
                    </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.brand} </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                  </div>
                  <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                    <div className="col-span-3">{order.lensType} </div>
                  </div>
                  <div className="pl-4 pt-2  justify-center grid grid-cols-4 text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                    <div className="col-span-3">{order.lensType} </div>
                    <div>{order.color}</div>
                  </div>
                  <div className="grid pt-2 text-center text-2xl px-10 gap-2  grid-cols-5">
                    <p className="text-center font-bold"></p>
                    <p className="text-center font-bold">SPH</p>
                    <p className="text-center font-bold">CYL</p>
                    <p className="text-center font-bold">Axis</p>
                    <p className="text-center font-bold">Add</p>
                    <button
                      type="button"
                      className="inline-flex items-center cursor-default   bg-white px-2 py-2 text-2xl font-bold text-black  "
                    >
                      {order.eye_8 == 1
                        ? "R.E"
                        : order.eye_8 == 2
                          ? "L.E"
                          : "B.E"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.sph_8}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.cyl_8}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.axis_8}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.add_8}
                    </button>
                  </div>
                  <div className="grid pt-1 pl-4 grid-cols-2">
                    <div>
                      Ref ID : {order.refid && order.refid}
                      {order.refid_1 && order.refid_1}
                    </div>
                    <div className="text-center font-bold text-end  pr-12">
                      ({order.type})
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    +916364267806
                  </div>
                </div>
              )}
              {order.items >= 9 && (
                <div className="border-0 text-xl font-bold p-2  mx-0  pagebreak w-[37.5rem] h-[25rem] border-black">
                  <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                    {order.username}
                  </div>
                  <div className="grid gap-20 pt-1  text-xl pl-4 justify grid-cols-2">
                    <div>
                      <span className="text-xl">Order ID : {order.id}</span>{" "}
                    </div>
                    <div>
                      <span className="text-xl">Date : {order.date}</span> <br />
                    </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.brand} </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                  </div>
                  <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                    <div className="col-span-3">{order.lensType} </div>
                  </div>
                  <div className="pl-4 pt-2  justify-center grid grid-cols-4 text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                    <div className="col-span-3">{order.lensType} </div>
                    <div>{order.color}</div>
                  </div>
                  <div className="grid pt-2 text-center text-2xl px-10 gap-2  grid-cols-5">
                    <p className="text-center font-bold"></p>
                    <p className="text-center font-bold">SPH</p>
                    <p className="text-center font-bold">CYL</p>
                    <p className="text-center font-bold">Axis</p>
                    <p className="text-center font-bold">Add</p>
                    <button
                      type="button"
                      className="inline-flex items-center cursor-default   bg-white px-2 py-2 text-2xl font-bold text-black  "
                    >
                      {order.eye_9 == 1
                        ? "R.E"
                        : order.eye_9 == 2
                          ? "L.E"
                          : "B.E"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.sph_9}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.cyl_9}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.axis_9}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.add_9}
                    </button>
                  </div>
                  <div className="grid pt-1 pl-4 grid-cols-2">
                    <div>
                      Ref ID : {order.refid && order.refid}
                      {order.refid_1 && order.refid_1}
                    </div>
                    <div className="text-center font-bold text-end  pr-12">
                      ({order.type})
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    +916364267806
                  </div>
                </div>
              )}
              {order.items >= 10 && (
                <div className="border-0 text-xl font-bold p-2  mx-0  pagebreak w-[37.5rem] h-[25rem] border-black">
                  <div className="flex uppercase items-center justify-center gap-5 pt-2 font-bold text-2xl ">
                    {order.username}
                  </div>
                  <div className="grid gap-20 pt-1  text-xl pl-4 justify grid-cols-2">
                    <div>
                      <span className="text-xl">Order ID : {order.id}</span>{" "}
                    </div>
                    <div>
                      <span className="text-xl">Date : {order.date}</span> <br />
                    </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.brand} </div>
                  </div>
                  <div className="pl-4 pt-1  justify-center flex gap-2  text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                  </div>
                  <div className="pl-4  justify-center flex gap-2  text-2xl text-center">
                    <div className="col-span-3">{order.lensType} </div>
                  </div>
                  <div className="pl-4 pt-2  justify-center grid grid-cols-4 text-2xl text-center">
                    <div>{order.material} </div>
                    <div>{order.index} </div>
                    <div>{order.baseTint}</div>
                    <div>{order.coatingType} </div>
                    <div className="col-span-3">{order.lensType} </div>
                    <div>{order.color}</div>
                  </div>
                  <div className="grid pt-2 text-center text-2xl px-10 gap-2  grid-cols-5">
                    <p className="text-center font-bold"></p>
                    <p className="text-center font-bold">SPH</p>
                    <p className="text-center font-bold">CYL</p>
                    <p className="text-center font-bold">Axis</p>
                    <p className="text-center font-bold">Add</p>
                    <button
                      type="button"
                      className="inline-flex items-center cursor-default   bg-white px-2 py-2 text-2xl font-bold text-black  "
                    >
                      {order.eye_10 == 1
                        ? "R.E"
                        : order.eye_10 == 2
                          ? "L.E"
                          : "B.E"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.sph_10}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.cyl_10}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.axis_10}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-2 border-black bg-white px-2 py-2 text-2xl font-bold text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {order.add_10}
                    </button>
                  </div>
                  <div className="grid pt-1 pl-4 grid-cols-2">
                    <div>
                      Ref ID : {order.refid && order.refid}
                      {order.refid_1 && order.refid_1}
                    </div>
                    <div className="text-center font-bold text-end  pr-12">
                      ({order.type})
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    +916364267806
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
