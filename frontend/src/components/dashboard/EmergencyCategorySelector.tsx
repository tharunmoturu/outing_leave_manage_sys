import React from 'react';

export const emergencyCategories = [
  'Medical Emergency',
  'Family Emergency',
  'Hospital Visit',
  'Legal / Police Matter',
  'College Official Work',
  'Other'
];

interface Props {
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  otherReason: string;
  onOtherReasonChange: (val: string) => void;
}

export const EmergencyCategorySelector: React.FC<Props> = ({ 
  selectedCategory, 
  onCategoryChange,
  otherReason,
  onOtherReasonChange
}) => {
  return (
    <>
      <div className="col-span-1 md:col-span-2 space-y-2">
         <label className="text-[14px] font-bold text-[var(--color-text-secondary)]">Emergency Category <span className="text-red-500">*</span></label>
         <select 
           value={selectedCategory}
           onChange={e => onCategoryChange(e.target.value)}
           className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white" 
         >
           <option value="" disabled>Select category</option>
           {emergencyCategories.map(cat => (
             <option key={cat} value={cat}>{cat}</option>
           ))}
         </select>
      </div>

      {selectedCategory === 'Other' && (
        <div className="col-span-1 md:col-span-2 space-y-2 animate-fadeIn">
           <label className="text-[14px] font-bold text-[var(--color-text-secondary)]">Specify Emergency <span className="text-red-500">*</span></label>
           <input 
             value={otherReason}
             onChange={e => onOtherReasonChange(e.target.value)}
             type="text" 
             className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" 
             placeholder="Please specify your emergency..." 
           />
        </div>
      )}
    </>
  );
};
