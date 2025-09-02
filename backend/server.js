const express = require('express');
const Groq = require('groq-sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.use(cors());
app.use(express.json());

const systemPrompt = `
You are an expert resume builder. Your task is to generate and update a professional resume based on user requests.
- The output MUST be a single block of clean, well-formatted HTML.
- Use simple inline CSS for styling (e.g., <div style="font-family: Arial, sans-serif;">).
- Do not include any explanations, markdown, or anything outside of the HTML structure.
- The entire resume should be wrapped in a single parent <div> with an id of "resume-content".
- When the user asks for an update, take the previous HTML and their request, and return the FULL, NEW HTML of the resume.
`;

// CORRECTED: Routes do NOT have the /api prefix
app.post('/generate', async (req, res) => { 
    try {
        const { prompt } = req.body;
        console.log("Generating initial resume...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate a resume based on this information: ${prompt}` }
            ],
            model: "llama3-70b-8192",
        });
        const resumeHtml = chatCompletion.choices[0]?.message?.content || "";
        res.json({ html: resumeHtml });
    } catch (error) {
        console.error("Error generating resume:", error);
        res.status(500).send("Failed to generate resume.");
    }
});

// CORRECTED: Routes do NOT have the /api prefix
app.post('/chat', async (req, res) => { 
    try {
        const { currentHtml, message } = req.body;
        console.log("Updating resume...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Here is the current resume HTML: \n\n${currentHtml}\n\nPlease update it based on this instruction: "${message}"`
                }
            ],
            model: "llama3-70b-8192",
        });
        const updatedHtml = chatCompletion.choices[0]?.message?.content || "";
        res.json({ html: updatedHtml });
    } catch (error) {
        console.error("Error updating resume:", error);
        res.status(500).send("Failed to update resume.");
    }
});

// This allows Vercel to handle the server logic
module.exports = app;
