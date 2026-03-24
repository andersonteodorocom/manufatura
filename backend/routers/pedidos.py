from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database import get_db
import models, schemas

router = APIRouter(
    prefix="/pedidos",
    tags=["pedidos"],
)

@router.post("/", response_model=schemas.Pedido)
def criar_pedido(pedido: schemas.PedidoCreate, db: Session = Depends(get_db)):
    parceiro = db.query(models.Parceiro).filter(models.Parceiro.id == pedido.parceiro_id).first()
    if not parceiro:
        raise HTTPException(status_code=400, detail="Parceiro não encontrado")

    db_pedido = models.Pedido(
        parceiro_id=pedido.parceiro_id,
        tipo=pedido.tipo,
        status=models.StatusPedido.PENDENTE
    )
    db.add(db_pedido)
    db.commit()
    db.refresh(db_pedido)

    valor_total = 0.0

    for item in pedido.itens:
        db_item = models.ItemPedido(
            pedido_id=db_pedido.id,
            produto_id=item.produto_id,
            quantidade=item.quantidade,
            preco_unitario=item.preco_unitario
        )
        db.add(db_item)
        valor_total += (item.quantidade * item.preco_unitario)

    db.commit()
    
    # Criar Financeiro atrelado
    tipo_financeiro = models.TipoFinanceiro.PAGAR if pedido.tipo == models.TipoPedido.COMPRA else models.TipoFinanceiro.RECEBER
    db_financeiro = models.Financeiro(
        pedido_id=db_pedido.id,
        tipo=tipo_financeiro,
        valor=valor_total,
        vencimento=datetime.utcnow() + timedelta(days=30), # 30 dias de prazo padrão
        status=models.StatusFinanceiro.ABERTO
    )
    db.add(db_financeiro)
    db.commit()

    db.refresh(db_pedido)
    return db_pedido

@router.put("/{pedido_id}/finalizar")
def finalizar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(models.Pedido).filter(models.Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if pedido.status == models.StatusPedido.FINALIZADO:
        raise HTTPException(status_code=400, detail="Pedido já finalizado")

    # Atualizar estoque
    for item in pedido.itens:
        produto = db.query(models.Produto).filter(models.Produto.id == item.produto_id).first()
        if not produto:
            raise HTTPException(status_code=400, detail=f"Produto {item.produto_id} não encontrado")

        if pedido.tipo == models.TipoPedido.COMPRA:
            produto.estoque += item.quantidade
        else: # VENDA
            if produto.estoque < item.quantidade:
                raise HTTPException(status_code=400, detail=f"Estoque insuficiente para o produto {produto.nome}")
            produto.estoque -= item.quantidade

    pedido.status = models.StatusPedido.FINALIZADO
    db.commit()
    return {"message": "Pedido finalizado com sucesso e estoque atualizado"}
