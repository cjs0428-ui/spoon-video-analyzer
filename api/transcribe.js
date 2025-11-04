export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audio_url, language_code, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required in request body' });
    }

    if (!audio_url) {
      return res.status(400).json({ error: 'audio_url is required' });
    }

    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        audio_url,
        language_code: language_code || 'ja'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AssemblyAI transcribe error:', errorText);
      return res.status(response.status).json({ 
        error: `Transcribe failed: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Transcribe handler error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}
