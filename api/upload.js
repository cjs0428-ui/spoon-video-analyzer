import https from 'https';

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

    const uploadUrl = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.assemblyai.com',
        path: '/v2/upload',
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'content-type': contentType || 'video/mp4',
          'content-length': buffer.length
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        
        apiRes.on('end', () => {
          try {
            if (apiRes.statusCode === 200) {
              const parsed = JSON.parse(data);
              resolve(parsed.upload_url);
            } else {
              reject(new Error(`AssemblyAI error: ${apiRes.statusCode} - ${data}`));
            }
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        });
      });

      apiReq.on('error', (e) => {
        reject(new Error(`Request error: ${e.message}`));
      });

      apiReq.write(buffer);
      apiReq.end();
    });

    return res.status(200).json({ upload_url: uploadUrl });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
}
