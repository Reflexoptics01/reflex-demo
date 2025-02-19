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
import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";

export default function Addreflex() {
  const auth = getAuth();
  var idd;
  const [image, setImage] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [use, setUser] = useState("");
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
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

  const imagechange2 = (e) => {
    setImage2(e.target.files[0]);
  };

  const imagechange3 = (e) => {
    setImage3(e.target.files[0]);
  };

  async function addretailer() {
    const querySnapshot = await getDocs(collection(data, "customprod"));
    const coll = collection(data, "customprod");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    if (count > 0) {
      const doc1 = querySnapshot.docs.slice(-1).forEach((doc) => {
        idd = doc.id.toString();
      });
    } else {
      idd = "100";
    }

    const id = parseInt(idd) + 3;
    const id1 = parseInt(idd) + 1;
    const id2 = parseInt(idd) + 2;
    const id3 = parseInt(idd) + 3;

    const imageref = ref(store, id1.toString());
    const imageref2 = ref(store, id2.toString());
    const imageref3 = ref(store, id3.toString());
    deleteObject(imageref)
      .then(() => { })
      .catch((error) => {
        console.log(error);
      });
    deleteObject(imageref2)
      .then(() => { })
      .catch((error) => {
        console.log(error);
      });
    deleteObject(imageref3)
      .then(() => { })
      .catch((error) => {
        console.log(error);
      });
    var urr;
    await uploadBytes(imageref, image).then(async () => {
      await uploadBytes(imageref2, image2).then(async () => {
        await uploadBytes(imageref3, image3).then(async () => {
          getDownloadURL(imageref).then(async (ur) => {
            console.log(ur);
            setUrl(ur);
            urr = ur;
            await setDoc(doc(data, "customprod", id.toString()), {
              id: id,
              name: name,
              details: details,
              price: price,
              url: urr,
              brand: brand,
              desc: desc,
            });
          });

          const coll2 = collection(data, "log");
          const snapshot1 = await getCountFromServer(coll2);
          const ids = (snapshot1.data().count + 101).toString();
          await setDoc(doc(data, "log", ids), {
            change: "Added Custom Product : " + "name:" + name,
            user: use,
            timestamp: Date.now()
          });

        });
      });
    });
    Router.push({
      pathname: "/pages/customproducts",
    });
  }

  return (
    <div className="grid grid-cols-1 justify-items-center">
      <div className="col-span-6 sm:col-span-3">
        <div className="bg-white w-screen shadow">
          <div className="mx-auto max-w-4xl py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
              Add Custom Product
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
                        Name
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
                        Brand
                      </label>
                      <input
                        type="text"
                        name="contact-no"
                        value={brand}
                        onChange={(value) => {
                          setBrand(value.target.value);
                        }}
                        id="contact-no"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="contact-no"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Details
                      </label>
                      <input
                        type="text"
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
                        htmlFor="contact-no"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <input
                        type="text"
                        name="contact-no"
                        value={desc}
                        onChange={(value) => {
                          setDesc(value.target.value);
                        }}
                        id="contact-no"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="gst-no"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Price
                      </label>
                      <input
                        type="text"
                        value={price}
                        onChange={(value) => {
                          setPrice(value.target.value);
                        }}
                        name="price"
                        id="price"
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
                      <input
                        type="file"
                        onChange={imagechange2}
                        id="Image"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <input
                        type="file"
                        onChange={imagechange3}
                        id="Image"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 cursor-pointer text-right sm:px-6">
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
