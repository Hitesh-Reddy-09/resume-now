// src/App.js
import React, { useState } from 'react';
import html2pdf from 'html2pdf.js'; // <-- NEW: Import the library
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [resumeHtml, setResumeHtml] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) {
      alert('Please enter a prompt!');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setResumeHtml(data.html);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate resume.');
    }
    setIsLoading(false);
  };

  const handleChat = async () => {
    if (!chatMessage || !resumeHtml) {
      alert('Please enter a change request.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHtml: resumeHtml,
          message: chatMessage,
        }),
      });
      const data = await response.json();
      setResumeHtml(data.html);
      setChatMessage('');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update resume.');
    }
    setIsLoading(false);
  };

  // --- NEW: Function to handle PDF download ---
  const handleDownloadPdf = () => {
    const element = document.getElementById('resume-to-print');
    
    const opt = {
      margin:       0.5,
      filename:     'resume.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>✨ AI Resume Builder</h1>
        <p>Describe your experience, and let AI create your resume. Then, chat to refine it!</p>
      </header>

      <main className="container">
        {!resumeHtml && !isLoading && (
          <div className="prompt-section">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., I am a full-stack developer with 3 years of experience in React, Node.js, and MongoDB..."
              rows="5"
            />
            <button onClick={handleGenerate}>Generate Resume</button>
          </div>
        )}

        {isLoading && <div className="loader">Building... 🤖</div>}

        {resumeHtml && !isLoading && (
          <div className="main-content">
            <div className="resume-viewer">
              <div className="controls">
                {/* --- CHANGED: Updated button to call the new PDF function --- */}
                <button onClick={handleDownloadPdf}>Download PDF</button>
              </div>
              {/* --- CHANGED: Wrapped the resume in a div with an ID --- */}
              <div id="resume-to-print" dangerouslySetInnerHTML={{ __html: resumeHtml }} />
            </div>

            <div className="chat-section">
              <h3>Refine Your Resume</h3>
              <p>Tell the AI what you want to change.</p>
              <div className="chat-box">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="e.g., 'Change my name to John Doe'"
                />
                <button onClick={handleChat}>Send</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
