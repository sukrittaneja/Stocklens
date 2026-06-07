export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=price,summaryDetail`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) throw new Error(`Yahoo returned ${response.status}`);
    const data = await response.json();
    const result = data?.quoteSummary?.result?.[0];

    res.json({
      price: result?.price?.regularMarketPrice?.raw ?? null,
      pe:    result?.summaryDetail?.trailingPE?.raw  ?? null,
      name:  result?.price?.longName ?? result?.price?.shortName ?? null,
    });
  } catch (e) {
    res.status(500).json({ price: null, pe: null, error: e.message });
  }
}
