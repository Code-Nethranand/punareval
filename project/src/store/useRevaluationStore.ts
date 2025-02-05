import { create } from 'zustand';
import { Subject } from '../types';

interface RevaluationState {
  selectedSubjects: Subject[];
  isLoading: boolean;
  error: Error | null;
  addSubject: (subject: Subject) => void;
  removeSubject: (subjectId: string) => void;
  clearSubjects: () => void;
  calculateTotalFee: () => number;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useRevaluationStore = create<RevaluationState>((set, get) => ({
  selectedSubjects: [],
  isLoading: false,
  error: null,

  addSubject: (subject) => {
    set((state) => ({
      selectedSubjects: [...state.selectedSubjects, subject],
    }));
  },

  removeSubject: (subjectId) => {
    set((state) => ({
      selectedSubjects: state.selectedSubjects.filter((s) => s.id !== subjectId),
    }));
  },

  clearSubjects: () => {
    set({ selectedSubjects: [] });
  },

  calculateTotalFee: () => {
    const state = get();
    return state.selectedSubjects.reduce((total, subject) => total + subject.fee, 0);
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },
}));