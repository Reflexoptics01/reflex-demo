import { collection, doc, getCountFromServer, setDoc, updateDoc } from "firebase/firestore";
import { data } from "../home";
import { useState,useEffect } from "react";
import { getAuth } from "firebase/auth";

export default function Creaditchange(props) {
  var sets = props.credit;
  const [currstat, setCurrstat] = useState(sets);
  var odid;
  odid = props.id;
  const [use,setUser]=useState("")
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUser(user.email)
    } else {
      // No user is signed in.
    }
  }, []);
  async function textchange(stat) {
    const odRef = doc(data, "retailers", odid);
    setCurrstat(stat);
    await updateDoc(odRef, {
      credit: stat,
    });
    
    const coll = collection(data, "log");
    const snapshot = await getCountFromServer(coll);
    const id = (snapshot.data().count + 101).toString();
    await setDoc(doc(data, "log", id), {
      change: "credit : "+ stat +" of "+odid,
       user: use,
            timestamp:Date.now()
    });
  }
  return (
    <div className="col-span-6 sm:col-span-3">
      <input
        type="number"
        name="credits"
        id="credit"
        value={currstat}
        onChange={(value) => {
          textchange(value.target.value);
        }}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  );
}
