from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
import os

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    usuario: str
    senha: str

@router.post("/login")
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.username == login_data.usuario).first()
    
    if not user or user.senha != login_data.senha:
        return {"sucesso": False, "mensagem": "Usuário ou senha inválidos"}
    
    # Simple cookie-based auth for demo purposes
    response.set_cookie(
        key="session_token", 
        value=user.username,
        httponly=True,
        samesite="lax",
        max_age=86400 # 1 day
    )
    
    return {"sucesso": True, "usuario": {"nome": user.nome, "username": user.username}}

@router.get("/check")
def check_auth(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("session_token")
    if not token:
        return {"autenticado": False}
        
    user = db.query(models.Usuario).filter(models.Usuario.username == token).first()
    if not user:
        return {"autenticado": False}
        
    return {"autenticado": True, "usuario": {"nome": user.nome, "username": user.username}}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="session_token")
    return {"sucesso": True}
