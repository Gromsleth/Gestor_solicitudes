// Procesa payloads según tipo

using System.Text.Json;
using BackendDotnet.Models;

namespace BackendDotnet.Services;

/// <summary>
/// Servicio que procesa solicitudes según su operationCode.
/// Implementa la lógica de transformación específica para cada tipo.
/// </summary>
public class ProcessingService : IProcessingService
{
    private readonly ILogger<ProcessingService> _logger;

    public ProcessingService(ILogger<ProcessingService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Procesa un payload según el operationCode especificado.
    /// </summary>
    public object? ProcessByOperationCode(string operationCode, object? payload)
    {
        _logger.LogInformation("Procesando por operationCode: {OperationCode}", operationCode);

        return operationCode switch
        {
            OperationCodes.TextUppercase => ProcessTextUppercase(payload),
            OperationCodes.TextReverse => ProcessTextReverse(payload),
            OperationCodes.StructureJson => ProcessStructureJson(payload),
            _ => throw new InvalidOperationException($"OperationCode desconocido: {operationCode}")
        };
    }

    /// <summary>
    /// Procesa una solicitud completa: procesa payload y actualiza estado.
    /// </summary>
    public async Task<RequestDto> ProcessRequestAsync(RequestDto request)
    {
        _logger.LogInformation(
            "ProcessRequestAsync - Procesando solicitud: {Name} ({OperationCode})",
            request.Name,
            request.OperationCode);

        try
        {
            // Procesar payload según operationCode
            var result = ProcessByOperationCode(request.OperationCode, request.Payload);

            // Actualizar solicitud con resultado
            request.Result = result;
            request.Status = RequestStatus.Processed;
            request.ErrorMessage = null;
            request.SyncedAt ??= DateTime.UtcNow;

            _logger.LogInformation("Solicitud procesada exitosamente: {Id}", request.Id);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "OperationCode desconocido: {OperationCode}", request.OperationCode);
            request.Status = RequestStatus.Failed;
            request.Result = new { error = ex.Message };
            request.ErrorMessage = ex.Message;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar solicitud: {Id}", request.Id);
            request.Status = RequestStatus.Failed;
            request.Result = new { error = ex.Message };
            request.ErrorMessage = ex.Message;
        }

        return await Task.FromResult(request);
    }

    // procesamiento por tipo

    /// <summary>
    /// TEXT_UPPERCASE: Convierte el payload a mayúsculas.
    /// </summary>

    private object? ProcessTextUppercase(object? payload)
    {
        if (payload == null)
        {
            _logger.LogWarning("Payload nulo para TEXT_UPPERCASE");
            return string.Empty;
        }

        try
        {
            var text = payload.ToString() ?? string.Empty;
            var result = text.ToUpper();

            _logger.LogDebug("TEXT_UPPERCASE: '{Input}' → '{Output}'", text, result);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en ProcessTextUppercase");
            throw;
        }
    }

    /// <summary>
    /// TEXT_REVERSE: Invierte el payload (revierte el string).
    /// </summary>
    private object? ProcessTextReverse(object? payload)
    {
        if (payload == null)
        {
            _logger.LogWarning("Payload nulo para TEXT_REVERSE");
            return string.Empty;
        }

        try
        {
            var text = payload.ToString() ?? string.Empty;
            var charArray = text.ToCharArray();
            Array.Reverse(charArray);
            var result = new string(charArray);

            _logger.LogDebug("TEXT_REVERSE: '{Input}' → '{Output}'", text, result);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en ProcessTextReverse");
            throw;
        }
    }

    /// <summary>
    /// STRUCTURE_JSON: Procesa estructuras JSON (extrae información o transforma).
    /// Para este ejemplo: cuenta propiedades y retorna estadísticas.
    /// </summary>
    /// <example>
    /// Entrada: {"nombre": "Juan", "edad": 25}
    /// Salida: {"propiedades": 2, "campos": ["nombre", "edad"]}
    /// </example>
    private object? ProcessStructureJson(object? payload)
    {
        if (payload == null)
        {
            _logger.LogWarning("Payload nulo para STRUCTURE_JSON");
            return new { error = "Payload es nulo" };
        }

        try
        {
            // Si es string, intentar parsear como JSON
            if (payload is string jsonString)
            {
                var doc = JsonDocument.Parse(jsonString);
                var root = doc.RootElement;

                // Extraer propiedades si es un objeto
                if (root.ValueKind == JsonValueKind.Object)
                {
                    var propiedades = root.EnumerateObject().Count();
                    var campos = root.EnumerateObject().Select(p => p.Name).ToList();

                    var result = new
                    {
                        tipo = "object",
                        propiedades = propiedades,
                        campos = campos,
                        datos = JsonDocument.Parse(jsonString).RootElement.GetRawText()
                    };

                    _logger.LogDebug("STRUCTURE_JSON: Analizadas {Count} propiedades", propiedades);
                    return result;
                }

                // Si es un array
                if (root.ValueKind == JsonValueKind.Array)
                {
                    var elementos = root.GetArrayLength();
                    return new
                    {
                        tipo = "array",
                        elementos = elementos
                    };
                }

                return new { tipo = root.ValueKind.ToString() };
            }

            // Si es un objeto directo, convertir a JSON y procesar
            var json = JsonSerializer.Serialize(payload);
            return ProcessStructureJson(json);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "JSON inválido en ProcessStructureJson");
            return new { error = $"JSON inválido: {ex.Message}" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en ProcessStructureJson");
            throw;
        }
    }
}
