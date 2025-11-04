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
    const { text, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API key required' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 일본어-한국어 번역가입니다. 주어진 일본어 텍스트를 자연스럽고 정확한 한국어로 번역해주세요.'
          },
          {
            role: 'user',
            content: `다음 일본어 텍스트를 한국어로 번역해주세요:\n\n${text}`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      return res.status(response.status).json({ 
        error: 'Translation failed: ' + response.status
      });
    }

    const data = await response.json();
    return res.status(200).json({ 
      translation: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
}
