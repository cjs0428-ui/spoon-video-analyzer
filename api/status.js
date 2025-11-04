export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, apiKey } = req.query;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Transcript ID is required' });
    }

    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: {
        'authorization': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status check failed: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ error: error.message });
  }
}
