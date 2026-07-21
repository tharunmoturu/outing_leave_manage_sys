import React, { createContext, useContext, useState } from 'react';

export type AcademicYear = 'E1' | 'E2' | 'E3' | 'E4' | 'All';

interface AcademicYearContextType {
  selectedYear: AcademicYear;
  setSelectedYear: (year: AcademicYear) => void;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export const AcademicYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYearState] = useState<AcademicYear>(() => {
    const stored = localStorage.getItem('selectedAcademicYear');
    return (stored as AcademicYear) || 'All';
  });

  const setSelectedYear = (year: AcademicYear) => {
    setSelectedYearState(year);
    localStorage.setItem('selectedAcademicYear', year);
  };

  return (
    <AcademicYearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </AcademicYearContext.Provider>
  );
};

export const useAcademicYear = () => {
  const context = useContext(AcademicYearContext);
  if (context === undefined) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
};
