using BackendDotnet.Models;
using BackendDotnet.Repositories;
using BackendDotnet.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackendDotnet.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OperationsController : ControllerBase
{
    private readonly IOperationService _operationService;
    private readonly IReceivedRequestRepository _receivedRequestRepository;
    private readonly ILogger<OperationsController> _logger;

    public OperationsController(
        IOperationService operationService,
        IReceivedRequestRepository receivedRequestRepository,
        ILogger<OperationsController> logger)
    {
        _operationService = operationService;
        _receivedRequestRepository = receivedRequestRepository;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetOperations()
    {
        try
        {
            var operations = _operationService.GetAvailableOperations();
            return Ok(operations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener operaciones disponibles");
            return StatusCode(500, new { message = "Error al obtener operaciones" });
        }
    }

    [HttpGet("received-requests")]
    public async Task<IActionResult> GetReceivedRequests()
    {
        try
        {
            var requests = await _receivedRequestRepository.GetAllAsync();
            return Ok(new
            {
                total = requests.Count,
                requests
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener solicitudes recibidas");
            return StatusCode(500, new { message = "Error al obtener solicitudes recibidas" });
        }
    }

    [HttpPost("execute")]
    public async Task<IActionResult> ExecuteOperation([FromBody] OperationExecuteRequest request)
    {
        if (request == null)
        {
            return BadRequest(new OperationExecuteResponse
            {
                Success = false,
                Message = "La solicitud de ejecución es obligatoria."
            });
        }

        if (request.RequestId == Guid.Empty)
        {
            return BadRequest(new OperationExecuteResponse
            {
                Success = false,
                RequestId = request.RequestId,
                OperationCode = request.OperationCode ?? string.Empty,
                Message = "El campo requestId es obligatorio."
            });
        }

        if (string.IsNullOrWhiteSpace(request.OperationCode))
        {
            return BadRequest(new OperationExecuteResponse
            {
                Success = false,
                RequestId = request.RequestId,
                OperationCode = string.Empty,
                Message = "El campo operationCode es obligatorio."
            });
        }

        try
        {
            var response = await _operationService.ExecuteAsync(request);

            await _receivedRequestRepository.CreateAsync(new ReceivedRequest
            {
                RequestId = request.RequestId,
                OperationCode = request.OperationCode,
                Payload = request.Payload,
                Success = response.Success,
                Result = response.Result,
                Message = response.Message,
                ReceivedAt = DateTime.UtcNow
            });

            return response.Success ? Ok(response) : BadRequest(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error al ejecutar operación {OperationCode} para requestId {RequestId}",
                request.OperationCode,
                request.RequestId);

            return StatusCode(500, new OperationExecuteResponse
            {
                Success = false,
                RequestId = request.RequestId,
                OperationCode = request.OperationCode,
                Message = "Error interno al ejecutar la operación."
            });
        }
    }
}
