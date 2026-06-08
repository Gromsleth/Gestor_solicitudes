import { useState, useEffect } from 'react';
import { getRequests, getOperations, syncRequests } from '../api/requestApi';
import { getGroups, createGroup, deleteGroup } from '../api/groupApi';
import RequestForm from '../components/RequestForm';
import RequestList from '../components/RequestList';
import RequestDetail from '../components/RequestDetail';
import GroupList from '../components/GroupList';
import CreateGroupForm from '../components/CreateGroupForm';

export default function Home() {

  // carga solicitudes
  const [requests, setRequests] = useState([]);
  // crea solicitudes
  const [operations, setOperations] = useState([]);
  // Lista de grupos
  const [groups, setGroups] = useState([]);
  // Solicitud seleccionada detalles
  const [selectedRequest, setSelectedRequest] = useState(null);
  // Grupo filtrar solicitudes
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  // mostrar estado de carga
  const [isLoading, setIsLoading] = useState(false);
  // mostrar mensajes de sincronización
  const [syncMessage, setSyncMessage] = useState('');
  // mostrar/ocultar formulario de crear grupo
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  // mensaje de acciones sobre grupos
  const [groupMessage, setGroupMessage] = useState('');

  // Cargar solicitudes y grupos al montar el componente
  useEffect(() => {
    loadRequests();
    loadOperations();
    loadGroups();
  }, []);

  // Cargar solicitudes 
  async function loadRequests() {
    setIsLoading(true);
    try {
      const data = await getRequests();
      setRequests(data);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Cargar operaciones (/api/operations)
  async function loadOperations() {
    try {
      const data = await getOperations();
      setOperations(data);
    } catch (error) {
      console.error('Error cargando operaciones:', error);
      setOperations([]);
    }
  }

  // Cargar grupos 
  async function loadGroups() {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    }
  }

  // Manejar nueva solicitud creada
  async function handleRequestCreated() {
    await loadRequests();
  }

  // Manejar sincronización
  async function handleSync() {
    setIsLoading(true);
    setSyncMessage('Sincronizando...');
    try {
      const result = await syncRequests();
      setSyncMessage(
        `Sincronización: ${result.processed} procesadas, ${result.failed} fallidas (de ${result.totalPending})`
      );
      await loadRequests();
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      setSyncMessage('Error en sincronización');
      setTimeout(() => setSyncMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  }

  // Manejar nuevo grupo creado
  async function handleGroupCreated(groupData) {
    try {
      await createGroup(groupData);
      await loadGroups();
      setShowCreateGroupForm(false);
    } catch (error) {
      console.error('Error creando grupo:', error);
      throw error;
    }
  }

  async function handleGroupDeleted(group) {
    if (!group || !group.id || group.isSystem === true) {
      return;
    }

    const confirmed = window.confirm(`¿Eliminar el grupo "${group.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteGroup(group.id);

      if (selectedGroupId === group.id) {
        setSelectedGroupId(null);
      }

      await loadGroups();
      setGroupMessage(`Grupo "${group.name}" eliminado`);
      setTimeout(() => setGroupMessage(''), 3000);
    } catch (error) {
      setGroupMessage(`${error.message}`);
      setTimeout(() => setGroupMessage(''), 3000);
    }
  }

  function handleSelectGroup(groupId) {
    setSelectedGroupId(groupId);
    setSelectedRequest(null);
  }

  const selectedGroup =
    selectedGroupId === null
      ? null
      : groups.find((group) => group.id === selectedGroupId) || null;

  const validStatusFilters = new Set(['Pending', 'Processed', 'Failed']);

  // Grpos de sistema: por estado 
  const filteredRequests =
    selectedGroupId === null
      ? requests
      : requests.filter((req) => {
          if (
            selectedGroup?.isSystem === true &&
            typeof selectedGroup.statusFilter === 'string' &&
            validStatusFilters.has(selectedGroup.statusFilter)
          ) {
            return req.status === selectedGroup.statusFilter;
          }

          return req.groupId === selectedGroupId;
        });

  //derendizar
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Gestor de solicitudes</h1>
        <p>Crea, clasifica y sincroniza solicitudes</p>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.leftColumn}>
          <RequestForm
            operations={operations}
            onRequestCreated={handleRequestCreated}
          />

          <button
            onClick={handleSync}
            disabled={isLoading}
            style={styles.syncButton}
          >
            {isLoading ? 'Sincronizando...' : 'Sincronizar'}
          </button>

          {syncMessage && <div style={styles.message}>{syncMessage}</div>}

          <hr style={styles.divider} />

          <h2 style={{ marginTop: '20px' }}>Organizar por Grupos</h2>

          <button
            onClick={() => setShowCreateGroupForm(!showCreateGroupForm)}
            style={styles.toggleButton}
          >
            {showCreateGroupForm ? 'Cerrar formulario' : 'Crear grupo'}
          </button>

          {showCreateGroupForm && (
            <CreateGroupForm onGroupCreated={handleGroupCreated} />
          )}

          <GroupList
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={handleSelectGroup}
            onCreateGroup={() => setShowCreateGroupForm(!showCreateGroupForm)}
            onDeleteGroup={handleGroupDeleted}
          />

          {groupMessage && <div style={styles.message}>{groupMessage}</div>}
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.requestsSection}>
            <h2>
              Solicitudes
              {selectedGroupId ? ` (${filteredRequests.length})` : ''}
            </h2>

            {filteredRequests.length === 0 ? (
              <p style={styles.empty}>
                {requests.length === 0
                  ? 'No hay solicitudes.'
                  : selectedGroup?.isSystem
                    ? 'No hay solicitudes con este estado'
                    : 'No hay solicitudes en este grupo'}
              </p>
            ) : (
              <RequestList
                requests={filteredRequests}
                selectedId={selectedRequest?.id || null}
                onSelectRequest={setSelectedRequest}
              />
            )}
          </div>

          <div style={styles.detailSection}>
            <RequestDetail request={selectedRequest} />
          </div>
        </div>
      </div>
    </div>
  );
}


// ESTILOS
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ecf0f1',
    padding: '20px',
  },
  header: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  leftColumn: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  rightColumn: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  syncButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '15px',
    fontSize: '14px',
  },
  toggleButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '15px',
    fontSize: '14px',
  },
  message: {
    backgroundColor: '#d5f4e6',
    color: '#27ae60',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  divider: {
    margin: '20px 0',
    border: 'none',
    borderTop: '1px solid #bdc3c7',
  },
  requestsSection: {
    marginBottom: '20px',
  },
  detailSection: {
    borderTop: '1px solid #ecf0f1',
    paddingTop: '20px',
    marginTop: '20px',
  },
  empty: {
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px',
  },
};
