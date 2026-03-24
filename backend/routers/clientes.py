from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter(
    prefix="/clientes",
    tags=["clientes"],
)

@router.get("/", response_model=List[schemas.Parceiro])
def listar_clientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Parceiro).filter(models.Parceiro.tipo == models.TipoParceiro.CLIENTE).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Parceiro)
def criar_cliente(cliente: schemas.ParceiroCreate, db: Session = Depends(get_db)):
    if cliente.tipo != models.TipoParceiro.CLIENTE:
        raise HTTPException(status_code=400, detail="Tipo deve ser CLIENTE")
    
    db_parceiro = models.Parceiro(**cliente.model_dump())
    db.add(db_parceiro)
    db.commit()
    db.refresh(db_parceiro)
    return db_parceiro

@router.get("/{id}", response_model=schemas.Parceiro)
def ler_cliente(id: int, db: Session = Depends(get_db)):
    parceiro = db.query(models.Parceiro).filter(models.Parceiro.id == id, models.Parceiro.tipo == models.TipoParceiro.CLIENTE).first()
    if not parceiro:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return parceiro

@router.delete("/{id}")
def deletar_cliente(id: int, db: Session = Depends(get_db)):
    parceiro = db.query(models.Parceiro).filter(models.Parceiro.id == id, models.Parceiro.tipo == models.TipoParceiro.CLIENTE).first()
    if not parceiro:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    db.delete(parceiro)
    db.commit()
    return {"message": "Cliente deletado com sucesso"}
