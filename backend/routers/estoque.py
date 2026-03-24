from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter(
    prefix="/estoque",
    tags=["estoque"],
)

@router.get("/", response_model=List[schemas.Produto])
def listar_estoque(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Produto).offset(skip).limit(limit).all()

@router.post("/produtos", response_model=schemas.Produto)
def criar_produto(produto: schemas.ProdutoCreate, db: Session = Depends(get_db)):
    db_produto = models.Produto(**produto.model_dump())
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

@router.put("/{produto_id}/ajuste")
def ajustar_estoque(produto_id: int, quantidade: float, db: Session = Depends(get_db)):
    produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    produto.estoque = quantidade
    db.commit()
    db.refresh(produto)
    return produto

@router.post("/bom", response_model=schemas.EstruturaProduto)
def adicionar_componente_bom(estrutura: schemas.EstruturaProdutoCreate, db: Session = Depends(get_db)):
    produto_final = db.query(models.Produto).filter(models.Produto.id == estrutura.produto_final_id).first()
    peca = db.query(models.Produto).filter(models.Produto.id == estrutura.peca_id).first()
    
    if not produto_final or produto_final.tipo != models.TipoProduto.PRODUTO_FINAL:
        raise HTTPException(status_code=400, detail="Produto final inválido")
    if not peca or peca.tipo != models.TipoProduto.PECA:
        raise HTTPException(status_code=400, detail="Peça inválida")

    db_estrutura = models.EstruturaProduto(**estrutura.model_dump())
    db.add(db_estrutura)
    db.commit()
    db.refresh(db_estrutura)
    return db_estrutura

@router.get("/bom/{produto_id}", response_model=List[schemas.EstruturaProduto])
def listar_bom(produto_id: int, db: Session = Depends(get_db)):
    return db.query(models.EstruturaProduto).filter(models.EstruturaProduto.produto_final_id == produto_id).all()
