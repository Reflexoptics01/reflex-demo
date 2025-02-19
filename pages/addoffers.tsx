import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { data } from "../home";
import { useState, useEffect } from "react";
import Router from "next/router";
import { getAuth } from "firebase/auth";
import { store } from "../home";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddYoutube() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [use, setUser] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUser(user.email);
    } else {
      // No user is signed in.
    }
  }, []);
  const imagechange = (e) => {
    setImage(e.target.files[0]);
  };
  async function addretailer() {
    var id;
    const querySnapshot = await getDocs(collection(data, "offers"));
    const coll = collection(data, "offers");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    if (count > 0) {
      const doc1 = querySnapshot.docs.slice(-1).forEach((doc) => {
        id = doc.id;
      });
    } else {
      id = "4000";
    }
    id = (parseInt(id) + 1).toString();
    const imageref = ref(store, id);
    await uploadBytes(imageref, image).then(() => {
      getDownloadURL(imageref).then(async (ur) => {
        await setDoc(doc(data, "offers", id), {
          id: id,
          name: name,
          details: details,
          url: ur,
        });
        const coll2 = collection(data, "log");
        const snapshot1 = await getCountFromServer(coll2);
        const ids = (snapshot1.data().count + 2001).toString();
        await setDoc(doc(data, "log", ids), {
          change: "Added Offer : " + "title:" + name,
           user: use,
            timestamp:Date.now()
        });
        Router.push({
          pathname: "/pages/offers",
        });
      });
      
    });
  }

  return (
    <div className="grid grid-cols-1 justify-items-center">
      <div className="col-span-6 sm:col-span-3">
        <div className="bg-white w-screen shadow">
          <div className="mx-auto max-w-4xl py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
              New Offer
            </h1>
          </div>
        </div>
      </div>
      <div className="pt-10   sm:mt-0">
        <div className=" md:gap-6">
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form action="#" method="POST">
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="bg-white px-4 py-5 sm:p-6">
                  <div className="grid  grid-cols-6 gap-6">
                    <div className="col-span-6 w-72 sm:col-span-3">
                      <label
                        htmlFor="business-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(value) => {
                          setName(value.target.value);
                        }}
                        name="name"
                        id="name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="contact-no"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        name="contact-no"
                        value={details}
                        onChange={(value) => {
                          setDetails(value.target.value);
                        }}
                        id="contact-no"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="balance"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Image
                      </label>
                      <input
                        type="file"
                        onChange={imagechange}
                        id="Image"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <a
                    type="submit"
                    onClick={() => {
                      addretailer();
                    }}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
