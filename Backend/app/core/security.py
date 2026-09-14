from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib
import hmac
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.core.errors import AuthorizationError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

import secrets

def hash_password(password: str, iterations: int = 100000) -> str:
    """Secure password hashing using PBKDF2-HMAC-SHA256 with random per-user 16-byte salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), iterations)
    return f"pbkdf2_sha256${iterations}${salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against pbkdf2_sha256 hash or legacy format."""
    if not hashed_password or not plain_password:
        return False
    try:
        if hashed_password.startswith("pbkdf2_sha256$"):
            parts = hashed_password.split("$")
            if len(parts) != 4:
                return False
            _, iterations_str, salt, stored_hash = parts
            iterations = int(iterations_str)
            calculated_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), iterations).hex()
            return hmac.compare_digest(calculated_hash, stored_hash)
        # Backward compatibility for legacy fixed-salt hashes
        if len(hashed_password) == 64:
            legacy = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), b"justenough_salt_v5", 100000).hex()
            return hmac.compare_digest(legacy, hashed_password)
    except Exception:
        return False
    return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        raise AuthorizationError("Invalid token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    user_id: str = payload.get("sub")
    role: str = payload.get("role")
    tenant_id: str = payload.get("tenant_id")
    if user_id is None:
        raise AuthorizationError("Could not validate credentials")
    return {"user_id": user_id, "role": role, "tenant_id": tenant_id}

def require_role(roles: list[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise AuthorizationError("Insufficient permissions")
        return current_user
    return role_checker

