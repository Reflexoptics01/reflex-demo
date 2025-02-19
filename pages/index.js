// eslint-disable-file no-use-before-define
import { useRef, useState, useEffect } from "react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function Index() {
  const router = useRouter();
  const { user, loading, Login, SignUp } = useAuth();
  const cancelButtonRef = useRef(null);

  // Group all useState hooks together
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [opticalName, setOpticalName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle redirect when user is logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/home");
    }
  }, [user, loading, router]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (!validateEmail(email)) {
        setErrorMessage('Please enter a valid email address');
        setOpen(true);
        return;
      }
      await Login(email, password);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.message || 'Invalid credentials');
      setOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (!email || !password || !name || !opticalName || !contactNumber || !purpose) {
        setErrorMessage('Required fields missing');
        setOpen(true);
        return;
      }

      if (!validateEmail(email)) {
        setErrorMessage('Please enter a valid email address');
        setOpen(true);
        return;
      }

      if (!validatePhoneNumber(contactNumber)) {
        setErrorMessage('Contact number must be 10 digits');
        setOpen(true);
        return;
      }

      if (whatsappNumber && !validatePhoneNumber(whatsappNumber)) {
        setErrorMessage('WhatsApp number must be 10 digits');
        setOpen(true);
        return;
      }

      // Create user with additional data
      await SignUp(email, password, {
        name,
        opticalName,
        address,
        city,
        contactNumber: `${countryCode}${contactNumber}`,
        whatsappNumber: whatsappNumber ? `${countryCode}${whatsappNumber}` : '',
        purpose,
      });

      // Clear form and switch to login
      setEmail('');
      setPassword('');
      setName('');
      setOpticalName('');
      setAddress('');
      setCity('');
      setContactNumber('');
      setWhatsappNumber('');
      setPurpose('');
      setIsLogin(true);
      
      // Show success message
      setErrorMessage('Account created successfully! Please login.');
      setOpen(true);

    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage(error.message || 'Failed to create account. Please try again.');
      setOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Sign in to access your account' : 'Join us to get started'}
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${!isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Sign Up
          </button>
        </div>
        <form className="mt-8 space-y-4" onSubmit={isLogin ? handleLogin : handleSignup}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Optical Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="opticalName"
                    value={opticalName}
                    onChange={(e) => setOpticalName(e.target.value)}
                    type="text"
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="Optical Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    type="text"
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="Address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    type="text"
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="mt-1 w-24 px-2 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+86">+86</option>
                      <option value="+81">+81</option>
                    </select>
                    <input
                      name="contactNumber"
                      value={contactNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setContactNumber(value);
                        }
                      }}
                      type="tel"
                      required
                      maxLength="10"
                      pattern="[0-9]{10}"
                      className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      placeholder="10 digit number"
                    />
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                      WhatsApp Number
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="mt-1 w-24 px-2 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+86">+86</option>
                        <option value="+81">+81</option>
                      </select>
                      <input
                        name="whatsappNumber"
                        value={whatsappNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 10) {
                            setWhatsappNumber(value);
                          }
                        }}
                        type="tel"
                        maxLength="10"
                        pattern="[0-9]{10}"
                        className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        placeholder="10 digit number"
                      />
                  <button
                    type="button"
                    onClick={() => setWhatsappNumber(contactNumber)}
                    className="self-end px-4 py-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 transition-all duration-300"
                  >
                    Same as Contact
                  </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Purpose of Use <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select Purpose of Use</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="manufacturing">Chain Stores</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email-address"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon
                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                  aria-hidden="true"
                />
              </span>
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign in' : 'Create Account'
              )}
            </button>
          </div>
        </form>

        <Transition.Root show={open} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            initialFocus={cancelButtonRef}
            onClose={setOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-lg font-medium leading-6 text-gray-900"
                          >
                            {errorMessage}
                          </Dialog.Title>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-300"
                        onClick={() => setOpen(false)}
                      >
                        Try Again
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </div>
  );
}