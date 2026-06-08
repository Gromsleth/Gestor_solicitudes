using BackendDotnet.Domain;
using BackendDotnet.Models;

namespace BackendDotnet.Services;

/// <summary>
/// orquestador de operationCode.
/// </summary>
public sealed class OperationService : IOperationService
{
    private readonly ILogger<OperationService> _logger;
    private readonly Dictionary<string, IOperationProcessor> _processorsByCode;
    private readonly IReadOnlyList<OperationDefinition> _operationDefinitions;

    public OperationService(IEnumerable<IOperationProcessor> processors, ILogger<OperationService> logger)
    {
        _logger = logger;

        _processorsByCode = new Dictionary<string, IOperationProcessor>(StringComparer.OrdinalIgnoreCase);
        foreach (var processor in processors)
        {
            if (string.IsNullOrWhiteSpace(processor.OperationCode))
            {
                throw new InvalidOperationException("Todos los procesadores deben definir OperationCode.");
            }

            if (!_processorsByCode.TryAdd(processor.OperationCode, processor))
            {
                throw new InvalidOperationException(
                    $"Hay procesadores duplicados para operationCode '{processor.OperationCode}'.");
            }
        }

        _operationDefinitions = BuildOperationDefinitions();
    }

    public IReadOnlyList<OperationDefinition> GetAvailableOperations()
    {
        return _operationDefinitions;
    }

    public async Task<OperationExecuteResponse> ExecuteAsync(OperationExecuteRequest request)
    {
        if (request == null)
        {
            return await Task.FromResult(new OperationExecuteResponse
            {
                Success = false,
                Message = "La solicitud de ejecución es obligatoria."
            });
        }

        var operationCode = request.OperationCode?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(operationCode))
        {
            return await Task.FromResult(new OperationExecuteResponse
            {
                Success = false,
                RequestId = request.RequestId,
                OperationCode = operationCode,
                Message = "El campo operationCode es obligatorio."
            });
        }

        if (!_processorsByCode.TryGetValue(operationCode, out var processor))
        {
            return await Task.FromResult(new OperationExecuteResponse
            {
                Success = false,
                RequestId = request.RequestId,
                OperationCode = operationCode,
                Message = $"OperationCode desconocido: {operationCode}"
            });
        }

        try
        {
            var result = processor.Execute(request.Payload);
            return await Task.FromResult(new OperationExecuteResponse
            {
                Success = true,
                RequestId = request.RequestId,
                OperationCode = processor.OperationCode,
                Result = result,
                Message = "Operación ejecutada correctamente"
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Validación fallida para operationCode {OperationCode}", operationCode);
            return await Task.FromResult(new OperationExecuteResponse
            {
                Success = false,
                RequestId = request.RequestId,
                OperationCode = operationCode,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado ejecutando operationCode {OperationCode}", operationCode);
            return await Task.FromResult(new OperationExecuteResponse
            {
                Success = false,
                RequestId = request.RequestId,
                OperationCode = operationCode,
                Message = $"Error al ejecutar la operación: {ex.Message}"
            });
        }
    }

    private static IReadOnlyList<OperationDefinition> BuildOperationDefinitions()
    {
        return new List<OperationDefinition>
        {
            new()
            {
                Code = OperationCodes.CalculateIva,
                Name = "Calcular IVA",
                Description = "Calcula el IVA y el total de un valor base",
                PayloadExample = new
                {
                    amount = 100000,
                    ivaRate = 0.19m
                }
            },
            new()
            {
                Code = OperationCodes.TextUppercase,
                Name = "Convertir texto a mayúsculas",
                Description = "Convierte un texto a mayúsculas",
                PayloadExample = new
                {
                    text = "Texto de ejemplo"
                }
            },
            new()
            {
                Code = OperationCodes.TextReverse,
                Name = "Invertir texto",
                Description = "Invierte el texto enviado",
                PayloadExample = new
                {
                    text = "Texto de ejemplo"
                }
            }
        };
    }
}

