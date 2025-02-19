import Link from "next/link";

export default function Accounts() {
  return (
    <div>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
            Resources
          </h1>
        </div>
      </header>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
        <div className="rounded-md shadow">
          <Link
            href="/pages/blog"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            Blog
          </Link>
        </div>

        <div className="rounded-md shadow">
          <Link
            href="/pages/pricelist"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            Price List
          </Link>
        </div>
        <div className="rounded-md shadow">
          <Link
            href="/pages/youtube"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            Youtube Link
          </Link>
        </div>
        <div className="rounded-md shadow">
          <Link
            href="/pages/offers"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            Offers
          </Link>
        </div>
        <div className="rounded-md shadow">
          <Link
            href="/pages/optical-retailers"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            Optical Retailers
          </Link>
        </div>
      </main>
    </div>
  );
}
