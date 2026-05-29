export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const tickers = ['TSLA','AAPL','AMZN','AVGO','KMB','JOBY','V','C','IONQ','JPM','GOOGL','META','NVDA','MRNA','SNOW','^VIX','GC=F','^GSPC','NDX'];
  const today = new Date().toISOString().split('T')[0];

  const prompt = `Today is ${today}. Return ONLY a raw JSON object, no markdown, no explanation, no code fences. Provide realistic current market prices for: ${tickers.join(',')}. Format: {"TSLA":{"p":177.90,"c":2.34,"cp":1.33},...} where p=current price, c=change from yesterday, cp=change percent. Include ALL symbols exactly as listed.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    const prices = JSON.parse(raw);
    res.status(200).json(prices);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
