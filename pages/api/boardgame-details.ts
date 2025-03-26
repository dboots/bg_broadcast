// pages/api/boardgame-details.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DOMParser } from 'xmldom';

interface GameDetails {
  id: string;
  name: string;
  yearPublished: string;
  description: string;
  image: string;
  thumbnail: string;
  minPlayers: string;
  maxPlayers: string;
  playingTime: string;
  minAge: string;
  designers: string[];
  categories: string[];
  mechanics: string[];
  publishers: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Game ID is required' });
  }

  try {
    const response = await fetch(
      `http://boardgamegeek.com/xmlapi/game/${encodeURIComponent(id)}`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `BoardGameGeek API returned status ${response.status}`,
      });
    }

    const xmlData = await response.text();
    const gameDetails = parseGameXml(xmlData);

    return res.status(200).json({ gameDetails });
  } catch (error) {
    console.error('Error fetching game details from BoardGameGeek:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch game details from BoardGameGeek API' });
  }
}

function parseGameXml(xmlData: string): GameDetails | null {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
  const boardgames = xmlDoc.getElementsByTagName('boardgame');

  if (boardgames.length === 0) {
    return null;
  }

  const game = boardgames[0];
  const id = game.getAttribute('objectid') || '';

  // Extract game properties
  const getElementText = (tagName: string): string => {
    const elements = game.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0].textContent || '' : '';
  };

  // Extract name (primary if available)
  const nameElements = game.getElementsByTagName('name');
  let name = '';
  for (let i = 0; i < nameElements.length; i++) {
    const nameEl = nameElements[i];
    const isPrimary = nameEl.getAttribute('primary') === 'true';
    if (isPrimary) {
      name = nameEl.textContent || '';
      break;
    }
  }
  // If no primary name found, use the first one
  if (!name && nameElements.length > 0) {
    name = nameElements[0].textContent || '';
  }

  // Extract lists (designers, categories, mechanics, publishers)
  const extractList = (tagName: string): string[] => {
    const elements = game.getElementsByTagName(tagName);
    const list: string[] = [];
    for (let i = 0; i < elements.length; i++) {
      const text = elements[i].textContent;
      if (text) {
        list.push(text);
      }
    }
    return list;
  };

  // Clean up description (remove HTML tags if needed)
  let description = getElementText('description');
  description = description.replace(/<[^>]*>/g, ''); // Simple HTML tag removal

  return {
    id,
    name,
    yearPublished: getElementText('yearpublished'),
    description,
    image: getElementText('image'),
    thumbnail: getElementText('thumbnail'),
    minPlayers: getElementText('minplayers'),
    maxPlayers: getElementText('maxplayers'),
    playingTime: getElementText('playingtime'),
    minAge: getElementText('age'),
    designers: extractList('boardgamedesigner'),
    categories: extractList('boardgamecategory'),
    mechanics: extractList('boardgamemechanic'),
    publishers: extractList('boardgamepublisher'),
  };
}
