export async function translateText(text: string): Promise<string> {
  if (!text || text.trim() === '') return text;
  
  // Check cache first to avoid re-translating same content
  const cacheKey = `translation_${text.substring(0, 50)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'ro',
        target: 'en',
        format: 'text',
      }),
    });
    
    if (!response.ok) throw new Error('Translation failed');
    
    const data = await response.json();
    const translated = data.translatedText;
    
    // Cache translation for future use
    localStorage.setItem(cacheKey, translated);
    
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to Romanian if translation fails
  }
}

export async function translateRichText(richTextContent: any): Promise<any> {
  if (!richTextContent || !richTextContent.content) return richTextContent;
  
  const translateNode = async (node: any): Promise<any> => {
    if (node.nodeType === 'text') {
      return {
        ...node,
        value: await translateText(node.value),
      };
    }
    
    if (node.content) {
      return {
        ...node,
        content: await Promise.all(node.content.map(translateNode)),
      };
    }
    
    return node;
  };
  
  return {
    ...richTextContent,
    content: await Promise.all(richTextContent.content.map(translateNode)),
  };
}
