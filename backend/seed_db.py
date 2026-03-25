import sys
import os
from datetime import datetime, timedelta

# Adiciona o diretório atual ao path para conseguir importar os módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models import (
    Parceiro, TipoParceiro,
    Produto, TipoProduto,
    EstruturaProduto,
    Pedido, TipoPedido, StatusPedido,
    ItemPedido,
    Financeiro, TipoFinanceiro, StatusFinanceiro,
    Usuario
)

def seed_database():
    print("Iniciando a população do banco de dados...")
    
    # Cria as tabelas caso não existam
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. Limpar dados existentes (opcional, mas bom para garantir um estado limpo)
        # Atenção: em um banco de produção não faríamos isso!
        db.query(Financeiro).delete()
        db.query(ItemPedido).delete()
        db.query(Pedido).delete()
        db.query(EstruturaProduto).delete()
        db.query(Produto).delete()
        db.query(Parceiro).delete()
        db.commit()

        # 2. Criar Parceiros (Fornecedores e Clientes)
        fornecedores = [
            Parceiro(nome="Neutrik Brasil", documento="11.222.333/0001-44", contato="vendas@neutrik.com.br", tipo=TipoParceiro.FORNECEDOR),
            Parceiro(nome="Metaltex Componentes", documento="55.666.777/0001-88", contato="contato@metaltex.com.br", tipo=TipoParceiro.FORNECEDOR),
            Parceiro(nome="Mouser Electronics", documento="99.888.777/0001-66", contato="latam@mouser.com", tipo=TipoParceiro.FORNECEDOR),
        ]
        
        clientes = [
            Parceiro(nome="Locadora de Som e Luz São Paulo", documento="12.345.678/0001-90", contato="compras@somluzsp.com", tipo=TipoParceiro.CLIENTE),
            Parceiro(nome="Teatro Municipal", documento="98.765.432/0001-10", contato="tecnica@teatromunicipal.org", tipo=TipoParceiro.CLIENTE),
            Parceiro(nome="Banda Eventos XYZ", documento="45.678.901/0001-23", contato="producao@bandaxyz.com", tipo=TipoParceiro.CLIENTE),
        ]

        db.add_all(fornecedores + clientes)
        db.commit()
        
        # Obter IDs dos parceiros recém-criados
        f_neutrik = db.query(Parceiro).filter_by(nome="Neutrik Brasil").first()
        f_metaltex = db.query(Parceiro).filter_by(nome="Metaltex Componentes").first()
        c_somluz = db.query(Parceiro).filter_by(nome="Locadora de Som e Luz São Paulo").first()

        # 3. Criar Produtos (Peças e Produtos Finais)
        pecas = [
            Produto(nome="Plug XLR Macho 3 Pinos", tipo=TipoProduto.PECA, estoque=150, preco=12.50),
            Produto(nome="Plug XLR Fêmea 3 Pinos", tipo=TipoProduto.PECA, estoque=120, preco=14.00),
            Produto(nome="Resistor 120 Ohms 1/4W", tipo=TipoProduto.PECA, estoque=1000, preco=0.15),
            Produto(nome="Resistor 1K Ohms 1/4W", tipo=TipoProduto.PECA, estoque=500, preco=0.15),
            Produto(nome="LED Verde 5mm Alto Brilho", tipo=TipoProduto.PECA, estoque=300, preco=0.50),
            Produto(nome="LED Vermelho 5mm Alto Brilho", tipo=TipoProduto.PECA, estoque=300, preco=0.50),
            Produto(nome="Caixa Plástica ABS Pequena", tipo=TipoProduto.PECA, estoque=50, preco=8.90),
            Produto(nome="Conector Bateria 9V", tipo=TipoProduto.PECA, estoque=100, preco=1.20),
            Produto(nome="PCB Testador DMX v1", tipo=TipoProduto.PECA, estoque=40, preco=5.00),
        ]
        
        db.add_all(pecas)
        db.commit()

        produtos_finais = [
            Produto(nome="Testador DMX Básico (XLR 3 Pinos)", tipo=TipoProduto.PRODUTO_FINAL, estoque=15, preco=89.90),
            Produto(nome="Testador DMX Pro (Terminador Integrado)", tipo=TipoProduto.PRODUTO_FINAL, estoque=5, preco=129.90),
        ]
        
        db.add_all(produtos_finais)
        db.commit()

        # Obter referências para criar a BOM (Estrutura do Produto)
        p_xlr_m = db.query(Produto).filter_by(nome="Plug XLR Macho 3 Pinos").first()
        p_xlr_f = db.query(Produto).filter_by(nome="Plug XLR Fêmea 3 Pinos").first()
        p_res_120 = db.query(Produto).filter_by(nome="Resistor 120 Ohms 1/4W").first()
        p_res_1k = db.query(Produto).filter_by(nome="Resistor 1K Ohms 1/4W").first()
        p_led_vd = db.query(Produto).filter_by(nome="LED Verde 5mm Alto Brilho").first()
        p_led_vm = db.query(Produto).filter_by(nome="LED Vermelho 5mm Alto Brilho").first()
        p_caixa = db.query(Produto).filter_by(nome="Caixa Plástica ABS Pequena").first()
        p_con_bat = db.query(Produto).filter_by(nome="Conector Bateria 9V").first()
        p_pcb = db.query(Produto).filter_by(nome="PCB Testador DMX v1").first()

        prod_basico = db.query(Produto).filter_by(nome="Testador DMX Básico (XLR 3 Pinos)").first()
        prod_pro = db.query(Produto).filter_by(nome="Testador DMX Pro (Terminador Integrado)").first()

        # 4. Criar BOM (Estrutura do Produto)
        bom_basico = [
            EstruturaProduto(produto_final_id=prod_basico.id, peca_id=p_xlr_m.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_basico.id, peca_id=p_xlr_f.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_basico.id, peca_id=p_led_vd.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_basico.id, peca_id=p_led_vm.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_basico.id, peca_id=p_res_1k.id, quantidade=2),
            EstruturaProduto(produto_final_id=prod_basico.id, peca_id=p_caixa.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_basico.id, peca_id=p_con_bat.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_basico.id, peca_id=p_pcb.id, quantidade=1),
        ]

        bom_pro = [
            EstruturaProduto(produto_final_id=prod_pro.id, peca_id=p_xlr_m.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_pro.id, peca_id=p_xlr_f.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_pro.id, peca_id=p_led_vd.id, quantidade=2),
            EstruturaProduto(produto_final_id=prod_pro.id, peca_id=p_led_vm.id, quantidade=2),
            EstruturaProduto(produto_final_id=prod_pro.id, peca_id=p_res_1k.id, quantidade=4),
            EstruturaProduto(produto_final_id=prod_pro.id, peca_id=p_res_120.id, quantidade=1), # Terminador DMX
            EstruturaProduto(produto_final_id=prod_pro.id, peca_id=p_caixa.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_pro.id, peca_id=p_con_bat.id, quantidade=1),
            EstruturaProduto(produto_final_id=prod_pro.id, peca_id=p_pcb.id, quantidade=1),
        ]

        db.add_all(bom_basico + bom_pro)
        db.commit()

        # 5. Criar um Pedido de Compra (Fornecedor)
        pedido_compra = Pedido(
            data=datetime.utcnow() - timedelta(days=5),
            tipo=TipoPedido.COMPRA,
            status=StatusPedido.FINALIZADO,
            parceiro_id=f_neutrik.id
        )
        db.add(pedido_compra)
        db.commit()

        item_compra1 = ItemPedido(pedido_id=pedido_compra.id, produto_id=p_xlr_m.id, quantidade=100, preco_unitario=10.00)
        item_compra2 = ItemPedido(pedido_id=pedido_compra.id, produto_id=p_xlr_f.id, quantidade=100, preco_unitario=11.50)
        db.add_all([item_compra1, item_compra2])
        
        fin_compra = Financeiro(
            pedido_id=pedido_compra.id,
            tipo=TipoFinanceiro.PAGAR,
            valor=2150.00,
            vencimento=datetime.utcnow() + timedelta(days=10),
            status=StatusFinanceiro.ABERTO
        )
        db.add(fin_compra)
        db.commit()

        # 6. Criar um Pedido de Venda (Cliente)
        pedido_venda = Pedido(
            data=datetime.utcnow() - timedelta(days=1),
            tipo=TipoPedido.VENDA,
            status=StatusPedido.PENDENTE,
            parceiro_id=c_somluz.id
        )
        db.add(pedido_venda)
        db.commit()

        item_venda = ItemPedido(pedido_id=pedido_venda.id, produto_id=prod_basico.id, quantidade=5, preco_unitario=89.90)
        db.add(item_venda)
        
        fin_venda = Financeiro(
            pedido_id=pedido_venda.id,
            tipo=TipoFinanceiro.RECEBER,
            valor=449.50,
            vencimento=datetime.utcnow() + timedelta(days=15),
            status=StatusFinanceiro.ABERTO
        )
        db.add(fin_venda)
        db.commit()

        # 7. Criar Usuário (Admin)
        admin = db.query(Usuario).filter_by(username="admin").first()
        if not admin:
            admin = Usuario(username="admin", senha="password123", nome="Administrador")
            db.add(admin)
            db.commit()

        print("Banco de dados populado com sucesso!")
        print("Foram inseridos:")
        print(f"- {db.query(Parceiro).count()} Parceiros (Clientes/Fornecedores)")
        print(f"- {db.query(Produto).count()} Produtos (Peças/Produtos Finais)")
        print(f"- {db.query(EstruturaProduto).count()} Itens de Estrutura (BOM)")
        print(f"- {db.query(Pedido).count()} Pedidos (Compra/Venda)")
        print(f"- {db.query(Usuario).count()} Usuários")

    except Exception as e:
        print(f"Ocorreu um erro ao popular o banco de dados: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
