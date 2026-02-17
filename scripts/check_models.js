const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load env directly
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

console.log(`Checking models for key: ${apiKey.substring(0, 5)}...`);

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status}`);
            return;
        }
        const data = await response.json();
        const logFile = path.resolve(__dirname, '../available_models.txt');
        fs.writeFileSync(logFile, "[Available Models]\n");

        if (data.models) {
            data.models.forEach(m => {
                const name = m.name.replace('models/', '');
                console.log(`- ${name}`);
                fs.appendFileSync(logFile, `- ${name}\n`);
            });
        } else {
            console.log("No models found.");
            fs.appendFileSync(logFile, "No models found.\n");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
