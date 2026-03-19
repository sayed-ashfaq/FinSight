import os
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .logger import log

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    
    # If no authorization header is provided or no secret is set, we use a fallback for local testing
    if not credentials or not supabase_jwt_secret:
        log.warning("No valid Supabase Auth config found. Defaulting to local mock user state.")
        return {"sub": "local-test-uuid", "email": "local@test.com"}

    token = credentials.credentials

    try:
        # Verify the JWT using the secret. Supabase uses HS256 algorithm by default.
        payload = jwt.decode(token, supabase_jwt_secret, algorithms=["HS256"], audience="authenticated")
        return payload
    except jwt.ExpiredSignatureError:
        log.error("Authentication failed: JWT Token expired")
        raise HTTPException(status_code=401, detail="Token expired.")
    except Exception as e:
        log.error(f"Authentication failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token. Supabase auth failed.")
