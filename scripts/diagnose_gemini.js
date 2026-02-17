const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load env directly
const envPath = path.resolve(__dirname, '../.env.local');

console.log('Checking for .env.local at:', envPath);

if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env.local file not found!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// Simple parser for .env
let apiKey = '';
const lines = envContent.split('\n');
for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || !trimmed) continue;

    // Look for common key names
    if (trimmed.startsWith('GEMINI_API_KEY=')) {
        apiKey = trimmed.split('=')[1].trim();
        console.log('Found GEMINI_API_KEY');
        break;
    } else if (trimmed.startsWith('NEXT_PUBLIC_GEMINI_API_KEY=')) {
        apiKey = trimmed.split('=')[1].trim();
        console.log('Found NEXT_PUBLIC_GEMINI_API_KEY');
        break;
    } else if (trimmed.startsWith('GOOGLE_API_KEY=')) {
        apiKey = trimmed.split('=')[1].trim();
        console.log('Found GOOGLE_API_KEY');
        break;
    }
}

// Remove quotes if present
if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
    apiKey = apiKey.slice(1, -1);
}

if (!apiKey) {
    console.error('ERROR: Could not find a valid API Key variable in .env.local');
    console.log('File content (masked):');
    console.log(envContent.replace(/=.*/g, '=***'));
    process.exit(1);
}

console.log(`API Key found: ${apiKey.substring(0, 4)}...${apiKey.slice(-4)} (Length: ${apiKey.length})`);

const logFile = path.resolve(__dirname, '../diagnostic_result.txt');
fs.writeFileSync(logFile, ''); // Clear file

function log(message) {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
}

async function testGemini() {
    try {
        log('Initializing Gemini API client...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        log('Sending test request ("Hello")...');
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();

        log('SUCCESS! API Response received:');
        log(text);
    } catch (error) {
        log('FAILURE: API Call Error Details:');
        log(error.message);
        if (error.response) {
            log(`Response Status: ${error.response.status}`);
            log(`Response Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

testGemini();
