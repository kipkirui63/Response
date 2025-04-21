Here's a detailed README file you can use for your React-based **AI Readiness Assessment Form** project:

---

# 🧠 AI Readiness Assessment Form

This is a sleek and interactive React application that helps organizations evaluate their AI readiness across multiple dimensions such as **Use Cases**, **Data Readiness**, **Technical Infrastructure**, and **Team Readiness**. It collects user responses, validates them, generates a downloadable PDF, and submits the data to a Google Sheets backend via Google Apps Script.

---

## 🚀 Features

- Beautiful and responsive UI built with **Tailwind CSS**
- Modular question format organized by sections
- **Real-time progress bar** based on form completion
- **Input validation** and visual error highlighting
- **Phone number formatting and validation** using `libphonenumber-js` and `cleave.js`
- PDF export of responses using `jsPDF`
- Submission to Google Sheets via **Google Apps Script**
- Local storage auto-save functionality

---

## 🛠️ Technologies Used

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)
- [cleave.js](https://nosir.github.io/cleave.js/)
- [Google Apps Script Web App](https://developers.google.com/apps-script/guides/web)

---

## 📁 Project Structure

```bash
.
├── public/
│   └── index.html
├── src/
│   ├── App.js      # Main app component
│   ├── index.js    # React entry point
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## 🧩 How It Works

1. **User fills out their contact details and questionnaire.**
2. **Form state is saved to `localStorage`** so progress is not lost on refresh.
3. **Progress bar updates** in real-time as fields are completed.
4. On submit:
   - Form is **validated**.
   - **Phone number is parsed and validated**.
   - Data is **sent to a Google Apps Script URL** (`FORM_URL`).
   - A **PDF file** of responses is generated and downloaded.
5. A **confirmation message** is shown to the user.

---

## 🔗 Deployment Instructions

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/ai-readiness-assessment.git
cd ai-readiness-assessment
```

2. **Install dependencies:**

```bash
npm install
```

3. **Run the app:**

```bash
npm start
```

4. **Build for production:**

```bash
npm run build
```

---

## 🔌 Google Sheets Integration

- A **Google Apps Script Web App** is used to receive form submissions and store them in Google Sheets.
- You can create your own [Apps Script Web App](https://developers.google.com/apps-script/guides/web) and update the `FORM_URL` accordingly.
- The script should accept a POST request and parse `application/x-www-form-urlencoded` data.

## 🙌 Contributing

Pull requests and feedback are welcome! If you’d like to improve UI/UX, add features, or fix bugs, feel free to fork and submit a PR.

---

## 📧 Contact

- **Team:** Crisp AI  
- **Email:** [contact@crispai.org](mailto:contact@crispai.org)

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
