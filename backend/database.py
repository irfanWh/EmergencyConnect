import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mock.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "mock_key")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: SUPABASE_URL or SUPABASE_KEY is not set in the environment variables.")

# Create the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
