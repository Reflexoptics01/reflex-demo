import {
  collection,
  doc,
  getCountFromServer,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { data } from "../home";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

export default function Track(props) {
  var track = parseFloat(props.track);

  const [track1, setCourier] = useState(track.toString());
  var odid;
  odid = props.id;

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
  async function apply() {
    await updateDoc(doc(data, "orders", odid), {
      track:track1,
      tracking:true
    });
    
    const coll = collection(data, "log");
    const snapshot = await getCountFromServer(coll);
    const id = (snapshot.data().count + 101).toString();
    await setDoc(doc(data, "log", id), {
      change:
        "Track : " +
        track1 +
        " of " +
        odid,
       user: use,
            timestamp:Date.now()
    });
   
    alert("Updated Tracking ID")
  }
  return (
    <div className="flex justify-evenly">
      <td className="text-sm text-gray-900 font-light px-1 py-4 whitespace-nowrap">
        <div className=" w-28  sm:col-span-3">
          <input
            type="text"
            name="credits"
            id="credit"
            value={track1}
            onChange={(value) => {
              setCourier(value.target.value);
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
