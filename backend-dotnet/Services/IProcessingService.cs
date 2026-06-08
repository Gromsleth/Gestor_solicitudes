// Define operaciones de procesamiento

using BackendDotnet.Models;

namespace BackendDotnet.Services;

/// <summary>
/// Servicio de procesamiento de solicitudes por operationCode.
/// Encapsula la lógica de transformación de datos.
/// </summary>
public interface IProcessingService
{
    /// <summary>
    /// Procesa un payload según su operationCode.
    /// </summary>
    /// <param name="operationCode">Código de operación</param>
    /// <param name="payload">Datos a procesar</param>
    /// <returns>Resultado del procesamiento</returns>
    /// <exception cref="InvalidOperationException">Si el operationCode no es válido</exception>
    object? ProcessByOperationCode(string operationCode, object? payload);

    /// <summary>
    /// Procesa una solicitud completa (valida y procesa).
    /// </summary>
    /// <param name="request">Solicitud a procesar</param>
    /// <returns>Solicitud con result y status actualizados</returns>
    Task<RequestDto> ProcessRequestAsync(RequestDto request);
}
