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

    // Base64를 Buffer로 변환
    const buffer = Buffer.from(base64Data, 'base64');

    // AssemblyAI에 업로드
    const response = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'content-type': contentType || 'video/mp4'
      },
      body: buffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AssemblyAI error:', errorText);
      return res.status(response.status).json({ 
        error: `Upload failed: ${response.status}`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
}
