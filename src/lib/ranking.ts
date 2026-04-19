export interface PongRankingEntry {
  name: string;
  score: number;
  date: string;
}

const APPS_SCRIPT_API = 'https://script.google.com/macros/s/AKfycbwk6I3OvEN4GL1zjBcDvarlN_LVGrKWHXYbFVIOgXOOC1_Us1gEnT0dHIEiEkZLApuV/exec';

export async function fetchRanking(): Promise<PongRankingEntry[]> {
  try {
    const res = await fetch(`${APPS_SCRIPT_API}?juego=pong`);
    if (!res.ok) {
      throw new Error('API error: ' + res.status);
    }
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    // Map Apps Script response {nombre, puntos, fecha} to PongRankingEntry {name, score, date}
    const mapped = data.map((item: any) => ({
      name: item.nombre,
      score: item.puntos,
      date: item.fecha
    }));
    
    return mapped
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 10);
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
    juego: 'pong',
    nombre: name.trim().toUpperCase(),
    puntos: score
  };

  try {
    // Send as plain text (stringify) with no custom headers to avoid CORS preflight,
    // Google Apps script handles it well if using e.postData.contents.
    // However, fetch with application/x-www-form-urlencoded works and avoids preflight if needed.
    // The google Apps Script we wrote parses text well.
    const res = await fetch(APPS_SCRIPT_API, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    
    if (!res.ok && res.type !== 'opaque') {
      throw new Error('API error: ' + res.status);
    }
    
    return true;
  } catch (error) {
    console.error('[Ranking] Error saving score:', error);
    return false;
  }
}
