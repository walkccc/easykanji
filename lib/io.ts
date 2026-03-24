interface LyricsFile {
  title: string;
  lyrics: string;
}

export function exportJson(title: string, lyrics: string): void {
  const data: LyricsFile = { title, lyrics };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.trim() || 'furioke'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJson(file: File): Promise<LyricsFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as LyricsFile;
        resolve({ title: parsed.title ?? '', lyrics: parsed.lyrics ?? '' });
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
