import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Cpu } from 'lucide-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Cleave from 'cleave.js/react';

const FORM_URL = "https://script.google.com/macros/s/AKfycbziDBpsT463DavtBMfKO4ytjQlAd6ZmSNxs-eo7764L7NjdsTpog8szOe8zjCoFCVh4/exec";

const questions = [
  {
    section: 'Use Cases',
    items: [
      { name: 'q1', text: 'What is the main reason you’re considering AI in your organization?', options: ['Efficiency', 'Costs', 'Decision-making', 'Customer experience', 'Not sure'] },
      { name: 'q2', text: 'Do you already have areas or problems in mind where AI could help?', options: ['Yes', 'Somewhat', 'No'] }
    ]
  },
  {
    section: 'Data Readiness',
    items: [
      { name: 'q3', text: 'How is your organization’s data currently stored?', options: ['Digital', 'Mixed', 'Paper', 'Not sure'] },
      { name: 'q4', text: 'Do you have enough data available for AI to work with?', options: ['Yes', 'Partially', 'No', 'Not sure'] },
      { name: 'q5', text: 'Do you have data security or privacy measures in place?', options: ['Yes', 'Partially', 'No', 'Not sure'] }
    ]
  },
  {
    section: 'Technical Infrastructure',
    items: [
      { name: 'q6', text: 'Which tools or platforms do you currently use to manage operations?', options: ['Microsoft 365 / Google Workspace', 'CRM', 'ERP', 'None', 'Other'], type: 'checkbox' },
      { name: 'q7', text: 'Can your current systems support AI tools or integrations?', options: ['Yes', 'Somewhat', 'No', 'Not sure'] }
    ]
  },
  {
    section: 'Team Readiness',
    items: [
      { name: 'q8', text: 'Does your team have technical expertise or experience with automation?', options: ['Yes', 'Partially', 'No'] },
      { name: 'q9', text: 'Is there leadership support for AI initiatives in your organization?', options: ['Yes', 'Partially', 'No', 'Not sure'] },
      { name: 'q10', text: 'Are there resources (time, budget, staff) already allocated to AI projects?', options: ['Yes', 'In progress', 'No', 'Not sure'] },
      { name: 'q11', text: 'Is there any training program or plan to support AI-related skills?', options: ['Yes', 'In development', 'No'] }
    ]
  }
];

