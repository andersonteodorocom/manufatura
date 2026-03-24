from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas

router = APIRouter(
    prefix="/manufatura",
    tags=["manufatura"],
)

@router.post("/produzir")
def registrar_producao(ordem: schemas.OrdemProducao, db: Session = Depends(get_db)):
    produto_final = db.query(models.Produto).filter(models.Produto.id == ordem.produto_id).first()
    if not produto_final or produto_final.tipo != models.TipoProduto.PRODUTO_FINAL:
        raise HTTPException(status_code=400, detail="Produto não é um produto final válido")

    # Verifica o BOM
    bom = db.query(models.EstruturaProduto).filter(models.EstruturaProduto.produto_final_id == ordem.produto_id).all()
    if not bom:
        raise HTTPException(status_code=400, detail="Estrutura de produto (BOM) não cadastrada")

    # Checar se há estoque suficiente de todas as peças
    for componente in bom:
        peca = db.query(models.Produto).filter(models.Produto.id == componente.peca_id).first()
        qtd_necessaria = componente.quantidade * ordem.quantidade
        if not peca or peca.estoque < qtd_necessaria:
            raise HTTPException(
                status_code=400, 
                detail=f"Estoque insuficiente da peça {peca.nome if peca else componente.peca_id}. Necessário: {qtd_necessaria}"
            )

    # Dar baixa nas peças e entrada no produto final
    for componente in bom:
        peca = db.query(models.Produto).filter(models.Produto.id == componente.peca_id).first()
        peca.estoque -= (componente.quantidade * ordem.quantidade)
    
    produto_final.estoque += ordem.quantidade

    db.commit()
    return {"message": f"Produção de {ordem.quantidade} unidades de {produto_final.nome} realizada com sucesso"}
