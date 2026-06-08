// Define la estructura de datos de una solicitud

using System.Text.Json.Serialization;

namespace BackendDotnet.Models;

/// <summary>
/// Modelo de solicitud para persistencia en JSON.
/// </summary>
public class RequestDto
{
    /// <summary>
    /// ID único de la solicitud (UUID string).
    /// Ej: "43f21f5d-fddc-4e5b-95a7-78b98be4d53a"
    /// Se convierte a Guid para manejo en .NET pero se serializa como string en JSON.
    /// </summary>
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    /// <summary>
    /// Nombre descriptivo de la solicitud.
    /// Ej: "Convertir a mayúsculas"
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Código de operación de negocio a ejecutar.
    /// </summary>
    [JsonPropertyName("operationCode")]
    public string OperationCode { get; set; } = string.Empty;

    /// <summary>
    /// Datos a procesar. Puede ser string, número, objeto, etc.
    /// </summary>
    [JsonPropertyName("payload")]
    public object? Payload { get; set; }

    /// <summary>
    /// Estado actual de la solicitud.
    /// </summary>
    [JsonPropertyName("status")]
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Resultado del procesamiento 
    /// Se llena después de procesar según el OperationCode.
    /// </summary>
    [JsonPropertyName("result")]
    public object? Result { get; set; }

    /// <summary>
    /// Mensaje de error cuando la solicitud falla.
    /// </summary>
    [JsonPropertyName("errorMessage")]
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Fecha y hora de creación en formato ISO 8601 UTC.
    /// Se serializa automáticamente con System.Text.Json.
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Fecha/hora en la que la solicitud se sincronizó o procesó.
    /// </summary>
    [JsonPropertyName("syncedAt")]
    public DateTime? SyncedAt { get; set; }
}

/// <summary>
/// Constantes de estados de solicitud.
/// </summary>
public static class RequestStatus
{
    public const string Pending = "Pending";
    public const string Processed = "Processed";
    public const string Failed = "Failed";
}

/// <summary>
/// Constantes de códigos de operación.
/// </summary>
public static class OperationCodes
{
    public const string CalculateIva = "CALCULATE_IVA";
    public const string TextUppercase = "TEXT_UPPERCASE";
    public const string TextReverse = "TEXT_REVERSE";
    public const string StructureJson = "STRUCTURE_JSON";
}
