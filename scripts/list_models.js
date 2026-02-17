const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load env directly to be sure
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let apiKey = '';
const lines = envContent.split('\n');
for (const line of lines) {
    if (line.trim().startsWith('GEMINI_API_KEY=')) {
        apiKey = line.split('=')[1].trim();
        break;
    }
}

if (apiKey.startsWith('"') && apiKey.endsWith('"')) apiKey = apiKey.slice(1, -1);

console.log(`Using Key: ${apiKey.substring(0, 5)}...`);

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // We can't list models directly with the SDK easily in all versions, 
        // but we can try to access the model list if the SDK supports it, 
        // or just try a standard 'gemini-pro' generation again with verbose logging.

        // Actually, the SDK doesn't expose listModels in the main entry point in older versions,
        // but let's try the direct fetch approach to be absolutely sure about the HTTP response.

        console.log("Attempting to list models via raw REST call...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error("Error Body:", errorText);
            return;
        }

        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.log("No models found in response.");
        }

    } catch (error) {
        console.error("Script Error:", error);
    }
}

listModels();
