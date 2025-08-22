#!/bin/bash

# Demo script showing how to use the enrichment tools
# Make sure to set your OpenAI API key first: export OPENAI_API_KEY="your_key_here"

echo "🏨 Pernocta Place Enrichment Demo"
echo "================================="
echo ""

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is not set"
    echo "Please set your OpenAI API key:"
    echo "export OPENAI_API_KEY=\"your_key_here\""
    exit 1
fi

echo "✅ OpenAI API key is set"
echo ""

# Show current statistics
echo "📊 Current enrichment statistics:"
echo "--------------------------------"
npm run enrich:stats
echo ""

# Ask user which municipality to enrich
echo "🎯 Choose a municipality to enrich:"
echo "Enter a municipality code from the list above (or press Enter to exit):"
read -r municipality_code

if [ -z "$municipality_code" ]; then
    echo "👋 Exiting..."
    exit 0
fi

# Validate input is a number
if ! [[ "$municipality_code" =~ ^[0-9]+$ ]]; then
    echo "❌ Error: Municipality code must be a number"
    exit 1
fi

echo ""
echo "🚀 Starting enrichment for municipality code: $municipality_code"
echo ""

# Ask which version to use
echo "Choose enrichment script version:"
echo "1) Node.js version (enrich-places-by-municipality.js)"
echo "2) TypeScript version (enrich-places-by-municipality.ts)"
echo "Enter choice (1 or 2, default is 1):"
read -r version_choice

case $version_choice in
    2)
        echo "Using TypeScript version..."
        npm run enrich:municipality:ts "$municipality_code"
        ;;
    *)
        echo "Using Node.js version..."
        npm run enrich:municipality "$municipality_code"
        ;;
esac

echo ""
echo "🎉 Enrichment completed!"
echo ""

# Show updated statistics
echo "📊 Updated enrichment statistics:"
echo "--------------------------------"
npm run enrich:stats

echo ""
echo "✨ Demo completed successfully!"
