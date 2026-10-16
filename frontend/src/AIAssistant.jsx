
import React, { useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycby2ZATL3jY9DmdBvfDijt4Qee3c1R-fdu2iVVPaDoN3AcgSIEYzQ48wqh24eBgMkZnm/exec";

export function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "¡Hola! Puedo consultar tu inventario y ayudarte a agregar, actualizar o eliminar productos. Los cambios requieren tu confirmación."
    }
  ]);
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = async (payload) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Error HTTP " + response.status);
    }

    if (data.status === "error") {
      throw new Error(data.response || data.message || "Error desconocido");
    }

    return data;
  };

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const userQuery = prompt.trim();

    if (!userQuery || loading) return;

    setMessages(prev => [
      ...prev,
      { sender: "user", text: userQuery }
    ]);

    setPrompt("");
    setLoading(true);
    setPending(null);

    try {
      const data = await sendRequest({
        action: "plan_ai",
        prompt: userQuery
      });

      if (data.intent === "query") {
        addMessage(
          "ai",
          data.response || "No se obtuvo una respuesta."
        );
      } else if (
        ["create", "update", "delete"].includes(data.intent)
      ) {
        const plan = {
          intent: data.intent,
          product: data.product || {},
          changes: data.changes || {}
        };

        // Validar que la operación tenga los datos esenciales.
        if (
          plan.intent === "create" &&
          (
            !plan.product.nombre ||
            plan.product.precio === null ||
            plan.product.precio === undefined ||
            !plan.product.categoria ||
            plan.product.stock === null ||
            plan.product.stock === undefined
          )
        ) {
          addMessage(
            "ai",
            "Faltan datos para agregar el producto. " +
            "Indica nombre, precio, categoría y stock."
          );
        } else if (
          ["update", "delete"].includes(plan.intent) &&
          (
            plan.product.id === null ||
            plan.product.id === undefined ||
            plan.product.id === ""
          )
        ) {
          addMessage(
            "ai",
            "Necesito el ID exacto del producto para continuar. " +
            "Puedes consultar primero el inventario."
          );
        } else if (
          plan.intent === "update" &&
          Object.keys(plan.changes).length === 0
        ) {
          addMessage(
            "ai",
            "No se identificaron campos para actualizar. " +
            "Indica qué dato quieres cambiar."
          );
        } else {
          setPending(plan);
          addMessage(
            "ai",
            (data.response || "Revisa la operación propuesta.") +
            "\nRevisa los datos y confirma si deseas continuar."
          );
        }
      } else {
        addMessage(
          "ai",
          data.response || "Necesito más información. Sé más específico."
        );
      }
    } catch (error) {
      addMessage(
        "ai",
        "No se pudo procesar la solicitud: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmOperation = async () => {
    if (!pending || loading) return;

    const operation = pending;
    setLoading(true);

    try {
      let payload;

      if (operation.intent === "create") {
        payload = {
          action: "create",
          confirmed: true,
          product: operation.product
        };
      } else if (operation.intent === "update") {
        payload = {
          action: "update",
          confirmed: true,
          id: operation.product.id,
          changes: operation.changes
        };
      } else {
        payload = {
          action: "delete",
          confirmed: true,
          id: operation.product.id
        };
      }

      const data = await sendRequest(payload);

      addMessage(
        "ai",
        "✅ " + data.response +
        (data.product
          ? "\nProducto: " + JSON.stringify(data.product)
          : "")
      );

      setPending(null);
    } catch (error) {
      addMessage(
        "ai",
        "No se pudo completar la operación: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelOperation = () => {
    setPending(null);
    addMessage("ai", "Operación cancelada. No se realizaron cambios.");
  };

  const money = value =>
    value === null || value === undefined
      ? "No especificado"
      : "$" + value;

  const renderPending = () => {
    if (!pending) return null;

    const p = pending.product;

    return (
      <div style={{
        marginTop: 12,
        padding: 12,
        border: "1px solid #64748b",
        borderRadius: 8,
        background: "#252538"
      }}>
        <strong>
          {pending.intent === "create" && "Confirmar nuevo producto"}
          {pending.intent === "update" && "Confirmar actualización"}
          {pending.intent === "delete" && "Confirmar eliminación"}
        </strong>

        {pending.intent === "create" && (
          <div style={{ marginTop: 8 }}>
            <p>Nombre: {p.nombre}</p>
            <p>Precio: {money(p.precio)}</p>
            <p>Categoría: {p.categoria}</p>
            <p>Stock: {p.stock}</p>
          </div>
        )}

        {pending.intent === "update" && (
          <div style={{ marginTop: 8 }}>
            <p>ID del producto: {p.id}</p>
            <p>Cambios propuestos:</p>
            <pre style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere"
            }}>
              {JSON.stringify(pending.changes, null, 2)}
            </pre>
          </div>
        )}

        {pending.intent === "delete" && (
          <div style={{ marginTop: 8 }}>
            <p>ID del producto: {p.id}</p>
            <p>Nombre: {p.nombre || "No disponible"}</p>
            <p>Precio: {money(p.precio)}</p>
            <p>Stock: {p.stock ?? "No disponible"}</p>
            <p style={{ color: "#fca5a5" }}>
              Esta acción eliminará el registro de Google Sheets.
            </p>
          </div>
        )}

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 12
        }}>
          <button
            type="button"
            onClick={confirmOperation}
            disabled={loading}
            style={{
              padding: "9px 14px",
              border: 0,
              borderRadius: 5,
              color: "#fff",
              background: "#16803d",
              cursor: "pointer"
            }}
          >
            {loading ? "Procesando..." : "Confirmar operación"}
          </button>

          <button
            type="button"
            onClick={cancelOperation}
            disabled={loading}
            style={{
              padding: "9px 14px",
              border: 0,
              borderRadius: 5,
              color: "#fff",
              background: "#b42332",
              cursor: "pointer"
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      border: "1px solid #333",
      padding: 15,
      borderRadius: 8,
      background: "#1e1e2e",
      color: "#fff",
      marginTop: 20
    }}>
      <h3>🤖 Asistente Cloud con Gemini</h3>

      <div style={{
        maxHeight: 320,
        overflowY: "auto",
        marginBottom: 10
      }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "8px 0"
            }}
          >
            <span style={{
              background: msg.sender === "user" ? "#007bff" : "#343a40",
              padding: "8px 12px",
              borderRadius: 12,
              display: "inline-block",
              maxWidth: "90%",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere"
            }}>
              {msg.text}
            </span>
          </div>
        ))}

        {loading && (
          <p style={{ fontSize: "0.85em", color: "#aaa" }}>
            Procesando solicitud...
          </p>
        )}
      </div>

      {renderPending()}

      <form
        onSubmit={handleSendMessage}
        style={{ display: "flex", gap: 8, marginTop: 12 }}
      >
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ej.: agrega 10 mouse a $350..."
          disabled={loading || !!pending}
          style={{
            flex: 1,
            minWidth: 0,
            padding: 9,
            borderRadius: 4,
            border: "none"
          }}
        />

        <button
          type="submit"
          disabled={loading || !!pending || !prompt.trim()}
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            background: "#28a745",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
