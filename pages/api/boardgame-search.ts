// This file should be placed at pages/api/boardgame-search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DOMParser } from 'xmldom';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Wait one second to simulate autocomplete delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(
      `https://boardgamegeek.com/xmlapi/search?search=${encodeURIComponent(q)}`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `BoardGameGeek API returned status ${response.status}`,
      });
    }

    const xmlData = await response.text();
    const results = parseXmlResponse(xmlData);

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Error fetching from BoardGameGeek:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch from BoardGameGeek API' });
  }
}

function parseXmlResponse(xmlData: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
  const boardgames = xmlDoc.getElementsByTagName('boardgame');

  // Convert NodeList to Array for easier manipulation
  const results = [];

  for (let i = 0; i < boardgames.length; i++) {
    const game = boardgames[i];
    const id = game.getAttribute('objectid');

    // Find the name element(s)
    const nameElements = game.getElementsByTagName('name');
    let name = '';

    // Look for the primary name or use the first name if no primary
    let primaryFound = false;
    for (let j = 0; j < nameElements.length; j++) {
      const nameElement = nameElements[j];
      const isPrimary = nameElement.getAttribute('primary') === 'true';

      if (isPrimary) {
        name = nameElement.textContent || '';
        primaryFound = true;
        break;
      }
    }

    // If no primary name found, use the first name
    if (!primaryFound && nameElements.length > 0) {
      name = nameElements[0].textContent || '';
    }

    // Find the year published
    const yearElements = game.getElementsByTagName('yearpublished');
    let yearPublished = '';
    if (yearElements.length > 0) {
      yearPublished = yearElements[0].textContent || '';
    }

    results.push({ id, name, yearPublished });
  }

  return results;
}
