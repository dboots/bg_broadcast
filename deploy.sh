#!/bin/bash

# Load environment variables from the .env.local file
source .env.local

# Run the fly deploy command with the loaded environment variable
fly deploy \
    --build-secret NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    --build-secret NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"