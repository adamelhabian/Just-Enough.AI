from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.security import create_access_token, get_current_user, verify_password
from app.core.database import get_db
from app.core.errors import AuthorizationError
from app.models.all_models import User

router = APIRouter()

@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    username = None
    password = None
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username") or body.get("email")
            password = body.get("password")
        except Exception:
            raise AuthorizationError("Invalid JSON payload")
    else:
        form = await request.form()
        username = form.get("username") or form.get("email")
        password = form.get("password")

    if not username or not password:
        raise AuthorizationError("Incorrect email or password")

    user = db.query(User).filter(
        User.email == str(username).strip().lower(),
        User.is_active == True
    ).first()

    if not user:
        raise AuthorizationError("Incorrect email or password")

    if not verify_password(password, user.hashed_password):
        raise AuthorizationError("Incorrect email or password")

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
            "tenant_id": user.tenant_id,
            "email": user.email,
            "full_name": user.full_name or ""
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "tenant_id": user.tenant_id,
        "user_id": str(user.id),
        "full_name": user.full_name or ""
    }

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    return {"status": "logged_out", "message": "Successfully logged out"}

@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
