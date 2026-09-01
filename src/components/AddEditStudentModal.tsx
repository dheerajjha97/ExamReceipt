import React, { useState, useEffect } from 'react';
import { X, User, Save, Plus, Building } from 'lucide-react';
import { Student, CasteCategory, ExamType } from '../types';

interface AddEditStudentModalProps {
  isOpen: boolean;
  studentToEdit: Student | null;
  onClose: () => void;
  onSaveStudent: (studentData: Partial<Student>) => void;
  defaultOnlineCharge: number;
}

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  isOpen,
  studentToEdit,
  onClose,
  onSaveStudent,
  defaultOnlineCharge = 30,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    registrationNo: '',
    studentName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    casteCategory: 'General',
    examType: 'REGULAR',
    classOrStream: 'Intermediate Science (12th)',
    phone: '',
    baseFee: 1400,
    onlineCharges: defaultOnlineCharge,
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData(studentToEdit);
    } else {
      setFormData({
        registrationNo: `R-31337${Math.floor(1000 + Math.random() * 9000)}-25`,
        studentName: '',
        fatherName: '',
        motherName: '',
        dob: '10-10-2008',
        casteCategory: 'General',
        examType: 'REGULAR',
        classOrStream: 'Intermediate Science (12th)',
        phone: '91',
        baseFee: 1400,
        onlineCharges: defaultOnlineCharge,
      });
    }
  }, [studentToEdit, defaultOnlineCharge]);

  const handleCategoryChange = (cat: string) => {
    // Auto fee suggestion based on Bihar Board category rules
    const suggestedFee = (cat === 'SC' || cat === 'ST' || cat === 'EBC') ? 1140 : 1400;
    setFormData((prev) => ({
      ...prev,
      casteCategory: cat,
      baseFee: suggestedFee,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.registrationNo) return;

    const baseFee = Number(formData.baseFee) || 1400;
    const onlineCharges = Number(formData.onlineCharges) || defaultOnlineCharge;

    onSaveStudent({
      ...formData,
      studentName: formData.studentName?.toUpperCase().trim(),
      fatherName: formData.fatherName?.toUpperCase().trim(),
      motherName: formData.motherName?.toUpperCase().trim(),
      baseFee,
      onlineCharges,
      totalFee: baseFee + onlineCharges,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl max-w-xl w-full border border-[#E6E2D3] overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#4A453E] text-white px-6 py-4 flex items-center justify-between border-b border-[#3E3A33]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#5A5A40] text-[#E6E2D3] rounded-lg border border-[#737356]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FDFCF8]">
                {studentToEdit ? 'Edit Student Details' : 'Add New Student Record'}
              </h2>
              <p className="text-xs text-[#C2BEB5]">
                Board examination fee & registration record
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#C2BEB5] hover:text-white rounded-lg hover:bg-[#3E3A33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Registration Number *</label>
              <input
                type="text"
                required
                value={formData.registrationNo || ''}
                onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                placeholder="e.g. R-313370010-25"
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg font-mono text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Class / Stream *</label>
              <select
                value={formData.classOrStream || 'Intermediate Science (12th)'}
                onChange={(e) => setFormData({ ...formData, classOrStream: e.target.value })}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              >
                <option value="Intermediate Science (12th)">Intermediate Science (12th)</option>
                <option value="Intermediate Arts (12th)">Intermediate Arts (12th)</option>
                <option value="Intermediate Commerce (12th)">Intermediate Commerce (12th)</option>
                <option value="Matriculation (10th)">Matriculation (10th)</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-semibold text-[#4A453E]">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.studentName || ''}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="e.g. ANU KUMARI"
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Father's Name *</label>
              <input
                type="text"
                required
                value={formData.fatherName || ''}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="e.g. DHARMENDRA SINGH"
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Mother's Name *</label>
              <input
                type="text"
                required
                value={formData.motherName || ''}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                placeholder="e.g. PINKI DEVI"
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Date of Birth (DOB) *</label>
              <input
                type="text"
                value={formData.dob || ''}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                placeholder="DD-MM-YYYY (e.g. 12-10-2008)"
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg font-mono text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Caste Category *</label>
              <select
                value={formData.casteCategory || 'General'}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              >
                <option value="General">General (Fee ₹1400)</option>
                <option value="BC">BC (Fee ₹1400)</option>
                <option value="EBC">EBC (Fee ₹1140)</option>
                <option value="SC">SC (Fee ₹1140)</option>
                <option value="ST">ST (Fee ₹1140)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Exam Type *</label>
              <select
                value={formData.examType || 'REGULAR'}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              >
                <option value="REGULAR">REGULAR</option>
                <option value="EX-REGULAR">EX-REGULAR</option>
                <option value="IMPROVEMENT">IMPROVEMENT</option>
                <option value="COMPARTMENTAL">COMPARTMENTAL</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">WhatsApp Phone Number</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 919876543210"
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Base Exam Fee (₹) *</label>
              <input
                type="number"
                value={formData.baseFee || 1400}
                onChange={(e) => setFormData({ ...formData, baseFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Online Processing Charge (₹) *</label>
              <input
                type="number"
                value={formData.onlineCharges ?? defaultOnlineCharge}
                onChange={(e) => setFormData({ ...formData, onlineCharges: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

            {/* Exam Form Management Fields */}
            <div className="space-y-1 sm:col-span-2 pt-2 border-t border-[#E6E2D3]">
              <label className="block font-bold text-[#2E5B50]">Examination Form Collection & Submission Status</label>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Exam Form Status</label>
              <select
                value={formData.formIssueStatus || 'NOT_ISSUED'}
                onChange={(e) => setFormData({ ...formData, formIssueStatus: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              >
                <option value="NOT_ISSUED">Form Not Collected (Pending)</option>
                <option value="ISSUED">Blank Form Issued / Collected</option>
                <option value="SUBMITTED">Form & Fee Submitted (Complete)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#4A453E]">Exam Form Serial / Number</label>
              <input
                type="text"
                placeholder="e.g. EF-2026-0108"
                value={formData.formNo || ''}
                onChange={(e) => setFormData({ ...formData, formNo: e.target.value })}
                className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-mono focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              />
            </div>

          </div>

          <div className="p-3 bg-[#F7F5EE] border border-[#E6E2D3] rounded-xl text-[#4A453E] font-medium flex justify-between items-center text-xs">
            <span>Calculated Total Fee Amount:</span>
            <strong className="text-sm text-[#5A5A40] font-mono">
              ₹{(Number(formData.baseFee || 0) + Number(formData.onlineCharges || 30))}
            </strong>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E6E2D3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded-lg font-medium transition border border-[#DDD8C5]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg font-semibold shadow transition"
            >
              <Save className="w-4 h-4" />
              <span>{studentToEdit ? 'Save Changes' : 'Add Student Record'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
