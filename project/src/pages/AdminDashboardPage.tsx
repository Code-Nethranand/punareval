import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom v6
import { useAuthStore } from '../store/useAuthStore'; // Import useAuthStore
import { Edit, Trash, X, Check } from 'lucide-react';
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

interface RevaluationRequest {
  usn: string;
  subject: string;
  currentMarks: string;
  applicationDate: string;
  status: string;
}

const AdminDashboardPage: React.FC = () => {
  const adminName = "admin"; // Set the username as "admin"
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showRevaluationForm, setShowRevaluationForm] = useState(false);
  const [revaluationData, setRevaluationData] = useState([
    { usn: '1', subjectCode: 'CS101', subjectName: 'Programming', marks: 85, status: 'Pass', examDate: '2023-01-01' },
    { usn: '2', subjectCode: 'CS102', subjectName: 'Data Structures', marks: 78, status: 'Pass', examDate: '2023-01-01' },
  ]);
  const [evaluatingStudent, setEvaluatingStudent] = useState<any>(null);
  const [announcement, setAnnouncement] = useState<Announcement>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    link: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [examResult, setExamResult] = useState<ExamResult>({
    semester: '',
    examDate: new Date().toISOString().split('T')[0],
    examType: 'Regular',
    csvFile: null
  });
  const [isUploadingResult, setIsUploadingResult] = useState(false);
  const [revalFilter, setRevalFilter] = useState({
    usn: '',
    subject: '',
    status: ''
  });
  const [filteredRevalData, setFilteredRevalData] = useState<RevaluationRequest[]>([]);
  const navigate = useNavigate(); // Initialize useNavigate
  const logout = useAuthStore((state) => state.logout); // Get logout function from auth store
  const [filterUSN, setFilterUSN] = useState('');
  const [studentData, setStudentData] = useState([
    { usn: '1', subjectCode: 'CS101', subjectName: 'Computer Science', marks: 85, status: 'Pass', examDate: '2023-01-01' },
    { usn: '2', subjectCode: 'CS102', subjectName: 'Data Structures', marks: 78, status: 'Pass', examDate: '2023-01-01' },
  ]);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deleteStudent, setDeleteStudent] = useState<any>(null);

  // Fetch recent announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/announcements');
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to proper format
        const formattedData = data.map((item: any) => ({
          ...item,
          date: new Date(item.date).toISOString().split('T')[0]
        }));
        setRecentAnnouncements(formattedData);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    }
  };

  // Handle announcement submission
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...announcement,
          date: new Date(announcement.date).toISOString()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Announcement created successfully!');
        setAnnouncement({
          title: '',
          date: new Date().toISOString().split('T')[0],
          type: '',
          link: ''
        });
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

  // Handle announcement deletion
  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Announcement deleted successfully');
        fetchAnnouncements(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Error deleting announcement');
    }
  };

  // Fetch announcements on component mount
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

  const handleAddAnnouncementClick = () => {
    setActiveSection(activeSection === 'announcement' ? null : 'announcement');
    setAnnouncement({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: '',
      link: ''
    });
  };

  const handleRevaluationClick = () => {
    setActiveSection(activeSection === 'revaluation' ? null : 'revaluation');
  };

  const handleLogout = () => {
    logout(); // Clear authentication state
    navigate('/'); // Redirect to the homepage
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
  };

  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEvaluatingStudent((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveEvaluation = () => {
    // Save the evaluation details
    console.log("Saving evaluation for student:", evaluatingStudent);
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

  const handleRevalFilterChange = (field: string, value: string) => {
    setRevalFilter(prev => ({ ...prev, [field]: value }));
    const filteredData = revaluationData.filter(request => {
      if (field === 'usn') return request.usn.includes(value);
      if (field === 'subject') return request.subName.includes(value);
      if (field === 'status') return request.paymentStatus === value;
      return true;
    });
    setFilteredRevalData(filteredData);
  };

  const handleRevalAction = (request: RevaluationRequest, action: string) => {
    // Handle revaluation action
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
            onClick={() => setActiveSection(activeSection === 'result' ? null : 'result')}
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
            onClick={() => setActiveSection(activeSection === 'modifyDetails' ? null : 'modifyDetails')}
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
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Add Announcement</h2>
                  <p className="mt-2 text-gray-600">Create and manage important announcements</p>
                </div>
                <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
              </div>

              <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={announcement.title}
                      onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={announcement.date}
                      onChange={(e) => setAnnouncement({ ...announcement, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={announcement.type}
                    onChange={(e) => setAnnouncement({ ...announcement, type: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Result">Result</option>
                    <option value="Revaluation">Revaluation</option>
                    <option value="Notice">Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                  <input
                    type="url"
                    value={announcement.link}
                    onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="https://"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Announcement'}
                  </button>
                </div>
              </form>

              {/* Recent Announcements Section */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Announcements</h3>
                <div className="space-y-4">
                  {recentAnnouncements.map((item) => (
                    <div key={item._id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Date: {new Date(item.date).toLocaleDateString()}</span>
                            <span>Type: {item.type}</span>
                          </div>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <span>View Link</span>
                            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </a>
                        </div>
                        <button
                          onClick={() => item._id && handleDeleteAnnouncement(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {recentAnnouncements.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="mt-4 text-gray-500">No announcements yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'modifyDetails' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Modify Student Details</h2>
                  <p className="mt-2 text-gray-600">Update and manage student information</p>
                </div>
                <div className="h-16 w-16 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by USN</label>
                <div className="max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      value={filterUSN}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter USN to filter"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USN</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Date</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.usn}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.subjectCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.subjectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.marks}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            student.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.examDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            className={`inline-flex items-center text-blue-600 hover:text-blue-900 ${editStudent ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleEditClick(student)}
                            disabled={!!editStudent}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span>Edit</span>
                          </button>
                          <button
                            className="inline-flex items-center text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteClick(student)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="mt-4">No student records found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'revaluation' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Revaluation Requests</h2>
                  <p className="mt-2 text-gray-600">Manage and process revaluation applications</p>
                </div>
                <div className="h-16 w-16 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by USN</label>
                  <input
                    type="text"
                    value={revalFilter.usn}
                    onChange={(e) => handleRevalFilterChange('usn', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter USN"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
                  <input
                    type="text"
                    value={revalFilter.subject}
                    onChange={(e) => handleRevalFilterChange('subject', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter Subject"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <select
                    value={revalFilter.status}
                    onChange={(e) => handleRevalFilterChange('status', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USN</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Marks</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRevalData.map((request, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.usn}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.currentMarks}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.applicationDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                            onClick={() => handleRevalAction(request, 'approve')}
                            disabled={request.status !== 'Pending'}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            <span>Approve</span>
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                            onClick={() => handleRevalAction(request, 'reject')}
                            disabled={request.status !== 'Pending'}
                          >
                            <X className="h-4 w-4 mr-1" />
                            <span>Reject</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredRevalData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="mt-4">No revaluation requests found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'result' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Upload Results</h2>
                  <p className="mt-2 text-gray-600">Upload and manage student examination results</p>
                </div>
                <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Semester</label>
                    <select
                      value={examResult.semester}
                      onChange={(e) => setExamResult({ ...examResult, semester: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="">Select semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Exam Date</label>
                    <input
                      type="date"
                      value={examResult.examDate}
                      onChange={(e) => setExamResult({ ...examResult, examDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Exam Type</label>
                    <select
                      value={examResult.examType}
                      onChange={(e) => setExamResult({ ...examResult, examType: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="Regular">Regular</option>
                      <option value="Revaluation">Revaluation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Upload CSV File</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-300">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".csv"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">CSV files only</p>
                      </div>
                    </div>
                    {examResult.csvFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected file: {examResult.csvFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setExamResult({
                        semester: '',
                        examDate: new Date().toISOString().split('T')[0],
                        examType: 'Regular',
                        csvFile: null
                      })}
                      className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleResultSubmit}
                      disabled={isUploadingResult}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingResult ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : (
                        'Upload Results'
                      )}
                    </button>
                  </div>
                </div>
              </div>
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

      {evaluatingStudent && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setEvaluatingStudent(null)}
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
                onChange={() => {}}
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
