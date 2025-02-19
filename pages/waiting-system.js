import { useState, useEffect } from 'react';
import { useAuth } from "../context/auth-context";
import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from "../components/firebase-config";

export default function WaitingSystem() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    city: '',
    gender: '',
    feeStatus: 'Unpaid'
  });

  useEffect(() => {
    fetchTodayPatients();
  }, []);

  const fetchTodayPatients = async () => {
    const collRef = collection(db, "patients");
    const today = new Date().toISOString().split('T')[0];
    const q = query(collRef, where("date", "==", today));
    const snapshot = await getDocs(q);
    const patientList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: new Date(doc.data().timestamp).toLocaleTimeString()
    }));
    setPatients(patientList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }
    try {
      const patientsRef = collection(db, "patients");
      const newPatient = {
        ...formData,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        status: 'waiting'
      };
      
      await addDoc(patientsRef, newPatient);
      setFormData({
        name: '',
        age: '',
        phone: '',
        city: '',
        gender: '',
        feeStatus: 'Unpaid'
      });
      fetchTodayPatients();
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Failed to add patient. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateFeeStatus = async (patientId, newStatus) => {
    try {
      const patientRef = doc(db, "patients", patientId);
      await updateDoc(patientRef, { feeStatus: newStatus });
      fetchTodayPatients();
    } catch (error) {
      console.error("Error updating fee status:", error);
      alert("Failed to update fee status. Please try again.");
    }
  };

  const deletePatient = async (patientId) => {
    try {
      const patientRef = doc(db, "patients", patientId);
      await deleteDoc(patientRef);
      fetchTodayPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Failed to delete patient. Please try again.");
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push('Name is required');
    if (!formData.age) errors.push('Age is required');
    if (!formData.phone.match(/^\d{10}$/)) errors.push('Valid phone number is required');
    if (!formData.city.trim()) errors.push('City is required');
    return errors;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Waiting System</h1>
          <p className="mt-2 text-sm text-gray-600">Manage patient queue efficiently</p>
        </div>

        {/* Patient Registration Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Age Field */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  required
                  min="0"
                  max="150"
                  value={formData.age}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* City Field */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Gender Field */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Fee Status */}
              <div>
                <label htmlFor="feeStatus" className="block text-sm font-medium text-gray-700">
                  Fee Status *
                </label>
                <select
                  name="feeStatus"
                  id="feeStatus"
                  value={formData.feeStatus}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add to Waiting List
              </button>
            </div>
          </form>
        </div>

        {/* Waiting List Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Current Waiting List</h2>
            <p className="mt-1 text-sm text-gray-500">
              {patients.length} {patients.length === 1 ? 'patient' : 'patients'} waiting
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token No.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient, index) => (
                  <tr key={patient.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        patient.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : patient.status === 'in-consultation'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {patient.status === 'completed' 
                          ? 'Completed'
                          : patient.status === 'in-consultation'
                          ? 'In Consultation'
                          : 'Waiting'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={patient.feeStatus}
                        onChange={(e) => updateFeeStatus(patient.id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded-full border-0 ${
                          patient.feeStatus === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      {patient.status === 'waiting' && (
                        <>
                          <button
                            onClick={() => updateFeeStatus(patient.id, patient.feeStatus === 'Paid' ? 'Unpaid' : 'Paid')}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Toggle Fee Status
                          </button>
                          <button
                            onClick={() => deletePatient(patient.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 