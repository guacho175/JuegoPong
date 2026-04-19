export interface PongRankingEntry {
  name: string;
  score: number;
  date: string;
}

const SHEETDB_API = 'https://sheetdb.io/api/v1/d64c584yscssq';

export async function fetchRanking(): Promise<PongRankingEntry[]> {
  try {
    const res = await fetch(`${SHEETDB_API}?limit=50`);
    if (!res.ok) {
      throw new Error('API error: ' + res.status);
    }
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    // Asumimos que los datos tienen al menos { name, score, date }
    const sorted = data
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 10);
    
    return sorted;
  } catch (error) {
    console.error('[Ranking] Error fetching ranking:', error);
    return [];
  }
}

export async function saveScore(
  name: string,
  score: number
): Promise<boolean> {
  const entry = {
    name: name.trim().toUpperCase(),
    score,
    date: new Date().toISOString().split('T')[0],
  };

  try {
    const res = await fetch(SHEETDB_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [entry] }),
    });
    
    if (!res.ok) {
      throw new Error('API error: ' + res.status);
    }
    
    return true;
  } catch (error) {
    console.error('[Ranking] Error saving score:', error);
    return false;
  }
}
