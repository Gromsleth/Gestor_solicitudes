// Muestra la lsta de grupos para clasificar las solicitudes

export default function GroupList({
  groups = [],
  selectedGroupId = null,
  onSelectGroup = () => {},
  onCreateGroup = () => {},
  onDeleteGroup = () => {},
}) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>Grupos</h3>
        <button
          onClick={onCreateGroup}
          style={styles.createButton}
        >
          Nuevo Grupo
        </button>
      </div>

      {groups.length === 0 ? (
        <p style={styles.empty}>No hay grupos.</p>
      ) : (
        <div style={styles.groupsList}>
          <button
            onClick={() => onSelectGroup(null)}
            style={{
              ...styles.groupButton,
              ...(selectedGroupId === null && styles.groupButtonActive),
            }}
          >
            Todas ({groups.length})
          </button>

          {groups.map((group) => (
            <div key={group.id} style={styles.groupRow}>
              <button
                onClick={() => onSelectGroup(group.id)}
                style={{
                  ...styles.groupButton,
                  borderLeft: `4px solid ${group.color}`,
                  // Resaltar la seleccion
                  ...(selectedGroupId === group.id && styles.groupButtonActive),
                }}
              >
                <span style={styles.groupName}>{group.name}</span>
                <span
                  style={{
                    ...styles.groupColor,
                    backgroundColor: group.color,
                  }}
                />
              </button>

              {group.isSystem !== true && (
                <button
                  onClick={() => onDeleteGroup(group)}
                  style={styles.deleteButton}
                  title="Eliminar grupo"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Estilos
const styles = {
  container: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  createButton: {
    padding: '6px 12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  groupsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  groupButton: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  groupButtonActive: {
    backgroundColor: '#ecf0f1',
    borderColor: '#3498db',
    fontWeight: 'bold',
  },
  groupName: {
    flex: 1,
  },
  groupColor: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginLeft: '8px',
  },
  deleteButton: {
    padding: '8px 10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  empty: {
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px',
  },
};
