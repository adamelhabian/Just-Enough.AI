from fastapi import Header, HTTPException
from app.core.security import decode_token
from app.schemas.core import TokenClaims

def current_claims(authorization:str=Header(...))->TokenClaims:
    if not authorization.startswith('Bearer '): raise HTTPException(401,'Bearer token required')
    try:
        data=decode_token(authorization[7:])
        return TokenClaims.model_validate(data)
    except Exception as exc:
        raise HTTPException(401,'Invalid token') from exc

def require_roles(*roles):
    def dep(claims:TokenClaims=current_claims):
        if claims.role not in roles: raise HTTPException(403,'Insufficient role')
        return claims
    return dep
