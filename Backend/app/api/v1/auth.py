from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, get_current_user, hash_password, verify_password
from app.core.errors import AuthorizationError

router = APIRouter()

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username == "admin@demo.com" and form_data.password == "admin":
        access_token = create_access_token(data={"sub": "user_1", "role": "admin", "tenant_id": "tenant_1"})
        return {"access_token": access_token, "token_type": "bearer"}
    elif form_data.username == "employee@demo.com" and form_data.password == "employee":
        access_token = create_access_token(data={"sub": "user_2", "role": "employee", "tenant_id": "tenant_1"})
        return {"access_token": access_token, "token_type": "bearer"}
    raise AuthorizationError("Incorrect email or password")

@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
