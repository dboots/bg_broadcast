// pages/api/random-slug.js
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Read the CSV file with the word list
    const filePath = path.join(process.cwd(), 'data', 'slugs.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Split the content into an array of words
    const words = fileContent.split(',').filter((word) => word.trim() !== '');

    // Select 3 random words
    const randomWords = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      randomWords.push(words[randomIndex]);
    }

    // Create a slug by joining the words with hyphens
    const slug = randomWords.join('-');

    // Return the slug as JSON
    res.status(200).json({
      slug,
      words: randomWords,
    });
  } catch (error: any) {
    console.error('Error generating random slug:', error);
    res.status(500).json({
      error: 'Failed to generate random slug',
      details: error.message,
    });
  }
}
