const fs = require('fs');

async function listModels() {
  const envFile = fs.readFileSync('./apps/server/.env', 'utf-8');
  const apiKeyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
  const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].replace(/"/g, '').trim() : null;

  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in apps/server/.env');
    return;
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('API Error:', data.error.message);
      return;
    }
    
    const models = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
    console.log('\n✅ AVAILABLE MODELS FOR GENERATION:');
    models.forEach(m => console.log(`- ${m.name.replace('models/', '')}`));
    console.log('\n');
  } catch (err) {
    console.error('Failed to list models:', err);
  }
}

listModels();
