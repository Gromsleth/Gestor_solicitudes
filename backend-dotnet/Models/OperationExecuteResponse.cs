using System.Text.Json.Serialization;

namespace BackendDotnet.Models;

/// <summary>
/// Contrato de salida para la ejecución de operaciones.
/// </summary>
public class OperationExecuteResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("requestId")]
    public Guid RequestId { get; set; }

    [JsonPropertyName("operationCode")]
    public string OperationCode { get; set; } = string.Empty;

    [JsonPropertyName("result")]
    public object? Result { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}

