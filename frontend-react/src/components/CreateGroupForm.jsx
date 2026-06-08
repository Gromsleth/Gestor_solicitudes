// Formulario para crear nuevos grupos de clasificación

import { useState } from 'react';

export default function CreateGroupForm({
  onGroupCreated = () => {},
}) {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db', //azul por defeto
  });

  // Estado para saber si esta guardando
  const [isSaving, setIsSaving] = useState(false);
  // Estado para mensajes de error
  const [error, setError] = useState('');
  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error cuando el usuario comienza a escribir
    setError('');
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación
    if (!formData.name.trim()) {
      setError('El nombre del grupo es obligatorio');
      return;
    }

    try {
      setIsSaving(true);

      // Llama funcion padre para crear grupo
      await onGroupCreated(formData);

      // Resetear formulario
      setFormData({
        name: '',
        description: '',
        color: '#3498db',
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Error al crear grupo');
    } finally {
      setIsSaving(false);
    }
  };

  // Colores disponibles
  const colorOptions = [
    '#3498db', // Azul
    '#e74c3c', // Rojo
    '#2ecc71', // Verde
    '#f39c12', // Naranja
    '#9b59b6', // Púrpura
    '#1abc9c', // Verde azulado
    '#e67e22', // Naranja oscuro
    '#34495e', // Gris oscuro
  ];

  return (
    <div style={styles.container}>
      <h3>Crear Nuevo Grupo</h3>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nombre del grupo *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Por revisar"
            style={styles.input}
            disabled={isSaving}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ej: Solicitudes pendientes de revisión"
            style={styles.textarea}
            disabled={isSaving}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Color del grupo</label>
          <div style={styles.colorSelector}>
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    color,
                  }))
                }
                style={{
                  ...styles.colorButton,
                  backgroundColor: color,
                  border:
                    formData.color === color
                      ? '3px solid #000'
                      : '2px solid #ddd',
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          style={styles.submitButton}
        >
          {isSaving ? 'Creando...' : 'Crear Grupo'}
        </button>
      </form>
    </div>
  );
}

// Estilos 
const styles = {
  container: {
    padding: '15px',
    backgroundColor: '#ecf0f1',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '14px',
  },
  input: {
    padding: '8px',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '8px',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    minHeight: '60px',
    resize: 'vertical',
  },
  colorSelector: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    padding: '10px 15px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  error: {
    color: '#e74c3c',
    backgroundColor: '#fadbd8',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    fontSize: '14px',
  },
};
