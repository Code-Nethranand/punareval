import React, { useState } from "react";
import { Search, Download, Filter } from "lucide-react";
import { Button } from "../ui/Button";

interface Result {
  id: string;
  subjectCode: string;
  subjectName: string;
  marks: number;
  maxMarks: number;
  status: "Pass" | "Fail";
  semester: number;
  examDate: string;
}

export const Result: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<number | "all">("all");

  // Example data - replace with actual API call
  const results: Result[] = [
    {
      id: "1",
      subjectCode: "18CS51",
      subjectName: "Management and Entrepreneurship",
      marks: 80,
      maxMarks: 100,
      status: "Pass",
      semester: 5,
      examDate: "2024-01-15"
    },
    {
      id: "2",
      subjectCode: "18CS52",
      subjectName: "Computer Networks",
      marks: 75,
      maxMarks: 100,
      status: "Pass",
      semester: 5,
      examDate: "2024-01-17"
    },
    {
      id: "3",
      subjectCode: "18CS53",
      subjectName: "Database Management System",
      marks: 85,
      maxMarks: 100,
      status: "Pass",
      semester: 5,
      examDate: "2024-01-19"
    },
    {
      id: "4",
      subjectCode: "18CS54",
      subjectName: "Operating Systems",
      marks: 85,
      maxMarks: 100,
      status: "Pass",
      semester: 5,
      examDate: "2024-01-19"
    },
    {
        id: "5",
      subjectCode: "18CS55",
      subjectName: "Computer Image Processing",
      marks: 85,
      maxMarks: 100,
      status: "Pass",
      semester: 5,
      examDate: "2024-01-19"
    },
    {
      id: "6",
      subjectCode: "18CS56",
      subjectName: "Data Structure",
      marks: 85,
      maxMarks: 100,
      status: "Pass",
      semester: 5,
      examDate: "2024-01-19"
    },
  ];


  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === "all" || result.semester === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  const semesters = Array.from(new Set(results.map(r => r.semester))).sort();

  const downloadResults = () => {
    // Implement CSV download functionality
    const csvContent = [
      ["Subject Code", "Subject Name", "Marks", "Max Marks", "Status", "Semester", "Exam Date"],
      ...filteredResults.map(r => [
        r.subjectCode,
        r.subjectName,
        r.marks,
        r.maxMarks,
        r.status,
        r.semester,
        r.examDate
      ])
    ].map(row => row.join(",")).join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Examination Results</h1>
        <p className="text-gray-600">View and analyze your academic performance</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by subject name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>

          <Button
            onClick={downloadResults}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.subjectCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.subjectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.marks}/{result.maxMarks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      result.status === "Pass" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.examDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No results found for your search criteria
        </div>
      )}
    </div>
  );
};
