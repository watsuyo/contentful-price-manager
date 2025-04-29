# Contentful Price Management Tool

This is a simple Node.js-based tool to fetch and update pricing data from Contentful using the Management API.

## Features

- Fetch pricing data from Contentful and export to a CSV file
- Edit the CSV (e.g., using Excel)
- Update the `price` field in Contentful based on the edited CSV
- Automatically publish the updated entries

## Requirements

- Node.js (v16 or higher)
- npm
- A Contentful space with:
  - A content type `pricingContent`
  - A `price` field (Number type)
  - Localized fields (e.g., `en-US`)
- A Contentful Management API token

## Project Structure

```
contentful-tool/
├── .env              # Environment variables
├── fetch.js          # Fetch entries and export to data.csv
├── update.js         # Read data.csv and update Contentful entries
├── data.csv          # CSV file to edit (auto-generated)
└── README.md         # This file
```

## Setup

1. Clone or download this repository.
2. Create a `.env` file in the root directory:

```
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ENVIRONMENT_ID=master
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
```

You can obtain your Management API token from:
Contentful → Settings → API keys → Personal access tokens

## Install Dependencies

```
npm install
```

## Fetch Data from Contentful

This command fetches all entries of `pricingContent` and outputs them to `data.csv`.

```
node fetch.js
```

Example `data.csv`:

```
id,name,price,updatedAt
6UBQSky7Qyl5C88XSyK63l,Product A,1100,2025-04-29T10:52:24.676Z
```

## Edit the CSV

- Open `data.csv` in Excel or any spreadsheet tool
- Edit the `price` column only
- Do not modify the `id` column

## Update Contentful

This command reads `data.csv`, updates the `price` field for each entry, and publishes the entry.

```
node update.js
```

## Behavior Summary

| Action        | Description                                      |
|---------------|--------------------------------------------------|
| `fetch.js`    | Exports all `pricingContent` entries to CSV      |
| `update.js`   | Updates `price` field and publishes the entry    |
| Other fields  | Preserved automatically                          |
| Publish       | Entries are published after update               |

## Notes

- You can run `fetch.js` again at any time to get the latest data.
- Make sure the `price` column contains valid numbers.
- If the `price` field is not localized, update the script accordingly.
