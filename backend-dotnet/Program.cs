using BackendDotnet.Configuration;
using BackendDotnet.Domain;
using BackendDotnet.Repositories;
using BackendDotnet.Services;

var builder = WebApplication.CreateBuilder(args);

// Inicializar estructura de datos 
DataPathConfig.EnsureDirectoriesExist();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddScoped<IRequestRepository, RequestRepository>();
builder.Services.AddScoped<IReceivedRequestRepository, ReceivedRequestRepository>();
builder.Services.AddScoped<IProcessingService, ProcessingService>();
builder.Services.AddScoped<IOperationProcessor, CalculateIvaProcessor>();
builder.Services.AddScoped<IOperationProcessor, TextUppercaseProcessor>();
builder.Services.AddScoped<IOperationProcessor, TextReverseProcessor>();
builder.Services.AddScoped<IOperationService, OperationService>();

// Habilitar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNodeJs", policy =>
    {
        policy.WithOrigins("http://localhost:3001")
              .AllowAnyMethod()    
              .AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors("AllowNodeJs");
app.MapControllers();
app.Run();
