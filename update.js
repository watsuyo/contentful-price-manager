require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');

const SPACE_ID = process.env.CONTENTFUL_PM_SPACE_ID;
const ENV_ID = process.env.CONTENTFUL_PM_ENVIRONMENT_ID || 'master';
const TOKEN = process.env.CONTENTFUL_PM_MANAGEMENT_TOKEN;

const BASE_URL = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENV_ID}`;

const LOCALE = 'en-US'; 

async function updateEntry(id, newPrice) {
  try {
    const numericPrice = Number(newPrice);
    if (isNaN(numericPrice)) {
      console.warn(`Skipped: ${id} - Invalid price: ${newPrice}`);
      return;
    }

    const getRes = await axios.get(`${BASE_URL}/entries/${id}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
      },
    });

    const entry = getRes.data;
    const version = entry.sys.version;
    const currentFields = entry.fields;
    
    currentFields.price = {
      ...currentFields.price,
      [LOCALE]: numericPrice,
    };
    
    const updateRes = await axios.put(
      `${BASE_URL}/entries/${id}`,
      { fields: currentFields },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          'X-Contentful-Version': version,
        },
      }
    );

    const updatedEntry = updateRes.data;
    const updatedVersion = updatedEntry.sys.version;

    await axios.put(
      `${BASE_URL}/entries/${id}/published`,
      {},
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'X-Contentful-Version': updatedVersion,
        },
      }
    );

    console.log(`Updated and published: ${id} → price=${numericPrice}`);
  } catch (err) {
    console.error(`Failed to update/publish: ${id}`);
    console.error(JSON.stringify(err.response?.data || err.message, null, 2));
  }
}

function updateAll() {
  const updates = [];

  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
      if (row.id && row.price) {
        updates.push({ id: row.id, price: row.price });
      }
    })
    .on('end', async () => {
      console.log(`Updating ${updates.length} entries...`);
      for (const entry of updates) {
        await updateEntry(entry.id, entry.price);
      }
      console.log('Update and publish process completed.');
    });
}

updateAll();
