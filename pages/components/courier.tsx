import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../../components/firebase-config";
import { data } from "../home";

export default function Courier(props) {
  var price = parseFloat(props.price);
  var extra = parseFloat(props.extra);
  var discount = parseFloat(props.discount);
  var courier = parseFloat(props.courier);


  const [extra1, setExtra] = useState(extra.toString());
  const [discount1, setDiscount] = useState(discount.toString());
  const [courier1, setCourier] = useState(courier.toString());
  var odid;
  odid = props.id;

  const [use, setUser] = useState("");
  const [phone, setPhone] = useState(props.phone);
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUser(user.email);
    } else {
      // No user is signed in.
    }
  }, []);
  async function apply() {
    var tot = (
      parseFloat(extra1) +
      price +
      parseFloat(courier1) -
      (parseFloat(discount1) *
        (price)) /
      100
    ).toString();
    const odRef = doc(data, "orders", odid);
    var cour1 = parseFloat(courier1);
    var disc1 = parseFloat(discount1);
    var ext1 = parseFloat(extra1);
    const docSnap = await getDoc(odRef);
    var data2 = docSnap.data();
        
      if ( data2.courier!= 0) {
        cour1 = parseFloat(courier1) - data2.courier;
      }
    
      if ( data2.disc!= 0) {
        disc1 = parseFloat(discount1) - data2.discount;
      }
      if ( data2.extra!= 0) {
        ext1 = parseFloat(extra1) - data2.extra;
      }
      var tot2 = (
        ext1 +
        price +
        cour1 -
        (disc1 *
          (price) /
        100))
      
    await updateDoc(odRef, {
      courier: courier1,
      discount: discount1,
      extra: extra1.toString(),
      total: tot,
    });
    const coll = collection(data, "log");
    const snapshot = await getCountFromServer(coll);
    const id = (snapshot.data().count + 101).toString();
    await setDoc(doc(data, "log", id), {
      change:
        "courier : " +
        courier1 +
        " + " +
        " Discount : " +
        discount1 +
        " + " +
        " Extra : " +
        extra1 +
        " of " +
        odid,
      user: use,
      timestamp: Date.now()
    });
    var idd;
    var bal;
    const userreff = collection(db, "retailers");
    const q = query(userreff, where("phoneNo", "==", phone));
    const querySnapshot = await getDocs(q);
    const doc1 = querySnapshot.docs.slice(-1).forEach((doc) => {
      idd = doc.id.toString();
      bal = doc.data()['balance']
    });
    console.log(parseFloat(bal))
    console.log(parseFloat(tot))
    console.log(price)
    var temp = parseFloat(bal) - tot2 + price;

    console.log(temp);
    await updateDoc(doc(data, "retailers", idd), {
      balance: temp.toString(),
    });
    await updateDoc(doc(data, "payment", odid), {
      balance: temp.toString(),
      price: tot.toString(),
    });
    alert("Updated payments")
  }
  return (
    <div className="flex justify-evenly">
      <td className="text-sm text-gray-900 font-light px-1 py-4 whitespace-nowrap">
        <div className=" w-14  sm:col-span-3">
          <input
            type="number"
            name="credits"
            id="credit"
            value={courier1}
            onChange={(value) => {
              setCourier(value.target.value);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </td>
      <td className="text-sm text-gray-900 font-light px-1 py-4 whitespace-nowrap">
        <div className=" w-14  sm:col-span-3">
          <input
            type="number"
            name="credits"
            id="credit"
            value={discount1}
            onChange={(value) => {
              setDiscount(value.target.value);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </td>
      <td className="text-sm text-gray-900 font-light px-1 py-4 whitespace-nowrap">
        <div className=" w-14  sm:col-span-3">
          <input
            type="number"
            name="credits"
            id="credit"
            value={extra1}
            onChange={(value) => {
              setExtra(value.target.value);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </td>
      <td className="text-sm text-gray-900 font-light px-1 py-4 whitespace-nowrap">
        <div className=" w-14  sm:col-span-3">
          <a
            onClick={() => {
              apply();
            }}
            className="flex mt-1 max-w-max cursor-pointer items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8  text-base font-medium text-white hover:bg-indigo-700 md:py-1 md:px-30 md:text-md"
          >
            Apply
          </a>
        </div>
      </td>
    </div>
  );
}
