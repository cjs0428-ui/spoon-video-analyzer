import formidable from 'formidable';
import fs from 'fs';
import https from 'https';

export const config = {
  api: {
    bodyParser: false,
  }
};

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
      return res.status(400).json({ error: 'API key required' });
    }

    const form = formidable({ maxFileSize: 50 * 1024 * 1024 });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file?.[0] || files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = fs.readFileSync(file.filepath);
    
    const uploadUrl = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.assemblyai.com',
        path: '/v2/upload',
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'content-type': file.mimetype || 'video/mp4',
          'content-length': fileBuffer.length
        }
      };

      const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (apiRes.statusCode === 200) {
              resolve(parsed.upload_url);
            } else {
              reject(new Error(`AssemblyAI error: ${apiRes.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      apiReq.on('error', reject);
      apiReq.write(fileBuf
