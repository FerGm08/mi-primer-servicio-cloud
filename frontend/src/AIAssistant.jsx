import React, { useState } from 'react';

const API_URL = "https://script.google.com/macros/s/AKfycbxCqT8KKmGfZibum0iIavfrjb_OqCIn_JEGc3qf-RL99sWFxdzczTynKLM6xK8d6_E0/exec";

export function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '¡Hola! Soy tu Asistente Cloud. Pregúntame sobre el stock, precios o estado del inventario.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userQuery = prompt;
    setMessages(prev => [...prev, { sender: 'user', text: userQuery }]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'ask_ai',
          prompt: userQuery
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Ocurrió un error al consultar el asistente.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #333', padding: '15px', borderRadius: '8px', background: '#1e1e2e', color: '#fff', marginTop: '20px' }}>
      <h3>🤖 Asistente Cloud con IA (Gemini API)</h3>
      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '5px 0' }}>
            <span style={{ background: msg.sender === 'user' ? '#007bff' : '#343a40', padding: '6px 12px', borderRadius: '15px', display: 'inline-block' }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <p style={{ fontSize: '0.8em', color: '#aaa' }}>Consultando a Gemini Cloud...</p>}
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: ¿Qué productos tienen menos de 5 unidades?"
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: '4px', background: '#28a745', color: '#fff', border: 'none' }}>
          Enviar
        </button>
      </form>
    </div>
  );
}