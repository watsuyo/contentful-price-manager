require('dotenv').config();
const axios = require('axios');
const { createObjectCsvWriter } = require('csv-writer');

const SPACE_ID = process.env.CONTENTFUL_PM_SPACE_ID;
const ENV_ID = process.env.CONTENTFUL_PM_ENVIRONMENT_ID || 'master';
const TOKEN = process.env.CONTENTFUL_PM_MANAGEMENT_TOKEN;

const csvWriter = createObjectCsvWriter({
  path: 'data.csv',
  header: [
    { id: 'id', title: 'id' },
    { id: 'name', title: 'name' },
    { id: 'price', title: 'price' },
    { id: 'updatedAt', title: 'updatedAt' },
  ],
});

function getLocalizedField(fieldObj) {
  const preferredLocales = ['ja-JP', 'en-US'];
  if (!fieldObj) return '';
  for (const locale of preferredLocales) {
    if (fieldObj[locale] !== undefined) return fieldObj[locale];
  }
  return '';
}

async function fetchData() {
  const url = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENV_ID}/entries?content_type=pricingContent&limit=100`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/vnd.contentful.management.v1+json',
    },
  });

  const items = res.data.items.map((item) => {
    const fields = item.fields || {};
    return {
      id: item.sys.id,
      name: getLocalizedField(fields.name),
      price: getLocalizedField(fields.price),
      updatedAt: item.sys.updatedAt,
    };
  });

  await csvWriter.writeRecords(items);
  console.log(`Fetch completed. ${items.length} entries written to data.csv`);
}

fetchData().catch((err) => {
  console.error('Error:', err.response?.data || err.message);
});
