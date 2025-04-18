// AI Readiness React App with Country Picker, Phone Formatting, and Cleave Masking

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Cpu } from 'lucide-react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Cleave from 'cleave.js/react';

const FORM_URL = "https://script.google.com/macros/s/AKfycbwgMSVSDhTbeJQI-HjagVyD8CUwvzENaddGyUIXUY2J4PS2CFwwyESaMBsvM3NPlods/exec";

const countries = [
  { code: 'KE', name: 'Kenya' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' }
];

const questions = [
  // same questions object
];

export default function App() {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const totalQuestions = questions.reduce((sum, section) => sum + section.items.length + 4, 0);

  useEffect(() => {
    const answered = Object.values(formData).filter((val) => val && val !== '').length;
    setProgress(Math.min(100, Math.floor((answered / totalQuestions) * 100)));
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

    if (!formData.email || !formData.email.includes('@')) {
      setMessage("❗ Please enter a valid email address.");
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(formData.contact || '', formData.country);
    if (!phoneNumber || !phoneNumber.isValid()) {
      setMessage("❗ Please enter a valid phone number in international format, e.g., +254... or +1...");
      return;
    }

    formData.contact = phoneNumber.formatInternational();
    const timestamp = new Date().toISOString();
    const fullData = { ...formData, timestamp };
    const formBody = new URLSearchParams(fullData);

    try {
      const res = await fetch(FORM_URL, {
        method: 'POST',
        body: formBody,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
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
              <input type="text" name="name" className="w-full p-2 border rounded" onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-medium">Email Address</label>
              <input type="email" name="email" className="w-full p-2 border rounded" onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-medium">Organization</label>
              <input type="text" name="Organization" className="w-full p-2 border rounded" onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-medium">Country</label>
              <select name="country" className="w-full p-2 border rounded" onChange={handleChange} required>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-medium">Contact Number</label>
              <Cleave
                name="contact"
                placeholder="e.g. +254712345678"
                className="w-full p-2 border rounded"
                value={formData.contact || ''}
                options={{
                  prefix: '+',
                  phone: true,
                  phoneRegionCode: formData.country || 'KE',
                  delimiters: [],
                  blocks: [15],
                  numericOnly: true
                }}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {questions.map((section, sIdx) => (
            <div key={sIdx} className="bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-sky-700 mb-4">{section.section}</h2>
              {section.items.map((q, qIdx) => (
                <div key={qIdx} className="mb-5">
                  <p className="text-gray-800 font-medium mb-2">{q.text}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {q.options.map((option, i) => {
                      const isSelected = q.type === 'checkbox'
                        ? formData[q.name]?.includes(option)
                        : formData[q.name] === option;

                      return (
                        <label
                          key={i}
                          className={`border rounded-lg py-2 px-4 text-center cursor-pointer transition-colors duration-200 ${
                            isSelected ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-800 hover:bg-sky-100 border-gray-300'
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
            className="bg-white border border-sky-600 text-sky-700 hover:bg-sky-100 px-6 py-3 rounded-lg text-lg mt-4 w-full"
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
