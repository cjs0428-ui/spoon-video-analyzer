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
    const { japaneseText, koreanText, userPrompt, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API key required' });
    }

    if (!japaneseText || !koreanText || !userPrompt) {
      return res.status(400).json({ error: 'All fields required' });
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
            content: `당신은 Spoon 오디오 플랫폼의 마케팅 전문가입니다. 
Spoon은 라이브 오디오 방송, ASMR, 라디오, 음악, 토크 등 다양한 오디오 콘텐츠를 제작하고 공유하는 플랫폼입니다.

주어진 영상 내용을 바탕으로 다음 형식의 일본어 광고 문구를 생성해주세요:

1. Meta 광고제목: 정확히 27byte 이내 (일본어는 1글자=3byte)
2. Meta 기본문구: 정확히 72byte 이내
3. Meta 행동유도: 정확히 100byte 이내
4. TikTok 기본문구: 정확히 100byte 이내
5. TikTok 행동유도: 정확히 100byte 이내
6. YouTube 광고제목: 정확히 90byte 이내

각 항목은 반드시 지정된 byte 수를 초과하지 않아야 합니다.
Spoon 플랫폼의 특징(음성 방송, 실시간 소통, 수익화)을 강조해주세요.

응답은 반드시 다음 JSON 형식으로만 작성하세요:
{
  "meta_title": "...",
  "meta_body": "...",
  "meta_cta": "...",
  "tiktok_body": "...",
  "tiktok_cta": "...",
  "youtube_title": "..."
}`
          },
          {
            role: 'user',
            content: `영상에서 추출한 일본어 텍스트:\n${japaneseText}\n\n한글 번역:\n${koreanText}\n\n사용자 지시사항:\n${userPrompt}\n\n위 내용을 모두 참고하여 Spoon 플랫폼 광고 문구를 생성해주세요.`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      return res.status(response.status).json({ 
        error: 'Ad generation failed: ' + response.status
      });
    }

    const data = await response.json();
    const adContent = JSON.parse(data.choices[0].message.content);
    
    return res.status(200).json(adContent);

  } catch (error) {
    console.error('Ad generation error:', error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
}
