import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

interface ImportPatientProps {
  onSelect: (patient: any) => void;
  onClose: () => void;
}

interface Patient {
  id: string;
  patientName: string;
  name: string;
  phone: string;
  phoneNo: string;
  age: string;
  gender: string;
  city: string;
  address: string;
  email: string;
  rightEye: any;
  leftEye: any;
  prescriptions: any[];
  lastExamDate: string;
  isCustomer?: boolean;
}

export default function ImportPatient({ onSelect, onClose }: ImportPatientProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // First fetch all patients
      const patientsRef = collection(db, "patients");
      const patientsSnapshot = await getDocs(patientsRef);
      
      // Create a map to store patient data with their examinations
      const patientsMap = new Map();
      
      // Get basic patient data
      patientsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.isCustomer) { // Filter out existing customers
          patientsMap.set(doc.id, {
            id: doc.id,
            patientName: data.patientName || data.name || '',
            name: data.patientName || data.name || '',
            phone: data.phone || data.phoneNo || '',
            phoneNo: data.phone || data.phoneNo || '',
            age: data.age || '',
            gender: data.gender || '',
            city: data.city || 'Unknown City',
            address: data.address || '',
            email: data.email || '',
            prescriptions: [],
            lastExamDate: ''
          });
        }
      });

      // Fetch examinations for all patients
      const examsRef = collection(db, "examinations");
      const examsSnapshot = await getDocs(examsRef);
      
      // Process examinations and add them to patient data
      examsSnapshot.docs.forEach(doc => {
        const examData = doc.data();
        const patientId = examData.patientId;
        
        if (patientsMap.has(patientId)) {
          const patient = patientsMap.get(patientId);
          const prescription = {
            date: examData.date,
            rightEye: examData.rightEye || {},
            leftEye: examData.leftEye || {},
            visualAcuityRight: examData.visualAcuityRight,
            visualAcuityLeft: examData.visualAcuityLeft,
            complaints: examData.complaints,
            diagnosis: examData.diagnosis,
            notes: examData.notes
          };
          
          patient.prescriptions.push(prescription);
          
          // Sort prescriptions by date and update last exam date
          patient.prescriptions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          patient.lastExamDate = patient.prescriptions[0]?.date || '';
          
          patientsMap.set(patientId, patient);
        }
      });

      setPatients(Array.from(patientsMap.values()));
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.name?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchQuery)
    );
  });

  const handleSelect = (patient: Patient) => {
    // Get the latest prescription
    const latestPrescription = patient.prescriptions[0];
    
    // Normalize the patient data for customer import
    const normalizedPatient = {
      ...patient,
      name: patient.patientName || patient.name,
      phoneNo: patient.phone || patient.phoneNo,
      prescriptions: patient.prescriptions,
      prescriptionNotes: latestPrescription ? 
        `RX: R ${latestPrescription.rightEye?.sph || ''}/${latestPrescription.rightEye?.cyl || ''} | L ${latestPrescription.leftEye?.sph || ''}/${latestPrescription.leftEye?.cyl || ''}` 
        : '',
      customerNotes: '',
      preferredFrameType: '',
      lastVisitDate: patient.lastExamDate || new Date().toISOString()
    };
    onSelect(normalizedPatient);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Import from Doctor&apos;s Patients</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Search Box */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Patients List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading patients...</p>
              </div>
            ) : filteredPatients.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelect(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-500">Phone: {patient.phone}</p>
                        {patient.age && (
                          <p className="text-sm text-gray-500">Age: {patient.age}</p>
                        )}
                        {patient.city && (
                          <p className="text-sm text-gray-500">City: {patient.city}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(patient);
                        }}
                        className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Import
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500 py-4">
                No patients found matching your search.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 