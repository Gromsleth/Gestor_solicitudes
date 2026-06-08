// componente Detalle de una solicitud

export default function RequestDetail({ request }) {
  // si no hay solicitud seleccionada, mostrar mensaje
  if (!request) {
    return (
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h2>Detalle de Solicitud</h2>
        <p style={{ color: '#999' }}>Selecciona una solicitud para ver detalles</p>
      </div>
    );
  }

  // formatear fechas 
  const createdDate = request.createdAt
    ? new Date(request.createdAt).toLocaleString('es-ES')
    : 'N/A';
  const syncedDate = request.syncedAt
    ? new Date(request.syncedAt).toLocaleString('es-ES')
    : 'No sincronizada';

  // Color segun estado
  let statusStyle = { color: '#666' };
  if (request.status === 'Processed') {
    statusStyle = { color: '#28a745', fontWeight: 'bold' };
  } else if (request.status === 'Failed') {
    statusStyle = { color: '#dc3545', fontWeight: 'bold' };
  } else {
    statusStyle = { color: '#ff9800', fontWeight: 'bold' };
  }

  return (
    <div style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '5px' }}>
      <h2>Detalle de Solicitud</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px' }}>
        
        <strong>ID:</strong>
        <div style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {request.id}
        </div>

        <strong>Nombre:</strong>
        <div>{request.name}</div>

        <strong>Operación:</strong>
        <div>{request.operationCode || request.type}</div>

        <strong>Estado:</strong>
        <div style={statusStyle}>
          {request.status === 'Processed' ? 'Procesada' :
           request.status === 'Failed' ? 'Fallida' :
           'Pendiente'}
        </div>

        <strong>Contenido original:</strong>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '3px',
          fontFamily: 'monospace',
          wordBreak: 'break-all'
        }}>
          {typeof request.payload === 'string'
            ? request.payload
            : JSON.stringify(request.payload, null, 2)}
        </div>

        <strong>Creado:</strong>
        <div>{createdDate}</div>

        <strong>Sincronizado:</strong>
        <div>{syncedDate}</div>
      </div>

      {request.status === 'Processed' && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#e9f7ef',
          borderLeft: '4px solid #28a745',
          borderRadius: '3px'
        }}>
          <strong style={{ color: '#28a745' }}>Resultado:</strong>
          <pre style={{
            marginTop: '8px',
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            overflowX: 'auto'
          }}>
            {JSON.stringify(request.result, null, 2)}
          </pre>
        </div>
      )}

      {request.status === 'Failed' && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          borderLeft: '4px solid #dc3545',
          borderRadius: '3px'
        }}>
          <strong style={{ color: '#dc3545' }}>Error de sincronización:</strong>
          <div style={{ marginTop: '6px' }}>
            {request.errorMessage || 'No hay detalle de error disponible.'}
          </div>
        </div>
      )}
    </div>
  );
}
