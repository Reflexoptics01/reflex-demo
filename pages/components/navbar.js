import { Fragment, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  CubeIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "../../context/auth-context";
import { collection, getDocs, query, where } from "firebase/firestore";
import { data } from "../home";
import { useState } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { user, Logout } = useAuth();
  const [navigation, setNavigation] = useState([
    { name: "Orders", href: "/home", current: true, icon: HomeIcon },
    { name: "Purchase Orders", href: "/purchase-orders", current: false, icon: ClipboardDocumentListIcon },
    { name: "Doctor Dashboard", href: "/doctor-dashboard", current: false, icon: UserGroupIcon },
    { name: "Accounts", href: "/pages/accounts", current: false, icon: UserGroupIcon },
    { name: "Products", href: "/pages/products", current: false, icon: CubeIcon },
    { name: "Waiting System", href: "/waiting-system", current: false, icon: ClipboardDocumentListIcon },
    { name: "Ledger", href: "/pages/ledger", current: false, icon: BookOpenIcon },
    { name: "Invoices", href: "/pages/Bills", current: false, icon: ClipboardDocumentListIcon },
    { name: "Resources", href: "/pages/resources", current: false, icon: DocumentTextIcon }
  ]);

  if (!user) return null;

  return (
    <>
      <div className="h-20 w-full"></div>
      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 w-auto no-print">
        <Disclosure as="nav">
          {({ open }) => (
            <>
              <div className="mx-auto px-2">
                <div className="relative">
                  {/* Desktop Navigation */}
                  <div className="hidden md:block">
                    <div className="flex items-center bg-white rounded-full shadow-lg px-6 py-2 space-x-3">
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                              setNavigation(nav =>
                                nav.map(navItem => ({
                                  ...navItem,
                                  current: navItem.name === item.name
                                }))
                              );
                            }}
                            className={classNames(
                              item.current
                                ? "bg-indigo-600 text-white"
                                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600",
                              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out flex items-center space-x-2"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                      <div className="h-6 w-px bg-gray-200 mx-2"></div>
                      <button
                        onClick={Logout}
                        className="p-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200 flex items-center space-x-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between bg-white rounded-full shadow-lg px-4 py-2">
                      <h1 className="text-xl font-bold text-indigo-600">Demo Pro</h1>
                      <Disclosure.Button className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile menu panel */}
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="md:hidden">
                  <div className="mt-2 bg-white rounded-2xl shadow-lg py-2 px-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Disclosure.Button
                          key={item.name}
                          as="a"
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-indigo-600 text-white"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600",
                            "flex items-center space-x-2 px-4 py-2 rounded-xl text-base font-medium transition-all duration-200 ease-in-out my-1"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Disclosure.Button>
                      );
                    })}
                    <div className="border-t border-gray-200 my-2"></div>
                    <Disclosure.Button
                      as="button"
                      onClick={Logout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sign Out</span>
                    </Disclosure.Button>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
}
