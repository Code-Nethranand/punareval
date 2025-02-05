import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRevaluationStore } from '../../store/useRevaluationStore';
import { Subject } from '../../types';
import { Button } from '../ui/Button';
import { formatPrice } from '../../lib/utils';
import { Check, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const SubjectSelection: React.FC = () => {
  const navigate = useNavigate();
  const { selectedSubjects, addSubject, removeSubject, calculateTotalFee } = useRevaluationStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/subjects');
        setSubjects(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load subjects. Please try again later.');
        toast.error('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const isSelected = (subjectId: string) =>
    selectedSubjects.some((s) => s.id === subjectId);

  const handleProceedToPayment = () => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }
    navigate('/dashboard/payment');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="text-red-500 text-lg font-medium">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold mb-2">Select Subjects for Revaluation</h2>
        <p className="text-gray-600">Choose the subjects you want to apply for revaluation</p>
      </div>

      <div className="space-y-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="flex items-center justify-between rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-lg">{subject.code}</span>
                <span className="text-gray-600">-</span>
                <span className="font-medium">{subject.name}</span>
              </div>
              <div className="text-sm text-gray-600 space-x-4">
                <span>Semester: {subject.semester}</span>
                <span>•</span>
                <span>Marks: {subject.marks}</span>
                <span>•</span>
                <span>Credits: {subject.credits}</span>
                <span>•</span>
                <span className="font-medium text-gray-900">Fee: {formatPrice(subject.fee)}</span>
              </div>
            </div>
            <Button
              variant={isSelected(subject.id) ? 'outline' : 'primary'}
              onClick={() =>
                isSelected(subject.id)
                  ? removeSubject(subject.id)
                  : addSubject(subject)
              }
              className="ml-4 min-w-[120px]"
            >
              {isSelected(subject.id) ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Select
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      {selectedSubjects.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <span className="text-gray-600">Selected Subjects: </span>
              <span className="font-medium">{selectedSubjects.length}</span>
              <span className="mx-4">|</span>
              <span className="text-gray-600">Total Fee: </span>
              <span className="font-medium">{formatPrice(calculateTotalFee())}</span>
            </div>
            <Button onClick={handleProceedToPayment} size="lg">
              Proceed to Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};