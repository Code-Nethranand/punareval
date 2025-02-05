import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom v6
import { useAuthStore } from '../store/useAuthStore'; // Import useAuthStore
import { Edit, Trash, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Announcement {
  _id?: string;
  title: string;
  date: string;
  type: "Announcement" | "Result" | "Revaluation" | "Notice";
  link: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormErrors {
  title?: string;
  date?: string;
  type?: string;
  link?: string;
}

interface ExamResult {
  semester: string;
  examDate: string;
  examType: string;
  csvFile: File | null;
}

const AdminDashboardPage: React.FC = () => {
  const adminName = "admin"; // Set the username as "admin"
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  const [showModifyDetailsForm, setShowModifyDetailsForm] = useState(false);
  const [showRevaluationForm, setShowRevaluationForm] = useState(false);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deleteStudent, setDeleteStudent] = useState<any>(null);
  const [revaluationData, setRevaluationData] = useState([
    { usn: '1', name: 'John Doe', subCode: 'CS101', subName: 'Computer Science', semester: '5', marks: 40, credits: 4, fees: 500, paymentStatus: 'Paid' },
    { usn: '2', name: 'Jane Smith', subCode: 'CS102', subName: 'Data Structures', semester: '5', marks: 35, credits: 4, fees: 500, paymentStatus: 'Pending' },
    // Add more dummy data as needed
  ]);
  const navigate = useNavigate(); // Initialize useNavigate
  const logout = useAuthStore((state) => state.logout); // Get logout function from auth store
  const [examDetails, setExamDetails] = useState({
    semester: '',
    examDate: ''
  });
  const [filterUSN, setFilterUSN] = useState('');
  const [studentData, setStudentData] = useState([
    { usn: '1', subjectCode: 'CS101', subjectName: 'Computer Science', marks: 85, status: 'Pass', examDate: '2023-01-01' },
    { usn: '2', subjectCode: 'CS102', subjectName: 'Data Structures', marks: 78, status: 'Pass', examDate: '2023-01-01' },
    // Add more dummy data as needed
  ]);
  const [showEvaluationDetailsForm, setShowEvaluationDetailsForm] = useState(false);
  const [evaluatingStudent, setEvaluatingStudent] = useState<any>(null);
  const [announcement, setAnnouncement] = useState<Announcement>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Announcement',
    link: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [examResult, setExamResult] = useState<ExamResult>({
    semester: '',
    examDate: new Date().toISOString().split('T')[0],
    examType: 'Regular',
    csvFile: null
  });
  const [isUploadingResult, setIsUploadingResult] = useState(false);

  // Fetch recent announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/announcements');
      if (response.ok) {
        const data = await response.json();
        setRecentAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!announcement.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }

    if (!announcement.date) {
      errors.date = 'Date is required';
      isValid = false;
    }

    if (!announcement.type) {
      errors.type = 'Type is required';
      isValid = false;
    }

    if (!announcement.link.trim()) {
      errors.link = 'Link is required';
      isValid = false;
    } else if (!isValidUrl(announcement.link)) {
      errors.link = 'Please enter a valid URL';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcement),
      });

      if (response.ok) {
        toast.success('Announcement created successfully!');
        setAnnouncement({
          title: '',
          date: new Date().toISOString().split('T')[0],
          type: 'Announcement',
          link: ''
        });
        setShowPreview(false);
        fetchAnnouncements(); // Refresh the announcements list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Error creating announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Announcement deleted successfully');
        fetchAnnouncements(); // Refresh the list
      } else {
        toast.error('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Error deleting announcement');
    }
  };

  const handleAddAnnouncementClick = () => {
    setActiveSection(activeSection === 'announcement' ? null : 'announcement');
    setAnnouncement({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Announcement',
      link: ''
    });
  };

  const handleResultClick = () => {
    setActiveSection(activeSection === 'result' ? null : 'result');
    setExamResult({
      semester: '',
      examDate: new Date().toISOString().split('T')[0],
      examType: 'Regular',
      csvFile: null
    });
  };

  const handleModifyDetailsClick = () => {
    setActiveSection(activeSection === 'modifyDetails' ? null : 'modifyDetails');
  };

  const handleRevaluationClick = () => {
    setActiveSection(activeSection === 'revaluation' ? null : 'revaluation');
  };

  const handleLogout = () => {
    logout(); // Clear authentication state
    navigate('/'); // Redirect to the homepage
  };

  const handleExamDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExamDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle CSV file upload
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterUSN(e.target.value);
  };

  const handleEditClick = (student: any) => {
    setEditStudent(student);
  };

  const handleDeleteClick = (student: any) => {
    setDeleteStudent(student);
  };

  const confirmDelete = () => {
    setStudentData((prev) => prev.filter((student) => student.usn !== deleteStudent.usn));
    setDeleteStudent(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditStudent((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    setStudentData((prev) =>
      prev.map((student) =>
        student.usn === editStudent.usn ? editStudent : student
      )
    );
    setEditStudent(null);
  };

  const handleEvaluateClick = (student: any) => {
    setEvaluatingStudent(student);
    setShowRevaluationForm(false);
    setShowEvaluationDetailsForm(true);
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle PDF file upload
  };

  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEvaluatingStudent((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveEvaluation = () => {
    // Save the evaluation details
    console.log("Saving evaluation for student:", evaluatingStudent);
    setShowEvaluationDetailsForm(false);
    setEvaluatingStudent(null);
  };

  const filteredData = studentData.filter(student => student.usn.includes(filterUSN));

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examResult.csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsUploadingResult(true);
    const formData = new FormData();
    formData.append('semester', examResult.semester);
    formData.append('examDate', examResult.examDate);
    formData.append('examType', examResult.examType);
    formData.append('csvFile', examResult.csvFile);

    try {
      const response = await fetch('http://localhost:3000/api/exams', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Results uploaded successfully!');
        setExamResult({
          semester: '',
          examDate: new Date().toISOString().split('T')[0],
          examType: 'Regular',
          csvFile: null
        });
        // Reset file input
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to upload results');
      }
    } catch (error) {
      console.error('Error uploading results:', error);
      toast.error('Error uploading results');
    } finally {
      setIsUploadingResult(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'text/csv') {
        toast.error('Please upload a CSV file');
        e.target.value = '';
        return;
      }
      setExamResult(prev => ({ ...prev, csvFile: file }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, Admin</h1>
          <p className="text-gray-600 mt-1">Manage your dashboard and perform administrative tasks</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-300 flex items-center gap-2"
        >
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Dashboard Cards */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Add Announcement</h3>
          <p className="text-gray-600 mb-4">Create new announcements</p>
          <button
            onClick={handleAddAnnouncementClick}
            className={`w-full py-2 px-4 rounded-lg transition duration-300 ${
              activeSection === 'announcement'
                ? 'bg-blue-800 text-white hover:bg-blue-900'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {activeSection === 'announcement' ? 'Close Form' : 'Add Announcement'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Upload Result</h3>
          <p className="text-gray-600 mb-4">Upload and manage exam results</p>
          <button
            onClick={handleResultClick}
            className={`w-full py-2 px-4 rounded-lg transition duration-300 ${
              activeSection === 'result'
                ? 'bg-green-800 text-white hover:bg-green-900'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {activeSection === 'result' ? 'Close Form' : 'Upload Result'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Modify Details</h3>
          <p className="text-gray-600 mb-4">Update student information</p>
          <button
            onClick={handleModifyDetailsClick}
            className={`w-full py-2 px-4 rounded-lg transition duration-300 ${
              activeSection === 'modifyDetails'
                ? 'bg-yellow-800 text-white hover:bg-yellow-900'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            {activeSection === 'modifyDetails' ? 'Close Form' : 'Modify Details'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Revaluation</h3>
          <p className="text-gray-600 mb-4">Manage revaluation requests</p>
          <button
            onClick={handleRevaluationClick}
            className={`w-full py-2 px-4 rounded-lg transition duration-300 ${
              activeSection === 'revaluation'
                ? 'bg-purple-800 text-white hover:bg-purple-900'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {activeSection === 'revaluation' ? 'Close Form' : 'View Requests'}
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mt-8">
        {activeSection === 'announcement' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Add Announcement</h2>
              <form onSubmit={handleAnnouncementSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={announcement.title}
                    onChange={(e) => {
                      setAnnouncement({ ...announcement, title: e.target.value });
                      setFormErrors({ ...formErrors, title: undefined });
                    }}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      formErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={announcement.date}
                    onChange={(e) => {
                      setAnnouncement({ ...announcement, date: e.target.value });
                      setFormErrors({ ...formErrors, date: undefined });
                    }}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      formErrors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={announcement.type}
                    onChange={(e) => {
                      setAnnouncement({ ...announcement, type: e.target.value as Announcement['type'] });
                      setFormErrors({ ...formErrors, type: undefined });
                    }}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      formErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Result">Result</option>
                    <option value="Revaluation">Revaluation</option>
                    <option value="Notice">Notice</option>
                  </select>
                  {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Link</label>
                  <input
                    type="url"
                    value={announcement.link}
                    onChange={(e) => {
                      setAnnouncement({ ...announcement, link: e.target.value });
                      setFormErrors({ ...formErrors, link: undefined });
                    }}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      formErrors.link ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com"
                  />
                  {formErrors.link && <p className="text-red-500 text-sm mt-1">{formErrors.link}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 w-full bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isSubmitting ? 'Creating...' : 'Create Announcement'}
                </button>
              </form>
            </div>

            {/* Recent Announcements Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Recent Announcements</h2>
              <div className="space-y-4">
                {recentAnnouncements.map((item) => (
                  <div key={item._id} className="border p-4 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-gray-600">Date: {new Date(item.date).toLocaleDateString()}</p>
                        <p className="text-gray-600">Type: {item.type}</p>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Link
                        </a>
                      </div>
                      <button
                        onClick={() => item._id && handleDeleteAnnouncement(item._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {recentAnnouncements.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No announcements yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'result' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Upload Result</h2>
            <form onSubmit={handleResultSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <input
                  type="text"
                  value={examResult.semester}
                  onChange={(e) => setExamResult(prev => ({ ...prev, semester: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Fall 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Exam Type</label>
                <select
                  value={examResult.examType}
                  onChange={(e) => setExamResult(prev => ({ ...prev, examType: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="Regular">Regular</option>
                  <option value="Supplementary">Supplementary</option>
                  <option value="Revaluation">Revaluation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Exam Date</label>
                <input
                  type="date"
                  value={examResult.examDate}
                  onChange={(e) => setExamResult(prev => ({ ...prev, examDate: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Results CSV File</label>
                <div className="mt-1 flex items-center">
                  <input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a CSV file containing student marks. Format: studentName, subjectCode, marks
                </p>
              </div>

              <button
                type="submit"
                disabled={isUploadingResult}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  isUploadingResult ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploadingResult ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload Results'
                )}
              </button>
            </form>
          </div>
        )}

        {activeSection === 'modifyDetails' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Modify Student Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Filter by USN</label>
              <input
                type="text"
                value={filterUSN}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter USN to filter"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USN</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((student, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.usn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.subjectCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.subjectName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.marks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.examDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex space-x-2">
                        <button
                          className={`text-blue-600 hover:text-blue-900 flex items-center ${editStudent ? 'blur-sm' : ''}`}
                          onClick={() => handleEditClick(student)}
                        >
                          <Edit className="h-5 w-5 mr-1" />
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 flex items-center"
                          onClick={() => handleDeleteClick(student)}
                        >
                          <Trash className="h-5 w-5 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'revaluation' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Revaluation Requests</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revaluationData.map((student, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.subCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.subName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.semester}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.marks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.credits}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.fees}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                          onClick={() => handleEvaluateClick(student)}
                        >
                          Evaluate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editStudent && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setEditStudent(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-semibold mb-4">Edit Student Details</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">USN</label>
              <input
                type="text"
                name="usn"
                value={editStudent.usn}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject Code</label>
              <input
                type="text"
                name="subjectCode"
                value={editStudent.subjectCode}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject Name</label>
              <input
                type="text"
                name="subjectName"
                value={editStudent.subjectName}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Marks</label>
              <input
                type="number"
                name="marks"
                value={editStudent.marks}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <input
                type="text"
                name="status"
                value={editStudent.status}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Exam Date</label>
              <input
                type="date"
                name="examDate"
                value={editStudent.examDate}
                onChange={handleEditChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="button"
              className="mt-4 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
              onClick={handleEditSave}
            >
              Save
            </button>
          </form>
        </div>
      )}

      {deleteStudent && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Confirm Deletion</h2>
          <p>Are you sure you want to delete the student with USN {deleteStudent.usn}?</p>
          <div className="mt-4 flex space-x-4">
            <button
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
              onClick={confirmDelete}
            >
              Delete
            </button>
            <button
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
              onClick={() => setDeleteStudent(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showEvaluationDetailsForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setShowEvaluationDetailsForm(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-semibold mb-4">Evaluate Student</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">USN</label>
              <input
                type="text"
                name="usn"
                value={evaluatingStudent.usn}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject Code</label>
              <input
                type="text"
                name="subjectCode"
                value={evaluatingStudent.subCode}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject Name</label>
              <input
                type="text"
                name="subjectName"
                value={evaluatingStudent.subName}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Marks</label>
              <input
                type="number"
                name="marks"
                value={evaluatingStudent.marks}
                onChange={handleMarksChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="button"
              className="mt-4 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
              onClick={handleSaveEvaluation}
            >
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
