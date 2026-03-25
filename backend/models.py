from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

class TipoParceiro(str, enum.Enum):
    FORNECEDOR = "FORNECEDOR"
    CLIENTE = "CLIENTE"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    senha = Column(String)
    nome = Column(String)

class Parceiro(Base):
    __tablename__ = "parceiros"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    documento = Column(String, unique=True, index=True) # CNPJ/CPF
    contato = Column(String)
    tipo = Column(Enum(TipoParceiro))

    pedidos = relationship("Pedido", back_populates="parceiro")


class TipoProduto(str, enum.Enum):
    PECA = "PECA"
    PRODUTO_FINAL = "PRODUTO_FINAL"
    REVENDA = "REVENDA"

class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    tipo = Column(Enum(TipoProduto))
    estoque = Column(Float, default=0.0)
    preco = Column(Float, default=0.0)

    # Relationships for BOM
    componentes = relationship(
        "EstruturaProduto",
        foreign_keys="[EstruturaProduto.produto_final_id]",
        back_populates="produto_final"
    )


class EstruturaProduto(Base):
    __tablename__ = "estrutura_produto" # BOM

    id = Column(Integer, primary_key=True, index=True)
    produto_final_id = Column(Integer, ForeignKey("produtos.id"))
    peca_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Float)

    produto_final = relationship("Produto", foreign_keys=[produto_final_id], back_populates="componentes")
    peca = relationship("Produto", foreign_keys=[peca_id])


class TipoPedido(str, enum.Enum):
    COMPRA = "COMPRA"
    VENDA = "VENDA"

class StatusPedido(str, enum.Enum):
    PENDENTE = "PENDENTE"
    FINALIZADO = "FINALIZADO"
    CANCELADO = "CANCELADO"

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    data = Column(DateTime, default=datetime.utcnow)
    tipo = Column(Enum(TipoPedido))
    status = Column(Enum(StatusPedido), default=StatusPedido.PENDENTE)
    parceiro_id = Column(Integer, ForeignKey("parceiros.id"))

    parceiro = relationship("Parceiro", back_populates="pedidos")
    itens = relationship("ItemPedido", back_populates="pedido")
    financeiro = relationship("Financeiro", back_populates="pedido")


class ItemPedido(Base):
    __tablename__ = "itens_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Float)
    preco_unitario = Column(Float)

    pedido = relationship("Pedido", back_populates="itens")
    produto = relationship("Produto")


class TipoFinanceiro(str, enum.Enum):
    PAGAR = "PAGAR"
    RECEBER = "RECEBER"

class StatusFinanceiro(str, enum.Enum):
    ABERTO = "ABERTO"
    PAGO = "PAGO"
    CANCELADO = "CANCELADO"

class Financeiro(Base):
    __tablename__ = "financeiro"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=True)
    tipo = Column(Enum(TipoFinanceiro))
    valor = Column(Float)
    vencimento = Column(DateTime)
    status = Column(Enum(StatusFinanceiro), default=StatusFinanceiro.ABERTO)

    pedido = relationship("Pedido", back_populates="financeiro")

class ProducaoLog(Base):
    __tablename__ = "producao_logs"

    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    quantidade = Column(Float)
    data = Column(DateTime, default=datetime.utcnow)

    produto = relationship("Produto")
