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

def hash_password(password: str) -> str:
    salt = "justenough_salt_v5"
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    expected = hash_password(plain_password)
    return hmac.compare_digest(expected, hashed_password)

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

