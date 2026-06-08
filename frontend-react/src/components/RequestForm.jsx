// Formulario para crear solicitudes

import { useEffect, useMemo, useState } from 'react';
import { createRequest } from '../api/requestApi';

export default function RequestForm({ operations = [], onRequestCreated }) {
  const firstOperation = operations[0] || null;

  // Estado del formulario si cambia re-renderiza
  const [formData, setFormData] = useState({
    name: '',
    operationCode: '',
    payload: '',
  });

  // mostrar mensajes de error o exitoso
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedOperation = useMemo(
    () => operations.find((item) => item.code === formData.operationCode) || null,
    [operations, formData.operationCode],
  );

  const selectedPayloadExample = useMemo(
    () => JSON.stringify(selectedOperation?.payloadExample || {}, null, 2),
    [selectedOperation],
  );

  useEffect(() => {
    if (operations.length === 0) {
      setFormData((prev) => ({
        ...prev,
        operationCode: '',
      }));
      return;
    }

    setFormData((prev) => {
      if (prev.operationCode) return prev;

      return {
        ...prev,
        operationCode: firstOperation.code,
        payload: JSON.stringify(firstOperation.payloadExample || {}, null, 2),
      };
    });
  }, [operations, firstOperation]);


  // Actualizar estado mientras se escribe
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'operationCode') {
      const operation = operations.find((item) => item.code === value);

      setFormData((prev) => ({
        ...prev,
        operationCode: value,
        payload: operation
          ? JSON.stringify(operation.payloadExample || {}, null, 2)
          : prev.payload,
      }));
      return;
    }

    // Actualizar solo el campo que cambio
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevenir envío por defecto del navegador

    // Validaciones
    if (!formData.name.trim()) {
      setMessage('El nombre es obligatorio');
      return;
    }
    if (!formData.operationCode.trim()) {
      setMessage('La operación es obligatoria');
      return;
    }
    if (!formData.payload.trim()) {
      setMessage('El payload es obligatorio');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(formData.payload);
      } catch {
        throw new Error('El payload debe ser JSON válido.');
      }

      if (!parsedPayload || typeof parsedPayload !== 'object' || Array.isArray(parsedPayload)) {
        throw new Error('El payload debe ser un objeto JSON válido.');
      }

      // Enviar a Node
      const result = await createRequest({
        name: formData.name,
        operationCode: formData.operationCode,
        payload: parsedPayload,
      });

      setMessage(`Solicitud creada: ${result.id}`);

      // Limpiar formulario
      const activeOperation =
        operations.find((operation) => operation.code === formData.operationCode) || firstOperation;

      setFormData({
        name: '',
        operationCode: activeOperation?.code || '',
        payload: activeOperation
          ? JSON.stringify(activeOperation.payloadExample || {}, null, 2)
          : '',
      });

      // Notificar al componente padre que se creo una solicitud
      if (onRequestCreated) {
        onRequestCreated(result);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h2>Crear Nueva Solicitud</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="operationCode">Operación:</label>
          <select
            id="operationCode"
            name="operationCode"
            value={formData.operationCode}
            onChange={handleChange}
            disabled={operations.length === 0}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            {operations.length === 0 ? (
              <option value="">No hay operaciones disponibles</option>
            ) : (
              operations.map((operation) => (
                <option key={operation.code} value={operation.code}>
                  {operation.code} - {operation.name}
                </option>
              ))
            )}
          </select>
        </div>

        {selectedOperation && (
          <div style={{ marginBottom: '10px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
            <strong>Descripción:</strong> {selectedOperation.description}
            <div style={{ marginTop: '8px' }}>
              <strong>Payload de ejemplo:</strong>
              <pre
                style={{
                  backgroundColor: '#ecf0f1',
                  padding: '10px',
                  borderRadius: '4px',
                  overflowX: 'auto',
                  marginTop: '6px',
                }}
              >
                {selectedPayloadExample}
              </pre>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    payload: selectedPayloadExample,
                  }))
                }
                style={{
                  marginTop: '6px',
                  padding: '6px 10px',
                  backgroundColor: '#2c3e50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Usar payload de ejemplo
              </button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="payload">Payload JSON:</label>
          <textarea
            id="payload"
            name="payload"
            value={formData.payload}
            onChange={handleChange}
            placeholder='Ej: {"text":"texto"}'
            style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || operations.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Enviando...' : 'Crear Solicitud'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          {message}
        </div>
      )}
    </div>
  );
}
