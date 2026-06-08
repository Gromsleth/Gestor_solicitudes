using BackendDotnet.Models;

namespace BackendDotnet.Repositories;

/// <summary>
/// Contrato para persistencia de solicitudes recibidas en operaciones.
/// </summary>
public interface IReceivedRequestRepository
{
    Task<List<ReceivedRequest>> GetAllAsync();

    Task<ReceivedRequest> CreateAsync(ReceivedRequest request);

    Task ClearAsync();
}

