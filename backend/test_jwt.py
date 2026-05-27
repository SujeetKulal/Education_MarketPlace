import os
import jwt
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('SUPABASE_ANON_KEY')
secret = os.getenv('SUPABASE_JWT_SECRET')

print(f"Token length: {len(token) if token else 0}")
print(f"Secret length: {len(secret) if secret else 0}")

try:
    # Try raw secret
    payload = jwt.decode(token, secret, algorithms=['HS256'], audience='authenticated')
    print("SUCCESS with raw secret!")
    print(payload)
except Exception as e:
    print(f"FAIL with raw secret: {e}")

try:
    # Try no audience
    payload = jwt.decode(token, secret, algorithms=['HS256'], options={"verify_audience": False})
    print("SUCCESS with no audience!")
    print(payload)
except Exception as e:
    print(f"FAIL with no audience: {e}")

try:
    # Try audience='authenticated' ? No wait, anon key has different audience or role maybe?
    pass
