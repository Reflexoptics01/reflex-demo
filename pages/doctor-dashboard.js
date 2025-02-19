import { useState, useEffect } from 'react';
import { useAuth } from "../context/auth-context";
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from "../components/firebase-config";
import AddPatient from './components/AddPatient';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalToday: 0,
    completed: 0,
    waiting: 0
  });
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [examData, setExamData] = useState({
    visualAcuityRight: '6/6',
    visualAcuityLeft: '6/6',
    iopRight: '',
    iopLeft: '',
    rightEye: {
      sph: '',
      cyl: '',
      axis: '',
      near: '',
      add: '',
      pd: ''
    },
    leftEye: {
      sph: '',
      cyl: '',
      axis: '',
      near: '',
      add: '',
      pd: ''
    },
    complaints: '',
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  // Fetch patients and stats on component mount
  useEffect(() => {
    fetchPatients();
    fetchTodayStats();
  }, []);

  const fetchPatients = async () => {
    const collRef = collection(db, "patients");
    const today = new Date().toISOString().split('T')[0];
    const q = query(collRef, where("date", "==", today));
    const snapshot = await getDocs(q);
    const patientList = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        name: data.name || 'Unknown',
        timestamp: new Date(data.timestamp).toLocaleTimeString()
      };
    });
    setPatients(patientList);
  };

  const fetchTodayStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const collRef = collection(db, "examinations");
    const q = query(collRef, where("date", "==", today));
    const snapshot = await getDocs(q);
    
    setStats({
      totalToday: snapshot.docs.length,
      completed: snapshot.docs.filter(doc => doc.data().status === 'completed').length,
      waiting: snapshot.docs.filter(doc => doc.data().status === 'waiting').length
    });
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    // Fetch existing exam data if available
    fetchExamData(patient.id);
  };

  const handleNextPatient = () => {
    const waitingPatients = patients.filter(p => p.status === 'waiting');
    if (waitingPatients.length > 0) {
      // If there's a currently selected patient, find the next one in queue
      if (selectedPatient) {
        const currentIndex = waitingPatients.findIndex(p => p.id === selectedPatient.id);
        const nextPatient = waitingPatients[currentIndex + 1] || waitingPatients[0];
        handlePatientSelect(nextPatient);
      } else {
        // If no patient is selected, select the first waiting patient
        handlePatientSelect(waitingPatients[0]);
      }
    }
  };

  const fetchExamData = async (patientId) => {
    const examRef = collection(db, "examinations");
    const q = query(examRef, where("patientId", "==", patientId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      setExamData({
        visualAcuityRight: data.visualAcuityRight || '6/6',
        visualAcuityLeft: data.visualAcuityLeft || '6/6',
        iopRight: data.iopRight || '',
        iopLeft: data.iopLeft || '',
        rightEye: data.rightEye || { sph: '', cyl: '', axis: '', near: '', add: '', pd: '' },
        leftEye: data.leftEye || { sph: '', cyl: '', axis: '', near: '', add: '', pd: '' },
        complaints: data.complaints || '',
        diagnosis: data.diagnosis || '',
        prescription: data.prescription || '',
        notes: data.notes || ''
      });
    } else {
      setExamData({
        visualAcuityRight: '6/6',
        visualAcuityLeft: '6/6',
        iopRight: '',
        iopLeft: '',
        rightEye: { sph: '', cyl: '', axis: '', near: '', add: '', pd: '' },
        leftEye: { sph: '', cyl: '', axis: '', near: '', add: '', pd: '' },
        complaints: '',
        diagnosis: '',
        prescription: '',
        notes: ''
      });
    }
  };

  const handleExamDataChange = (field, value) => {
    setExamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPower = (value) => {
    if (!value && value !== 0) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    const formatted = Math.abs(num) < 10 ? num.toFixed(2) : num.toString();
    return num >= 0 ? `+${formatted}` : formatted;
  };

  const calculateAdd = (near, sph) => {
    if ((!near && near !== 0) || (!sph && sph !== 0)) return '';
    const nearVal = parseFloat(near);
    const sphVal = parseFloat(sph);
    if (isNaN(nearVal) || isNaN(sphVal)) return '';
    return (nearVal - sphVal).toFixed(2);
  };

  const calculateNear = (add, sph) => {
    if ((!add && add !== 0) || (!sph && sph !== 0)) return '';
    const addVal = parseFloat(add);
    const sphVal = parseFloat(sph);
    if (isNaN(addVal) || isNaN(sphVal)) return '';
    return (addVal + sphVal).toFixed(2);
  };

  const handlePrescriptionChange = (eye, field, value) => {
    setExamData(prev => {
      const newData = { ...prev };
      const eyeData = newData[eye] || { sph: '', cyl: '', axis: '', near: '', add: '', pd: '' };
      newData[eye] = { ...eyeData, [field]: value };

      // Format the display value on blur
      if (field === 'near' && (newData[eye].sph || newData[eye].sph === 0)) {
        newData[eye].add = calculateAdd(value, newData[eye].sph);
      } else if (field === 'add' && (newData[eye].sph || newData[eye].sph === 0)) {
        newData[eye].near = calculateNear(value, newData[eye].sph);
      } else if (field === 'sph') {
        if (newData[eye].near || newData[eye].near === 0) {
          newData[eye].add = calculateAdd(newData[eye].near, value);
        } else if (newData[eye].add || newData[eye].add === 0) {
          newData[eye].near = calculateNear(newData[eye].add, value);
        }
      }

      if ((eye === 'rightEye' || eye === 'leftEye') && (field === 'sph' || field === 'cyl')) {
        const rSph = parseFloat(newData.rightEye.sph) || 0;
        const rCyl = parseFloat(newData.rightEye.cyl) || 0;
        const lSph = parseFloat(newData.leftEye.sph) || 0;
        const lCyl = parseFloat(newData.leftEye.cyl) || 0;

        let rightDiagnosis = [];
        if (rSph < 0) {
          rightDiagnosis.push('Myopia');
        } else if (rSph > 0) {
          rightDiagnosis.push('Hyperopia');
        } else {
          rightDiagnosis.push('Emmetropia');
        }
        if (Math.abs(rCyl) > 0.25) {
          rightDiagnosis.push('Astigmatism');
        }

        let leftDiagnosis = [];
        if (lSph < 0) {
          leftDiagnosis.push('Myopia');
        } else if (lSph > 0) {
          leftDiagnosis.push('Hyperopia');
        } else {
          leftDiagnosis.push('Emmetropia');
        }
        if (Math.abs(lCyl) > 0.25) {
          leftDiagnosis.push('Astigmatism');
        }

        newData.diagnosis = `Right Eye: ${rightDiagnosis.join(', ')} | Left Eye: ${leftDiagnosis.join(', ')}`;
      }

      return newData;
    });
  };

  const saveExamData = async () => {
    if (!selectedPatient) return;

    const examRef = collection(db, "examinations");
    const today = new Date().toISOString().split('T')[0];
    
    await addDoc(examRef, {
      ...examData,
      patientId: selectedPatient.id,
      date: today,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });

    // Update patient status
    const patientRef = doc(db, "patients", selectedPatient.id);
    await updateDoc(patientRef, {
      status: 'completed'
    });

    // Refresh data
    fetchPatients();
    fetchTodayStats();
    setSelectedPatient(null);
  };

  // NEW: Function to delete a patient from Firestore
  const deletePatient = async (patientId) => {
    try {
      await deleteDoc(doc(db, "patients", patientId));
      if (selectedPatient && selectedPatient.id === patientId) {
        setSelectedPatient(null);
      }
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  // NEW: Function to generate and print patient medical report
  const handlePrint = () => {
    if (!selectedPatient) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Patient Medical Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 2em; margin-bottom: 5px; }
          .header h2 { font-size: 1.5em; margin-top: 0; }
          .section { margin-bottom: 20px; }
          .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .patient-info { display: flex; justify-content: space-between; align-items: flex-start; }
          .patient-info .date { text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table th, table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Patient Medical Report</h1>
          <h2>${selectedPatient?.name || 'Unknown'}</h2>
        </div>
        <div class="section patient-info">
          <div>
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${selectedPatient?.name || 'Unknown'}</p>
            <p><strong>Age:</strong> ${selectedPatient.age}</p>
          </div>
          <div class="date">
            <p><strong>Date of Exam:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div class="section">
          <h3>Examination Data</h3>
          <p><strong>Visual Acuity (Right):</strong> ${examData.visualAcuityRight}</p>
          <p><strong>Visual Acuity (Left):</strong> ${examData.visualAcuityLeft}</p>
          <p><strong>IOP (Right):</strong> ${examData.iopRight}</p>
          <p><strong>IOP (Left):</strong> ${examData.iopLeft}</p>
        </div>
        <div class="section">
          <h3>Prescription Details</h3>
          <table>
            <thead>
              <tr>
                <th>Eye</th>
                <th>SPH</th>
                <th>CYL</th>
                <th>AXIS</th>
                <th>NEAR</th>
                <th>ADD</th>
                <th>PD</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Right</td>
                <td>${examData.rightEye.sph || ''}</td>
                <td>${examData.rightEye.cyl || ''}</td>
                <td>${examData.rightEye.axis || ''}</td>
                <td>${examData.rightEye.near || ''}</td>
                <td>${examData.rightEye.add || ''}</td>
                <td>${examData.rightEye.pd || ''}</td>
              </tr>
              <tr>
                <td>Left</td>
                <td>${examData.leftEye.sph || ''}</td>
                <td>${examData.leftEye.cyl || ''}</td>
                <td>${examData.leftEye.axis || ''}</td>
                <td>${examData.leftEye.near || ''}</td>
                <td>${examData.leftEye.add || ''}</td>
                <td>${examData.leftEye.pd || ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="section">
          <h3>Additional Information</h3>
          <p><strong>Complaints:</strong> ${examData.complaints}</p>
          <p><strong>Diagnosis:</strong> ${examData.diagnosis}</p>
          <p><strong>Prescription:</strong> ${examData.prescription}</p>
          <p><strong>Notes:</strong> ${examData.notes}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const filteredPatients = patients.filter(patient => 
    (patient && patient.name ? patient.name.toLowerCase() : "").includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Patient List */}
          <div className="col-span-12 lg:col-span-4">
            {showAddPatient ? (
              <AddPatient
                onPatientAdded={() => { fetchPatients(); setShowAddPatient(false); }}
                onClose={() => setShowAddPatient(false)}
              />
            ) : (
              <button
                onClick={() => setShowAddPatient(true)}
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add New Patient
              </button>
            )}
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Waiting List</h2>
                <button
                  onClick={handleNextPatient}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Next Patient
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-indigo-50 border-2 border-indigo-500'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{patient?.name || 'Unknown'}</h3>
                        <p className="text-sm text-gray-500">Age: {patient.age}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          patient.feeStatus === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.feeStatus}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{patient.timestamp}</p>
                        <button onClick={(e) => { e.stopPropagation(); deletePatient(patient.id); }} className="text-red-500 text-xs mt-1">Delete</button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        patient.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status === 'completed' ? 'Completed' : 'Waiting'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Today&apos;s Statistics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-indigo-600">{stats.totalToday}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-yellow-600">{stats.waiting}</p>
                  <p className="text-sm text-gray-500">Waiting</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Examination Details */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {selectedPatient ? `Examination Details - ${selectedPatient?.name || 'Unknown'}` : 'Select a patient'}
              </h2>
              
              {selectedPatient ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Visual Acuity (Right)</h3>
                      <select
                        value={examData.visualAcuityRight}
                        onChange={(e) => handleExamDataChange('visualAcuityRight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="6/60">6/60</option>
                        <option value="6/36">6/36</option>
                        <option value="6/24">6/24</option>
                        <option value="6/18">6/18</option>
                        <option value="6/12">6/12</option>
                        <option value="6/9">6/9</option>
                        <option value="6/6">6/6</option>
                      </select>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Visual Acuity (Left)</h3>
                      <select
                        value={examData.visualAcuityLeft}
                        onChange={(e) => handleExamDataChange('visualAcuityLeft', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="6/60">6/60</option>
                        <option value="6/36">6/36</option>
                        <option value="6/24">6/24</option>
                        <option value="6/18">6/18</option>
                        <option value="6/12">6/12</option>
                        <option value="6/9">6/9</option>
                        <option value="6/6">6/6</option>
                      </select>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">IOP (Right)</h3>
                      <input
                        type="number"
                        value={examData.iopRight}
                        onChange={(e) => handleExamDataChange('iopRight', e.target.value)}
                        placeholder="mmHg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">IOP (Left)</h3>
                      <input
                        type="number"
                        value={examData.iopLeft}
                        onChange={(e) => handleExamDataChange('iopLeft', e.target.value)}
                        placeholder="mmHg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Prescription Details</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eye</th>
                            <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SPH</th>
                            <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CYL</th>
                            <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AXIS</th>
                            <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NEAR</th>
                            <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ADD</th>
                            <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PD</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Right</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                value={examData.rightEye.sph}
                                onChange={(e) => handlePrescriptionChange('rightEye', 'sph', e.target.value)}
                                onBlur={(e) => {
                                  const formattedValue = formatPower(e.target.value);
                                  handlePrescriptionChange('rightEye', 'sph', formattedValue);
                                }}
                                step="0.25"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                value={examData.rightEye.cyl}
                                onChange={(e) => handlePrescriptionChange('rightEye', 'cyl', e.target.value)}
                                onBlur={(e) => {
                                  const formattedValue = formatPower(e.target.value);
                                  handlePrescriptionChange('rightEye', 'cyl', formattedValue);
                                }}
                                step="0.25"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="number"
                                value={examData.rightEye.axis}
                                onChange={(e) => handlePrescriptionChange('rightEye', 'axis', e.target.value)}
                                min="0"
                                max="180"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                value={examData.rightEye.near}
                                onChange={(e) => handlePrescriptionChange('rightEye', 'near', e.target.value)}
                                onBlur={(e) => {
                                  const formattedValue = formatPower(e.target.value);
                                  handlePrescriptionChange('rightEye', 'near', formattedValue);
                                }}
                                step="0.25"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                value={examData.rightEye.add}
                                onChange={(e) => handlePrescriptionChange('rightEye', 'add', e.target.value)}
                                onBlur={(e) => {
                                  const formattedValue = formatPower(e.target.value);
                                  handlePrescriptionChange('rightEye', 'add', formattedValue);
                                }}
                                step="0.25"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="number"
                                value={examData.rightEye.pd}
                                onChange={(e) => handlePrescriptionChange('rightEye', 'pd', e.target.value)}
                                onBlur={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value)) {
                                    handlePrescriptionChange('rightEye', 'pd', value.toFixed(1));
                                  }
                                }}
                                step="0.5"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Left</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                value={examData.leftEye.sph}
                                onChange={(e) => handlePrescriptionChange('leftEye', 'sph', e.target.value)}
                                onBlur={(e) => {
                                  const formattedValue = formatPower(e.target.value);
                                  handlePrescriptionChange('leftEye', 'sph', formattedValue);
                                }}
                                step="0.25"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                value={examData.leftEye.cyl}
                                onChange={(e) => handlePrescriptionChange('leftEye', 'cyl', e.target.value)}
                                onBlur={(e) => {
                                  const formattedValue = formatPower(e.target.value);
                                  handlePrescriptionChange('leftEye', 'cyl', formattedValue);
                                }}
                                step="0.25"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="number"
                                value={examData.leftEye.axis}
                                onChange={(e) => handlePrescriptionChange('leftEye', 'axis', e.target.value)}
                                onBlur={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    handlePrescriptionChange('leftEye', 'axis', value.toString());
                                  }
                                }}
                                min="0"
                                max="180"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                value={examData.leftEye.near}
                                onChange={(e) => handlePrescriptionChange('leftEye', 'near', e.target.value)}
                                onBlur={(e) => {
                                  const formattedValue = formatPower(e.target.value);
                                  handlePrescriptionChange('leftEye', 'near', formattedValue);
                                }}
                                step="0.25"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                value={examData.leftEye.add}
                                onChange={(e) => handlePrescriptionChange('leftEye', 'add', e.target.value)}
                                onBlur={(e) => {
                                  const formattedValue = formatPower(e.target.value);
                                  handlePrescriptionChange('leftEye', 'add', formattedValue);
                                }}
                                step="0.25"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <input
                                type="number"
                                value={examData.leftEye.pd}
                                onChange={(e) => handlePrescriptionChange('leftEye', 'pd', e.target.value)}
                                onBlur={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value)) {
                                    handlePrescriptionChange('leftEye', 'pd', value.toFixed(1));
                                  }
                                }}
                                step="0.5"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Patient&apos;s Complaints</h3>
                    <textarea
                      value={examData.complaints}
                      onChange={(e) => handleExamDataChange('complaints', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter patient's complaints and symptoms"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Diagnosis</h3>
                    <textarea
                      value={examData.diagnosis}
                      onChange={(e) => handleExamDataChange('diagnosis', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter diagnosis"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Drug Prescription</h3>
                    <textarea
                      value={examData.prescription}
                      onChange={(e) => handleExamDataChange('prescription', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Rx: Enter drug prescription"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h3>
                    <textarea
                      value={examData.notes}
                      onChange={(e) => handleExamDataChange('notes', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter any additional notes or observations"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-gray-300 border border-transparent rounded-md text-gray-800 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Print Report
                    </button>
                    <button
                      onClick={saveExamData}
                      className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save Examination
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Select a patient from the waiting list to begin examination</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 