from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import TipoParceiro, TipoProduto, TipoPedido, StatusPedido, TipoFinanceiro, StatusFinanceiro

# Parceiros
class ParceiroBase(BaseModel):
    nome: str
    documento: str
    contato: Optional[str] = None
    tipo: TipoParceiro

class ParceiroCreate(ParceiroBase):
    pass

class Parceiro(ParceiroBase):
    id: int

    class Config:
        from_attributes = True

# Produtos
class ProdutoBase(BaseModel):
    nome: str
    tipo: TipoProduto
    preco: float = 0.0

class ProdutoCreate(ProdutoBase):
    pass

class Produto(ProdutoBase):
    id: int
    estoque: float

    class Config:
        from_attributes = True

# BOM
class EstruturaProdutoBase(BaseModel):
    peca_id: int
    quantidade: float

class EstruturaProdutoCreate(EstruturaProdutoBase):
    produto_final_id: int

class EstruturaProduto(EstruturaProdutoBase):
    id: int
    produto_final_id: int

    class Config:
        from_attributes = True

# Pedidos
class ItemPedidoBase(BaseModel):
    produto_id: int
    quantidade: float
    preco_unitario: float

class ItemPedidoCreate(ItemPedidoBase):
    pass

class ItemPedido(ItemPedidoBase):
    id: int

    class Config:
        from_attributes = True

class PedidoBase(BaseModel):
    parceiro_id: int
    tipo: TipoPedido

class PedidoCreate(PedidoBase):
    itens: List[ItemPedidoCreate]

class Pedido(PedidoBase):
    id: int
    data: datetime
    status: StatusPedido
    itens: List[ItemPedido]

    class Config:
        from_attributes = True

# Financeiro
class FinanceiroBase(BaseModel):
    tipo: TipoFinanceiro
    valor: float
    vencimento: datetime

class FinanceiroCreate(FinanceiroBase):
    pedido_id: Optional[int] = None

class Financeiro(FinanceiroBase):
    id: int
    status: StatusFinanceiro
    pedido_id: Optional[int]

    class Config:
        from_attributes = True

# Manufatura
class OrdemProducao(BaseModel):
    produto_id: int
    quantidade: float

class ProducaoLog(BaseModel):
    id: int
    produto_id: int
    quantidade: float
    data: datetime
    produto: Optional[Produto] = None

    class Config:
        from_attributes = True
