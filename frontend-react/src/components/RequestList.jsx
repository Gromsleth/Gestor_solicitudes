// componente lista de solicitudes

export default function RequestList({ requests, onSelectRequest, selectedId }) {
  if (!requests || requests.length === 0) {
    return (
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h2>Listado de Solicitudes</h2>
        <p style={{ color: '#999' }}>No hay solicitudes.</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h2>Listado de Solicitudes ({requests.length})</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Operación</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Feedback</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(request => {
            let statusColor = '#666';
            let statusEmoji = '\u23F3';

            if (request.status === 'Processed') {
              statusColor = '#28a745';  
              statusEmoji = '\u2705';
            } else if (request.status === 'Failed') {
              statusColor = '#dc3545';  
              statusEmoji = '\u274C';
            }

            // Determinar si esta fila está seleccionada
            const isSelected = selectedId === request.id;
            const hasResult = request.result !== null && request.result !== undefined;
            const hasError = typeof request.errorMessage === 'string' && request.errorMessage.trim() !== '';

            let feedback = 'Sin sincronizar';
            if (request.status === 'Processed') {
              feedback = hasResult ? 'Resultado disponible' : 'Procesada sin resultado';
            } else if (request.status === 'Failed') {
              feedback = hasError ? request.errorMessage : 'Falló sin detalle';
            }

            return (
              <tr
                key={request.id}
                style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: isSelected ? '#e3f2fd' : 'white',
                  cursor: 'pointer',
                }}
              >
                <td style={{ padding: '10px' }}>{request.name}</td>
                <td style={{ padding: '10px' }}>{request.operationCode || request.type}</td>
                <td style={{ padding: '10px', color: statusColor, fontWeight: 'bold' }}>
                  {statusEmoji} {request.status}
                </td>
                <td style={{ padding: '10px', maxWidth: '280px' }}>
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: request.status === 'Failed' ? '#dc3545' : '#2c3e50',
                    }}
                    title={feedback}
                  >
                    {feedback}
                  </div>
                </td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => onSelectRequest(request)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
