import Link from "next/link";

export default function Accounts() {
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-900 mb-8">Accounts</h1>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <Link href="/pages/retail" className="block">
              <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg p-6 transition duration-150 ease-in-out transform hover:-translate-y-1">
                <h2 className="text-xl font-semibold">Retail</h2>
                <p className="mt-2 text-indigo-100">Manage retail customer accounts</p>
              </div>
            </Link>

            <Link href="/pages/vendors" className="block">
              <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg p-6 transition duration-150 ease-in-out transform hover:-translate-y-1">
                <h2 className="text-xl font-semibold">Vendors</h2>
                <p className="mt-2 text-indigo-100">Manage vendor accounts and suppliers</p>
              </div>
            </Link>

            <Link href="/pages/internal" className="block">
              <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg p-6 transition duration-150 ease-in-out transform hover:-translate-y-1">
                <h2 className="text-xl font-semibold">Internal Users</h2>
                <p className="mt-2 text-indigo-100">Manage staff and internal accounts</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
