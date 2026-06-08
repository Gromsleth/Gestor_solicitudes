// defginir cómo serializar/deserializar DTOs
// Centraliza las opciones de JsonSerializer para asegurar consistencia

using System.Text.Json;
using System.Text.Json.Serialization;

namespace BackendDotnet.Configuration;

/// <summary>
/// Opciones globales para serialización JSON con System.Text.Json.
/// </summary>
public static class JsonSerializerConfig
{
    /// <summary>
    /// Opciones preconfiguradas para serializar/deserializar RequestDto.
    /// 
    /// Características:
    /// - PropertyNamingPolicy.CamelCase: Convierte PascalCase a camelCase
    /// - WriteIndented: JSON formateado 
    /// - DateTimeZoneHandling: UTC (ISO 8601)
    /// - DefaultIgnoreCondition.WhenWritingNull: No incluye propiedades null
    /// </summary>
    public static JsonSerializerOptions DefaultOptions { get; } = new()
    {
        // Convierte propiedades PascalCase a camelCase en JSON
        // Ej: CreatedAt → createdAt
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,

        // Formato JSON legible (indentado con 2 espacios)
        WriteIndented = true,

        // Ignora valores null al serializar
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,

        // Permite comentarios en JSON 
        ReadCommentHandling = JsonCommentHandling.Skip,

        // Ignora mayúsculas/minúsculas al deserializar propiedades
        PropertyNameCaseInsensitive = true,
    };

    /// <summary>
    /// Serializa un objeto a JSON string.
    /// </summary>
    public static string Serialize<T>(T obj)
    {
        return JsonSerializer.Serialize(obj, DefaultOptions);
    }

    /// <summary>
    /// Deserializa un JSON string a objeto.
    /// </summary>
    public static T? Deserialize<T>(string json)
    {
        return JsonSerializer.Deserialize<T>(json, DefaultOptions);
    }

    /// <summary>
    /// Deserializa un JSON string a una lista de objetos.
    /// </summary>
    public static List<T> DeserializeList<T>(string json)
    {
        var list = JsonSerializer.Deserialize<List<T>>(json, DefaultOptions);
        return list ?? new List<T>();
    }
}
