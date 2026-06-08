using Microsoft.AspNetCore.Mvc;
using BackendDotnet.Models;
using BackendDotnet.Repositories;
using BackendDotnet.Services;

namespace BackendDotnet.Controllers;

// Recibe solicitudes del servicio Node y las persiste

[ApiController]
[Route("api/[controller]")]
public class RequestsController : ControllerBase
{
    private readonly IRequestRepository _repository;
    private readonly IProcessingService _processingService;
    private readonly ILogger<RequestsController> _logger;

    // Inyección de dependencias: repositorio y servicio de procesamiento
    public RequestsController(
        IRequestRepository repository,
        IProcessingService processingService,
        ILogger<RequestsController> logger)
    {
        _repository = repository;
        _processingService = processingService;
        _logger = logger;
    }

    // GET /api/requests
    // devuelve todas las solicitudes almacenadas 
    [HttpGet]
    public async Task<IActionResult> GetAllRequests()
    {
        try
        {
            _logger.LogInformation("GET /api/requests - Obteniendo todas las solicitudes");

            var requests = await _repository.GetAllAsync();

            return Ok(new
            {
                total = requests.Count,
                requests = requests
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener todas las solicitudes");
            return StatusCode(500, new { message = "Error al obtener solicitudes", error = ex.Message });
        }
    }

    // GET /api/requests/{id}
    // devuelve una solicitud específica por ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRequestById(Guid id)
    {
        try
        {
            _logger.LogInformation("GET /api/requests/{Id} - Obteniendo solicitud específica", id);

            var request = await _repository.GetByIdAsync(id);

            if (request == null)
            {
                _logger.LogWarning("Solicitud no encontrada: {Id}", id);
                return NotFound(new { message = "Solicitud no encontrada" });
            }

            return Ok(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener solicitud {Id}", id);
            return StatusCode(500, new { message = "Error al obtener solicitud", error = ex.Message });
        }
    }

    // POST /api/requests/receive
    // recibe una solicitud del servicio Node.js
    [HttpPost("receive")]
    public async Task<IActionResult> ReceiveRequest([FromBody] RequestDto request)
    {
        try
        {
            _logger.LogInformation("POST /api/requests/receive - Recibiendo solicitud: {Name}", request?.Name);

            // Validaciones básicas
            if (request == null)
            {
                _logger.LogWarning("Solicitud nula recibida");
                return BadRequest(new { message = "Solicitud vacía" });
            }

            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.OperationCode))
            {
                _logger.LogWarning("Faltan datos obligatorios en solicitud");
                return BadRequest(new { message = "Faltan datos: name y operationCode son obligatorios" });
            }

            // Generar ID si no viene
            if (request.Id == Guid.Empty)
            {
                request.Id = Guid.NewGuid();
                _logger.LogDebug("ID generado para solicitud: {Id}", request.Id);
            }

            // Establecer status y fecha si no vienen
            if (string.IsNullOrEmpty(request.Status))
            {
                request.Status = RequestStatus.Pending;
            }

            if (request.CreatedAt == default)
            {
                request.CreatedAt = DateTime.UtcNow;
            }

            // Procesar solicitud (transformar payload según operationCode)
            _logger.LogInformation("Procesando solicitud con operationCode: {OperationCode}", request.OperationCode);
            var processedRequest = await _processingService.ProcessRequestAsync(request);

            // Guardar en el repositorio
            var created = await _repository.CreateAsync(processedRequest);

            _logger.LogInformation("Solicitud recibida, procesada y guardada: {Id}", created.Id);
            _logger.LogInformation("Status: {Status}, Resultado: {Result}", created.Status, created.Result);

            // Devolver confirmación exitosa
            return Ok(new
            {
                message = "Solicitud recibida y procesada correctamente",
                received = true,
                requestId = created.Id,
                status = created.Status,
                result = created.Result
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Error de validación al recibir solicitud");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al recibir solicitud");
            return StatusCode(500, new { message = "Error al recibir solicitud", error = ex.Message });
        }
    }

    // DELETE /api/requests/clear
    // limpia todas las solicitudes 
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearRequests()
    {
        try
        {
            _logger.LogInformation("DELETE /api/requests/clear - Eliminando todas las solicitudes");

            await _repository.ClearAsync();

            _logger.LogInformation("Todas las solicitudes eliminadas");

            return Ok(new { message = "Todas las solicitudes fueron eliminadas" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al limpiar solicitudes");
            return StatusCode(500, new { message = "Error al limpiar solicitudes", error = ex.Message });
        }
    }
}
