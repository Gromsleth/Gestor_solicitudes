using BackendDotnet.Models;

namespace BackendDotnet.Services;

/// <summary>
/// Servicio para consultar operaciones disponibles y ejecutar por operationCode.
/// </summary>
public interface IOperationService
{
    IReadOnlyList<OperationDefinition> GetAvailableOperations();

    Task<OperationExecuteResponse> ExecuteAsync(OperationExecuteRequest request);
}

