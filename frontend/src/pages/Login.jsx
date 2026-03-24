import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import "./Login.css";

export const Login = () => {
  const navigate = useNavigate();
  const { login, autenticado, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    usuario: "",
    senha: "",
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autenticado && !authLoading) navigate("/", { replace: true });
  }, [autenticado, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!formData.usuario || !formData.senha) {
      setErro("Informe usuário e senha.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.usuario, formData.senha);
      if (result.sucesso) {
        navigate("/", { replace: true });
      } else {
        setErro(result.mensagem || "Usuário ou senha inválidos.");
      }
    } catch {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-brand">
          <span className="login-badge">Emissor NF-e</span>
          <h1>Bem-vindo de volta</h1>
          <p>Gerencie suas notas fiscais em um único lugar.</p>
        </div>

        <Card className="login-card">
          <div className="login-card-header">
            <h2>Entrar</h2>
            <p>Use suas credenciais para acessar o sistema.</p>
          </div>

          {erro && <div className="login-error">{erro}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <Input
              label="Usuário"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              placeholder="seu usuário"
              autoFocus
            />
            <Input
              label="Senha"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Sua senha"
            />

            <div className="login-actions">
              <Button type="submit" text={loading ? "Entrando..." : "Entrar"} variant="primary" disabled={loading} />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
