from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import secrets 

from core.database import get_db
from core.security import hash_password, verify_password, create_access_token, get_current_admin
from core.email import send_invite_email_to_add_user
from models.user import User
from models.invite import InviteCode
from schemas.auth import SignupRequest, LoginRequest, Token, InviteRequest


router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/invite", response_mode=dict)
def invite(data: InviteRequest, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    code = secrets.token_hex(4).upper()

    invite = InviteCode(
        code = code,
        email = data.email,
        role = data.role,
        expires_at = datetime.now(timezone.utc) + timedelta(hours=48) 
    )

    db.add(invite)
    db.commit()
    
    send_invite_email_to_add_user(email=data.email, code=code, role=data.role)
    return {"message": f"Invite sent to {data.email}"}


@router.post("/signup", response_mode=Token)
def signup(data: SignupRequest, db: Session = Depends(get_db)):

    invite = db.query(InviteCode).filter(InviteCode.code==data.invite_code).first()

    if not invite:
        raise HTTPException(status_code=400, detail="Invalid Invite Code")
    if invite.used:
        raise HTTPException(status_code=400, detail="Invite Code already used")
    if invite.expires_at < datetime.now():
        raise HTTPException(status_code=400, detail="Invite Code expired")
    if invite.email!= data.email:
        raise HTTPException(status=400, detail="Invite code is invalid for this email")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status=400, detail="Username already exists")

    user = User(
        username=data.username,
        email=data.email,
        hash_password=hash_password(data.password),
        role=invite.role
    )
    db.add(user)

    invite.is_used=True
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.username})
    return Token(access_token=token)


@router.post("/login", response_mode=dict)
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(data.username == User.username).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_access_token({"sub": user.username})
    return Token(access_token=token)        


# if no user exists
@router.post("/setup", response_mode=Token)
def setup(data: SignupRequest, db: Session = Depends(get_db)):
    
    if db.query(User).first():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Setup alredy complete, admin account exists")

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        role="admin",
    )

    db.add(User)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": User.username})
    return Token(access_token=token)