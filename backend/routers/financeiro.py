from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
import models, schemas

router = APIRouter(
    prefix="/financeiro",
    tags=["financeiro"],
)

@router.get("/", response_model=List[schemas.Financeiro])
def listar_financeiro(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[models.StatusFinanceiro] = None,
    data_inicio: Optional[datetime] = Query(None),
    data_fim: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Financeiro)

    if status:
        query = query.filter(models.Financeiro.status == status)
    
    if data_inicio:
        query = query.filter(models.Financeiro.vencimento >= data_inicio)

    if data_fim:
        query = query.filter(models.Financeiro.vencimento <= data_fim)

    return query.offset(skip).limit(limit).all()

@router.put("/{financeiro_id}/pagar")
def pagar_financeiro(financeiro_id: int, db: Session = Depends(get_db)):
    conta = db.query(models.Financeiro).filter(models.Financeiro.id == financeiro_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    
    if conta.status == models.StatusFinanceiro.PAGO:
        raise HTTPException(status_code=400, detail="Conta já foi paga/recebida")

    conta.status = models.StatusFinanceiro.PAGO
    db.commit()
    db.refresh(conta)
    return conta
