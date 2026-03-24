from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter(
    prefix="/fornecedores",
    tags=["fornecedores"],
)

@router.get("/", response_model=List[schemas.Parceiro])
def listar_fornecedores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Parceiro).filter(models.Parceiro.tipo == models.TipoParceiro.FORNECEDOR).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Parceiro)
def criar_fornecedor(fornecedor: schemas.ParceiroCreate, db: Session = Depends(get_db)):
    if fornecedor.tipo != models.TipoParceiro.FORNECEDOR:
        raise HTTPException(status_code=400, detail="Tipo deve ser FORNECEDOR")
    
    db_parceiro = models.Parceiro(**fornecedor.model_dump())
    db.add(db_parceiro)
    db.commit()
    db.refresh(db_parceiro)
    return db_parceiro

@router.get("/{id}", response_model=schemas.Parceiro)
def ler_fornecedor(id: int, db: Session = Depends(get_db)):
    parceiro = db.query(models.Parceiro).filter(models.Parceiro.id == id, models.Parceiro.tipo == models.TipoParceiro.FORNECEDOR).first()
    if not parceiro:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    return parceiro

@router.delete("/{id}")
def deletar_fornecedor(id: int, db: Session = Depends(get_db)):
    parceiro = db.query(models.Parceiro).filter(models.Parceiro.id == id, models.Parceiro.tipo == models.TipoParceiro.FORNECEDOR).first()
    if not parceiro:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    db.delete(parceiro)
    db.commit()
    return {"message": "Fornecedor deletado com sucesso"}
