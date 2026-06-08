// Define el contrato para acceso a datos

using BackendDotnet.Models;

namespace BackendDotnet.Repositories;

/// <summary>
/// Interfaz que define todas las operaciones de lectura/escritura de solicitudes.
/// Implementa el patrón Repository para abstraer el almacenamiento.
/// </summary>
public interface IRequestRepository
{
    /// <summary>
    /// Obtiene todas las solicitudes.
    /// </summary>
    /// <returns>Lista de todas las solicitudes almacenadas.</returns>
    Task<List<RequestDto>> GetAllAsync();

    /// <summary>
    /// Obtiene una solicitud específica por ID.
    /// </summary>
    /// <param name="id">ID (GUID) de la solicitud.</param>
    /// <returns>La solicitud si existe, null si no.</returns>
    Task<RequestDto?> GetByIdAsync(Guid id);

    /// <summary>
    /// Crea una nueva solicitud y la almacena.
    /// </summary>
    /// <param name="request">Datos de la solicitud a crear.</param>
    /// <returns>La solicitud creada (con ID y timestamp).</returns>
    Task<RequestDto> CreateAsync(RequestDto request);

    /// <summary>
    /// Actualiza una solicitud existente.
    /// </summary>
    /// <param name="request">Datos actualizados de la solicitud.</param>
    /// <returns>La solicitud actualizada, o null si no existe.</returns>
    Task<RequestDto?> UpdateAsync(RequestDto request);

    /// <summary>
    /// Obtiene solo las solicitudes con status = "Pending" (pendientes).
    /// Útil para procesar solicitudes sin sincronizar.
    /// </summary>
    /// <returns>Lista de solicitudes pendientes.</returns>
    Task<List<RequestDto>> GetPendingAsync();

    /// <summary>
    /// Elimina todas las solicitudes.
    /// Útil para pruebas y limpieza de datos.
    /// </summary>
    Task ClearAsync();
}
