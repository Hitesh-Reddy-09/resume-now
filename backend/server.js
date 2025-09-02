// server.js
const express = require('express');
const Groq = require('groq-sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5001; // Port for our backend server

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Middlewares
app.use(cors()); // Allows our frontend to make requests to our backend
app.use(express.json()); // Allows server to understand JSON data from requests

// --- The System Prompt ---
// This is our secret sauce. It tells the LLM exactly what we want.
const systemPrompt = `
You are an expert resume builder. Your task is to generate and update a professional resume based on user requests.
- The output MUST be a single block of clean, well-formatted HTML.
- Use simple inline CSS for styling (e.g., <div style="font-family: Arial, sans-serif;">).
- Do not include any explanations, markdown, or anything outside of the HTML structure.
- The entire resume should be wrapped in a single parent <div> with an id of "resume-content".
- When the user asks for an update, take the previous HTML and their request, and return the FULL, NEW HTML of the resume.
`;

// --- API Endpoints ---

// 1. Endpoint to GENERATE the initial resume
app.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("Generating initial resume with prompt:", prompt);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate a resume based on this information: ${prompt}` }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct", // You can use other models like llama3-70b-8192
        });

        const resumeHtml = chatCompletion.choices[0]?.message?.content || "";
        res.json({ html: resumeHtml });

    } catch (error) {
        console.error("Error generating resume:", error);
        res.status(500).send("Failed to generate resume.");
    }
});

// 2. Endpoint to CHAT and edit the resume
app.post('/chat', async (req, res) => {
    try {
        const { currentHtml, message } = req.body;
        console.log("Updating resume with message:", message);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Here is the current resume HTML: \n\n${currentHtml}\n\nPlease update it based on this instruction: "${message}"`
                }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
        });

        const updatedHtml = chatCompletion.choices[0]?.message?.content || "";
        res.json({ html: updatedHtml });

    } catch (error) {
        console.error("Error updating resume:", error);
        res.status(500).send("Failed to update resume.");
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});