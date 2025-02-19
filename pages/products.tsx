import Link from "next/link";

export default function Products() {
  return (
    <div>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
            Products
          </h1>
        </div>
      </header>
      <main className="grid p-40 gap-20 grid-cols-8">
      <div className="rounded-md shadow col-span-4">
          <a
            type="submit"
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/spreadsheets/d/1roukt8Zvk12i1bKEKytqgmBJxjkw-ccbHYnlt95gFwA/edit#gid=966815955"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            Stock
          </a>
        </div>

        <div className="rounded-md shadow col-span-4">
          <a
            type="submit"
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/spreadsheets/d/1roukt8Zvk12i1bKEKytqgmBJxjkw-ccbHYnlt95gFwA/edit#gid=1614254063"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            Rx
          </a>
        </div>
        <div className="rounded-md shadow col-span-4">
          <a
            type="submit"
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/spreadsheets/d/1S8kqeIdEfbwMaE7fi83JYlAEo42XwamGrtFNN2eoTks/edit#gid=1736819487"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            All
          </a>
        </div>
        <div className="rounded-md shadow col-span-4">
          <a
            type="submit"
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/spreadsheets/d/1roukt8Zvk12i1bKEKytqgmBJxjkw-ccbHYnlt95gFwA/edit#gid=1809597077"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            Contact Lens
          </a>
        </div>
        <div className="rounded-md shadow col-span-4">
          <Link
            href="/pages/customproducts"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
          >
            Custom
          </Link>
        </div>
      </main>
    </div>
  );
}
