using System.Text.Json.Serialization;

namespace BackendDotnet.Models;

/// <summary>
/// Contrato de entrada para ejecutar una operación.
/// Se usa en POST /api/operations/execute.
/// </summary>
public class OperationExecuteRequest
{
    [JsonPropertyName("requestId")]
    public Guid RequestId { get; set; }

    [JsonPropertyName("operationCode")]
    public string OperationCode { get; set; } = string.Empty;

    [JsonPropertyName("payload")]
    public object? Payload { get; set; }
}

