import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { data } from "../home";
// eslint-disable-file no-use-before-define


export default function Log() {
  const [log, setLog] = useState([]);


  useEffect(() => {
    const collref = collection(data, "log");
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
  }, []);
  return (
    <>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
            Log
          </h1>
        </div>
      </header>
      <main>
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
                          Username
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                        >
                          Change
                        </th>
                       
                      </tr>
                    </thead>
                    <tbody>
                      {log.sort((a, b) => a.timestamp - b.timestamp).map((log) => {
                        return (
                          <tr
                            key={log.user}
                            className="bg-white bretail-b transition duration-300 ease-in-out hover:bg-gray-100"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {log.user}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              {log.change}
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
