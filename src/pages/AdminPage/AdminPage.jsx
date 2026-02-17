// src/pages/AdminPage/AdminPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { format, differenceInDays } from "date-fns";
import "./AdminPage.css";

export function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [daysToAdd, setDaysToAdd] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

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

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleExtendLicense = async (userId) => {
    const days = parseInt(daysToAdd[userId]) || 7;
    setError("");
    setSuccessMessage("");
    setActionLoading(userId);
    try {
      await api.put(`/admin/licenses/${userId}`, { daysToAdd: days });
      showSuccess(`Licença estendida com sucesso! (+${days} dias)`);
      fetchUsers();
    } catch (err) {
      setError(
        `Erro ao estender a licença: ${err.response?.data?.error || "Erro desconhecido"}`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeLicense = async (userId) => {
    const confirmRevoke = window.confirm(
      "Tem certeza que deseja revogar esta licença? O acesso do utilizador será desativado imediatamente."
    );
    if (!confirmRevoke) return;

    setError("");
    setSuccessMessage("");
    setActionLoading(userId);
    try {
      await api.delete(`/admin/licenses/${userId}`);
      showSuccess("Licença revogada com sucesso.");
      fetchUsers();
    } catch (err) {
      setError(
        `Erro ao revogar a licença: ${err.response?.data?.error || "Erro desconhecido"}`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDaysChange = (userId, value) => {
    setDaysToAdd((prev) => ({ ...prev, [userId]: value }));
  };

  if (loading)
    return <div className="admin-container">A carregar utilizadores...</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Painel de Administração</h1>
        <Link to="/dashboard" className="back-button">
          ← Voltar ao Dashboard
        </Link>
      </header>

      {error && <div className="error-box">{error}</div>}
      {successMessage && <div className="success-box">{successMessage}</div>}

      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Utilizador</th>
              <th>Email</th>
              <th>Licença Expira em</th>
              <th>Estado</th>
              <th>Adicionar Dias</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const license = user.tenant?.licenses?.[0];
              const validUntil = license ? new Date(license.valid_until) : null;
              const daysRemaining = validUntil
                ? differenceInDays(validUntil, new Date())
                : null;
              const isActive = license && license.active && daysRemaining >= 0;
              const isCurrentLoading = actionLoading === user.id;

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
                    {isActive ? (
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
                      placeholder="7"
                      min="1"
                      onChange={(e) =>
                        handleDaysChange(user.id, e.target.value)
                      }
                    />
                  </td>
                  <td className="action-buttons">
                    <button
                      className="action-button authorize-button"
                      onClick={() => handleExtendLicense(user.id)}
                      disabled={isCurrentLoading}
                    >
                      {isCurrentLoading ? "..." : "Autorizar"}
                    </button>
                    {isActive && (
                      <button
                        className="action-button revoke-button"
                        onClick={() => handleRevokeLicense(user.id)}
                        disabled={isCurrentLoading}
                      >
                        Revogar
                      </button>
                    )}
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
