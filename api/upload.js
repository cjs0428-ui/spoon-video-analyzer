export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required in x-api-key header' });
    }

    // Vercel은 자동으로 body를 파싱하므로 raw body 가져오기
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // body를 그대로 전달
    const bodyBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    const response = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'content-type': contentType
      },
      body: bodyBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AssemblyAI upload error:', errorText);
      return res.status(response.status).json({ 
        error: `Upload failed: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