export default function App() {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const questionKeys = questions.flatMap(section => section.items.map(q => q.name));
  const [progress, setProgress] = useState(0);

  const isFormComplete =
    formData.name &&
    formData.email &&
    formData.Organization &&
    formData.contact &&
    questionKeys.every(key => formData[key] && formData[key] !== '');

  useEffect(() => {
    const saved = localStorage.getItem("ai-readiness-form");
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("ai-readiness-form", JSON.stringify(formData));
    const answered = Object.values(formData).filter((val) => val && val !== '').length;
    setProgress(Math.min(100, Math.floor((answered / (questionKeys.length + 4)) * 100)));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const values = formData[name] ? formData[name].split(', ') : [];
      const updated = checked ? [...values, value] : values.filter(v => v !== value);
      setFormData({ ...formData, [name]: updated.join(', ') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("AI Readiness Assessment Responses", 20, 20);
    let y = 30;
    Object.entries(formData).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 20, y);
      y += 10;
    });
    doc.save("AI_Readiness_Assessment.pdf");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = true;
    if (!formData.email || !formData.email.includes('@')) newErrors.email = true;
    if (!formData.Organization) newErrors.Organization = true;
    if (!formData.contact) newErrors.contact = true;

    questionKeys.forEach((key) => {
      if (!formData[key]) newErrors[key] = true;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setMessage("❗ Please fill out all required fields correctly.");
      const firstErrorKey = Object.keys(newErrors)[0];
      const firstEl = document.querySelector(`[name="${firstErrorKey}"]`);
      if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(formData.contact || '');
    if (!phoneNumber || !phoneNumber.isValid()) {
      setMessage("❗ Please enter a valid phone number in international format, e.g., +254... or +1...");
      return;
    }

    formData.contact = phoneNumber.formatInternational();
    const timestamp = new Date().toISOString();
    const formBody = new URLSearchParams({
      timestamp,
      name: formData.name || '',
      email: formData.email || '',
      contact: formData.contact || '',
      Organization: formData.Organization || '',
      ...questionKeys.reduce((acc, key) => {
        acc[key] = formData[key] || '';
        return acc;
      }, {})
    });

    try {
      const res = await fetch(FORM_URL, {
        method: 'POST',
        body: formBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (res.ok) {
        setMessage('✅ Thank you! Your responses have been submitted and emailed.');
        generatePDF();
        setFormData({});
      } else {
        setMessage('❌ Submission failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setMessage('⚠️ An error occurred. Please try again later.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans bg-blue-50 min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <Cpu className="text-sky-700 w-8 h-8" />
          <h1 className="text-3xl font-bold text-sky-800">AI Readiness Assessment</h1>
        </div>
        <p className="text-center text-gray-600 mb-6">Evaluate your organization's AI potential in just 3 minutes.</p>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
          <div
            className="bg-sky-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-sky-700 mb-4">Your Contact Details</h2>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
                onChange={handleChange}
                value={formData.name || ''}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
                onChange={handleChange}
                value={formData.email || ''}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-medium">Organization</label>
              <input
                type="text"
                name="Organization"
                className={`w-full p-2 border rounded ${errors.Organization ? 'border-red-500' : ''}`}
                onChange={handleChange}
                value={formData.Organization || ''}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-medium">Contact Number</label>
              <Cleave
                name="contact"
                className={`w-full p-2 border rounded ${errors.contact ? 'border-red-500' : ''}`}
                value={formData.contact || ''}
                options={{ prefix: '+', blocks: [15], numericOnly: true }}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {questions.map((section, sectionIdx) => (
            <div key={sectionIdx} className="bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-sky-700 mb-4">{section.section}</h2>
              {section.items.map((q, qIdx) => (
                <div key={qIdx} className="mb-5">
                  <p className="text-gray-800 font-medium mb-2">{q.text}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {q.options.map((option, optIdx) => {
                      const isSelected = q.type === 'checkbox'
                        ? formData[q.name]?.includes(option)
                        : formData[q.name] === option;

                      return (
                        <label
                          key={optIdx}
                          className={`border rounded-lg py-2 px-4 text-center cursor-pointer transition-colors duration-200 ${
                            isSelected
                              ? 'bg-sky-600 text-white border-sky-600'
                              : errors[q.name]
                              ? 'border-red-500 bg-red-50'
                              : 'bg-white text-gray-800 hover:bg-sky-100 border-gray-300'
                          }`}
                        >
                          <input
                            type={q.type === 'checkbox' ? 'checkbox' : 'radio'}
                            name={q.name}
                            value={option}
                            className="hidden"
                            onChange={handleChange}
                            checked={isSelected}
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <button
            type="submit"
            className="bg-sky-700 text-white px-6 py-3 rounded-lg text-lg hover:bg-sky-800 w-full"
          >
            Submit Assessment
          </button>

          {message && (
            <p className="mt-6 text-center text-lg font-semibold text-green-700 bg-green-100 p-4 rounded-lg">
              {message}
            </p>
          )}

      <button
        type="button"
        onClick={generatePDF}
        className={`px-6 py-3 rounded-lg text-lg mt-4 w-full border ${
          isFormComplete
            ? 'bg-white text-sky-700 border-sky-600 hover:bg-sky-100'
            : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
        }`}
        disabled={!isFormComplete}
      >
        📥 Download My Responses
      </button>
        </form>
      </div>

      <footer className="text-center text-gray-600 text-sm py-4 mt-10">
        © {new Date().getFullYear()} CRISP AI — contact@crispai.org
      </footer>
    </div>
  );
}