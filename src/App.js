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
      {
        name: 'q1',
        text: 'What is the main reason you’re considering AI in your organization?',
        options: ['Efficiency', 'Costs', 'Decision-making', 'Customer experience', 'Not sure']
      },
      {
        name: 'q2',
        text: 'Do you already have areas or problems in mind where AI could help?',
        options: ['Yes', 'Somewhat', 'No']
      }
    ]
  },
  {
    section: 'Data Readiness',
    items: [
      {
        name: 'q3',
        text: 'How is your organization’s data currently stored?',
        options: ['Digital', 'Mixed', 'Paper', 'Not sure']
      },
      {
        name: 'q4',
        text: 'Do you have enough data available for AI to work with?',
        options: ['Yes', 'Partially', 'No', 'Not sure']
      },
      {
        name: 'q5',
        text: 'Do you have data security or privacy measures in place?',
        options: ['Yes', 'Partially', 'No', 'Not sure']
      }
    ]
  },
  {
    section: 'Technical Infrastructure',
    items: [
      {
        name: 'q6',
        text: 'Which tools or platforms do you currently use to manage operations?',
        options: ['Microsoft 365 / Google Workspace', 'CRM', 'ERP', 'None', 'Other'],
        type: 'checkbox'
      },
      {
        name: 'q7',
        text: 'Can your current systems support AI tools or integrations?',
        options: ['Yes', 'Somewhat', 'No', 'Not sure']
      }
    ]
  },
  {
    section: 'Team Readiness',
    items: [
      {
        name: 'q8',
        text: 'Does your team have technical expertise or experience with automation?',
        options: ['Yes', 'Partially', 'No']
      },
      {
        name: 'q9',
        text: 'Is there leadership support for AI initiatives in your organization?',
        options: ['Yes', 'Partially', 'No', 'Not sure']
      },
      {
        name: 'q10',
        text: 'Are there resources (time, budget, staff) already allocated to AI projects?',
        options: ['Yes', 'In progress', 'No', 'Not sure']
      },
      {
        name: 'q11',
        text: 'Is there any training program or plan to support AI-related skills?',
        options: ['Yes', 'In development', 'No']
      }
    ]
  }
];

export default function App() {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const questionKeys = questions.flatMap(section => section.items.map(q => q.name));
  const [progress, setProgress] = useState(0);

  const totalQuestions = questions.reduce((sum, section) => sum + section.items.length + 4, 0);

  useEffect(() => {
    const answered = Object.values(formData).filter((val) => val && val !== '').length;
    setProgress(Math.min(100, Math.floor((answered / totalQuestions) * 100)));
  }, [formData]);

  useEffect(() => {
    const saved = localStorage.getItem("ai-readiness-form");
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("ai-readiness-form", JSON.stringify(formData));
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

  const isFormComplete =
    formData.name &&
    formData.email &&
    formData.Organization &&
    formData.contact &&
    questionKeys.every(key => formData[key] && formData[key] !== '');

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
      {/* ... your header, progress bar, and form rendering ... */}

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
        📅 Download My Responses
      </button>
    </div>
  );
}
