// src/pages/Admin/AdminPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import "./AdminPage.css";

export function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [daysToAdd, setDaysToAdd] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (err) {
      setError(
        "Falha ao carregar utilizadores. Você tem permissão de administrador?"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExtendLicense = async (userId) => {
    const days = daysToAdd[userId] || 30; // Padrão de 30 dias se nada for digitado
    try {
      await api.put(`/admin/licenses/${userId}`, { daysToAdd: days });
      alert("Licença estendida com sucesso!");
      fetchUsers(); // Recarrega a lista para mostrar a nova data
    } catch (err) {
      alert(
        `Erro ao estender a licença: ${
          err.response?.data?.error || "Erro desconhecido"
        }`
      );
    }
  };

  const handleDaysChange = (userId, value) => {
    setDaysToAdd((prev) => ({ ...prev, [userId]: value }));
  };

  if (loading)
    return <div className="admin-container">A carregar utilizadores...</div>;
  if (error) return <div className="admin-container error-box">{error}</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Painel de Administração</h1>
        <Link to="/dashboard" className="back-button">
          ← Voltar ao Dashboard
        </Link>
      </header>

      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Utilizador</th>
              <th>Email</th>
              <th>Licença Expira em</th>
              <th>Estado</th>
              <th>Adicionar Dias</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const license = user.tenant?.licenses?.[0];
              const validUntil = license ? new Date(license.valid_until) : null;
              const daysRemaining = validUntil
                ? differenceInDays(validUntil, new Date())
                : null;

              return (
                <tr key={user.id}>
                  <td>
                    {user.name}
                    {user.is_admin && (
                      <span className="admin-badge">Admin</span>
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {validUntil ? format(validUntil, "dd/MM/yyyy") : "N/A"}
                  </td>
                  <td>
                    {license && license.active && daysRemaining >= 0 ? (
                      <span className="status status-active">
                        {daysRemaining} dias restantes
                      </span>
                    ) : (
                      <span className="status status-inactive">
                        Inativa/Expirada
                      </span>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="days-input"
                      placeholder="30"
                      onChange={(e) =>
                        handleDaysChange(user.id, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="action-button"
                      onClick={() => handleExtendLicense(user.id)}
                    >
                      Estender
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
