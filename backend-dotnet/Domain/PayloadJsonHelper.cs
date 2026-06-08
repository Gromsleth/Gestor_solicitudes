using System.Globalization;
using System.Text.Json;

namespace BackendDotnet.Domain;

internal static class PayloadJsonHelper
{
    public static JsonElement RequireObject(object? payload, string operationCode)
    {
        if (payload is null)
        {
            throw new InvalidOperationException($"El payload es obligatorio para {operationCode}.");
        }

        if (payload is JsonElement jsonElement)
        {
            if (jsonElement.ValueKind != JsonValueKind.Object)
            {
                throw new InvalidOperationException($"El payload de {operationCode} debe ser un objeto JSON.");
            }

            return jsonElement.Clone();
        }

        try
        {
            var serialized = JsonSerializer.Serialize(payload);
            using var document = JsonDocument.Parse(serialized);
            var root = document.RootElement;

            if (root.ValueKind != JsonValueKind.Object)
            {
                throw new InvalidOperationException($"El payload de {operationCode} debe ser un objeto JSON.");
            }

            return root.Clone();
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException($"Payload invalido para {operationCode}: {ex.Message}", ex);
        }
    }

    public static string ReadRequiredString(JsonElement payloadObject, string propertyName, string operationCode)
    {
        if (!TryGetPropertyIgnoreCase(payloadObject, propertyName, out var value))
        {
            throw new InvalidOperationException($"El campo {propertyName} es obligatorio para {operationCode}.");
        }

        string? text = value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : value.ToString();

        if (string.IsNullOrWhiteSpace(text))
        {
            throw new InvalidOperationException($"El campo {propertyName} es obligatorio para {operationCode}.");
        }

        return text;
    }

    public static decimal ReadRequiredDecimal(JsonElement payloadObject, string propertyName, string operationCode)
    {
        if (!TryGetPropertyIgnoreCase(payloadObject, propertyName, out var value))
        {
            throw new InvalidOperationException($"El campo {propertyName} es obligatorio para {operationCode}.");
        }

        if (value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var number))
        {
            return number;
        }

        if (value.ValueKind == JsonValueKind.String &&
            decimal.TryParse(value.GetString(), NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed))
        {
            return parsed;
        }

        throw new InvalidOperationException(
            $"El campo {propertyName} debe ser numerico para {operationCode}.");
    }

    private static bool TryGetPropertyIgnoreCase(JsonElement objectElement, string propertyName, out JsonElement value)
    {
        if (objectElement.ValueKind != JsonValueKind.Object)
        {
            value = default;
            return false;
        }

        if (objectElement.TryGetProperty(propertyName, out value))
        {
            return true;
        }

        foreach (var property in objectElement.EnumerateObject())
        {
            if (string.Equals(property.Name, propertyName, StringComparison.OrdinalIgnoreCase))
            {
                value = property.Value;
                return true;
            }
        }

        value = default;
        return false;
    }
}

