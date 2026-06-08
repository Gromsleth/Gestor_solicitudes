using System.Text.Json.Serialization;

namespace BackendDotnet.Models;

/// <summary>
/// Define una operación disponible para ejecutar desde el frontend.
/// Se usa en GET /api/operations.
/// </summary>
public class OperationDefinition
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("payloadExample")]
    public object? PayloadExample { get; set; }
}

