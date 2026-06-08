// Acceso a datos mediante archivos JSON

using System.Text.Json;
using BackendDotnet.Configuration;
using BackendDotnet.Models;

namespace BackendDotnet.Repositories;

/// <summary>
/// Repositorio de solicitudes basado en archivos JSON.
/// 
/// Responsabilidades:
/// - Leer datos del archivo JSON
/// - Escribir datos al archivo JSON
/// - Operaciones CRUD (Create, Read, Update, Delete)
/// </summary>
public class RequestRepository : IRequestRepository
{
    private readonly string _filePath;
    private readonly ILogger<RequestRepository> _logger;
    private readonly object _fileLock = new(); // Para evitar conflictos de escritura

    public RequestRepository(ILogger<RequestRepository> logger)
    {
        _logger = logger;
        _filePath = DataPathConfig.SolicitudesFilePath;
    }

    /// <summary>
    /// Lee el archivo JSON y lo deserializa a una lista de RequestDto.
    /// </summary>
    private async Task<List<RequestDto>> ReadAllRecordsAsync()
    {
        try
        {
            // Verificar que el archivo existe
            if (!File.Exists(_filePath))
            {
                _logger.LogWarning("Archivo {FilePath} no existe. Inicializando vacío.", _filePath);
                return new List<RequestDto>();
            }

            // Leer contenido 
            var content = await File.ReadAllTextAsync(_filePath);

            // Si es vacio, retornar lista vacía
            if (string.IsNullOrWhiteSpace(content))
                return new List<RequestDto>();

            // Deserializar JSON
            var records = JsonSerializerConfig.DeserializeList<RequestDto>(content);
            _logger.LogDebug("Leídas {Count} solicitudes del archivo.", records.Count);

            return records;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error al deserializar JSON en {FilePath}.", _filePath);
            throw new InvalidOperationException($"El archivo JSON es inválido: {ex.Message}", ex);
        }
        catch (IOException ex)
        {
            _logger.LogError(ex, "Error de I/O al leer {FilePath}.", _filePath);
            throw new InvalidOperationException($"Error al leer archivo: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Escribe una lista de solicitudes al archivo JSON.
    /// Usa lock para evitar conflictos de escritura concurrente.
    /// </summary>
    private async Task WriteAllRecordsAsync(List<RequestDto> records)
    {
        try
        {
            lock (_fileLock)
            {
                // Serializar a JSON
                var json = JsonSerializerConfig.Serialize(records);

                // Escribir al archivo (sobrescribir si existe)
                File.WriteAllText(_filePath, json);

                _logger.LogDebug("Escritas {Count} solicitudes al archivo.", records.Count);
            }

            // Pequeño delay para asegurar que el archivo se escribió
            await Task.Delay(10);
        }
        catch (IOException ex)
        {
            _logger.LogError(ex, "Error de I/O al escribir en {FilePath}.", _filePath);
            throw new InvalidOperationException($"Error al escribir archivo: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Obtiene todas las solicitudes almacenadas.
    /// </summary>
    public async Task<List<RequestDto>> GetAllAsync()
    {
        _logger.LogInformation("GetAllAsync - Obteniendo todas las solicitudes");
        return await ReadAllRecordsAsync();
    }

    /// <summary>
    /// Obtiene una solicitud específica por ID.
    /// </summary>
    public async Task<RequestDto?> GetByIdAsync(Guid id)
    {
        _logger.LogInformation("GetByIdAsync - Obteniendo solicitud: {Id}", id);
        var records = await ReadAllRecordsAsync();
        var request = records.FirstOrDefault(r => r.Id == id);

        if (request == null)
            _logger.LogWarning("Solicitud no encontrada: {Id}", id);

        return request;
    }

    /// <summary>
    /// Crea una nueva solicitud y la almacena en el archivo.
    /// </summary>
    public async Task<RequestDto> CreateAsync(RequestDto request)
    {
        _logger.LogInformation(
            "CreateAsync - Creando solicitud: {Name} ({OperationCode})",
            request.Name,
            request.OperationCode);

        // Validaciones
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (request.Id == Guid.Empty)
            throw new ArgumentException("El ID no puede estar vacío");

        // Leer registros actuales
        var records = await ReadAllRecordsAsync();

        // Verificar que no existe el ID
        if (records.Any(r => r.Id == request.Id))
        {
            _logger.LogWarning("Solicitud con ID duplicado ya existe: {Id}", request.Id);
            throw new InvalidOperationException($"Ya existe una solicitud con ID: {request.Id}");
        }

        // Agregar nuevo registro
        records.Add(request);

        // Escribir de vuelta
        await WriteAllRecordsAsync(records);

        _logger.LogInformation("Solicitud creada exitosamente: {Id}", request.Id);
        return request;
    }

    /// <summary>
    /// Actualiza una solicitud existente.
    /// </summary>
    public async Task<RequestDto?> UpdateAsync(RequestDto request)
    {
        _logger.LogInformation("UpdateAsync - Actualizando solicitud: {Id}", request.Id);

        if (request == null)
            throw new ArgumentNullException(nameof(request));

        // Leer registros actuales
        var records = await ReadAllRecordsAsync();

        // Buscar el índice del registro
        var index = records.FindIndex(r => r.Id == request.Id);

        if (index == -1)
        {
            _logger.LogWarning("Solicitud no encontrada para actualizar: {Id}", request.Id);
            return null;
        }

        // Reemplazar
        records[index] = request;

        // Escribir de vuelta
        await WriteAllRecordsAsync(records);

        _logger.LogInformation("Solicitud actualizada exitosamente: {Id}", request.Id);
        return request;
    }

    /// <summary>
    /// Obtiene solo las solicitudes pendientes (status = "Pending").
    /// </summary>
    public async Task<List<RequestDto>> GetPendingAsync()
    {
        _logger.LogInformation("GetPendingAsync - Obteniendo solicitudes pendientes");
        var records = await ReadAllRecordsAsync();
        var pending = records
            .Where(r => r.Status == RequestStatus.Pending)
            .ToList();

        _logger.LogInformation("Se encontraron {Count} solicitudes pendientes", pending.Count);
        return pending;
    }

    /// <summary>
    /// Elimina todas las solicitudes (limpia el archivo).
    /// </summary>
    public async Task ClearAsync()
    {
        _logger.LogInformation("ClearAsync - Eliminando todas las solicitudes");

        try
        {
            lock (_fileLock)
            {
                // Escribir array vacío
                File.WriteAllText(_filePath, "[]");
                _logger.LogInformation("Todas las solicitudes eliminadas");
            }

            await Task.Delay(10);
        }
        catch (IOException ex)
        {
            _logger.LogError(ex, "Error al limpiar solicitudes");
            throw new InvalidOperationException($"Error al limpiar solicitudes: {ex.Message}", ex);
        }
    }
}
