import axios from 'axios';

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
    const { apiKey, base64Data, contentType } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    if (!base64Data) {
      return res.status(400).json({ error: 'No file data' });
    }

    const buffer = Buffer.from(base64Data, 'base64');

    const response = await axios.post('https://api.assemblyai.com/v2/upload', buffer, {
      headers: {
        'authorization': apiKey,
        'content-type': contentType || 'video/mp4',
        'content-length': buffer.length
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || error.message
    });
  }
}
