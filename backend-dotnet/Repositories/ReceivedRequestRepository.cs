using BackendDotnet.Configuration;
using BackendDotnet.Models;

namespace BackendDotnet.Repositories;

/// <summary>
/// Repositorio JSON para solicitudes recibidas por /api/operations/execute.
/// </summary>
public class ReceivedRequestRepository : IReceivedRequestRepository
{
    private readonly string _filePath;
    private readonly object _fileLock = new();
    private readonly ILogger<ReceivedRequestRepository> _logger;

    public ReceivedRequestRepository(ILogger<ReceivedRequestRepository> logger)
    {
        _logger = logger;
        _filePath = DataPathConfig.ReceivedRequestsFilePath;
    }

    public async Task<List<ReceivedRequest>> GetAllAsync()
    {
        return await ReadAllRecordsAsync();
    }

    public async Task<ReceivedRequest> CreateAsync(ReceivedRequest request)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        var records = await ReadAllRecordsAsync();
        records.Add(request);
        await WriteAllRecordsAsync(records);
        return request;
    }

    public async Task ClearAsync()
    {
        await WriteAllRecordsAsync(new List<ReceivedRequest>());
    }

    private async Task<List<ReceivedRequest>> ReadAllRecordsAsync()
    {
        try
        {
            if (!File.Exists(_filePath))
            {
                return new List<ReceivedRequest>();
            }

            var content = await File.ReadAllTextAsync(_filePath);
            if (string.IsNullOrWhiteSpace(content))
            {
                return new List<ReceivedRequest>();
            }

            return JsonSerializerConfig.DeserializeList<ReceivedRequest>(content);
        }
        catch (Exception ex) when (ex is IOException || ex is System.Text.Json.JsonException)
        {
            _logger.LogError(ex, "Error leyendo received-requests en {FilePath}", _filePath);
            throw new InvalidOperationException($"Error al leer received-requests: {ex.Message}", ex);
        }
    }

    private async Task WriteAllRecordsAsync(List<ReceivedRequest> records)
    {
        try
        {
            lock (_fileLock)
            {
                var json = JsonSerializerConfig.Serialize(records);
                File.WriteAllText(_filePath, json);
            }

            await Task.Delay(10);
        }
        catch (IOException ex)
        {
            _logger.LogError(ex, "Error escribiendo received-requests en {FilePath}", _filePath);
            throw new InvalidOperationException($"Error al escribir received-requests: {ex.Message}", ex);
        }
    }
}

