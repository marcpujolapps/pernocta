# Scripts

This directory contains utility scripts for managing the Pernocta database.

## Available Scripts

### upload-places.js
Uploads tourist accommodation data from `public/places.json` to Firestore.

**Usage:**
```bash
npm run upload:places
# or
node scripts/upload-places.js
```

**Features:**
- Transforms and normalizes data from Catalan keys to English snake_case
- Handles batch uploads (500 documents per batch)
- Automatic rate limiting
- Creates stable document IDs based on licence_id

### enrich-places-by-municipality.js
Enriches tourist accommodation data with AI-generated descriptions, services, and booking information for a specific municipality.

**Usage:**
```bash
npm run enrich:municipality <municipality_code>
# or
node scripts/enrich-places-by-municipality.js <municipality_code>
```

**Example:**
```bash
# Enrich all places in Barcelona (municipality code 081815)
npm run enrich:municipality 081815

# Enrich all places in Girona (municipality code 170792)
npm run enrich:municipality 170792
```

**Features:**
- Fetches all places for a given municipality code from Firestore
- Uses AI (GPT-4o-mini) to generate enrichment data:
  - Long and short descriptions in Catalan
  - Services and amenities
  - Price ranges
  - Contact information (website, email, phone)
  - Booking platform links
  - Review summaries and ratings
- Creates embeddings for enhanced search capabilities
- Batch processing with rate limiting (10 places per batch, 2s delay)
- Error handling and recovery (marks failed enrichments)
- Skips already enriched places automatically
- Progress tracking and detailed logging

**Output Data Schema:**
The script adds the following fields to each place document:
- `long_description`: Detailed description in Catalan
- `short_description`: Brief description in Catalan
- `services`: Array of services offered
- `price_range_eur`: Price range in euros
- `website`: Official website URL
- `email`: Contact email
- `phone`: Contact phone number
- `booking_links`: Array of booking platform links
- `reviews_out_of_5`: Average rating (0-5)
- `reviews_summary`: Summary of reviews in Catalan
- `embedding`: Vector embedding for search
- `enriched_at`: Timestamp of enrichment
- `enrichment_error`: Boolean flag for failed enrichments

**Rate Limits:**
- 10 places per batch
- 2 second delay between batches
- 500ms delay between individual enrichments
- Respects OpenAI API rate limits

**Requirements:**
- Valid Firebase service account in `node/k.json`
- OpenAI API access through ai-sdk
- Internet connection for AI enrichment

## Municipality Codes

You can find municipality codes in the IDESCAT format. Some common ones:
- Barcelona: 081815
- Girona: 170792
- Lleida: 251200
- Tarragona: 431486

## Environment Setup

Make sure you have:
1. Firebase service account key in `node/k.json`
2. OpenAI API key configured in your environment
3. All dependencies installed: `npm install`
