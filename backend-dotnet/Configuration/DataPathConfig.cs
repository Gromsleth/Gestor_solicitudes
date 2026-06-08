// definir donde se almacenan los archivos JSON

namespace BackendDotnet.Configuration;

/// <summary>
/// Centraliza las rutas de almacenamiento de datos.
/// </summary>
public static class DataPathConfig
{
    /// <summary>
    /// Directorio base donde se guardan todos los archivos de datos.
    /// Ruta: backend-dotnet/BackendDotnet/data/
    /// </summary>
    public static string DataDirectory { get; } = Path.Combine(
        AppContext.BaseDirectory,
        "..", "..", "..", // Navega desde bin/Debug/net10.0/ a la raíz del proyecto
        "data"
    );

    /// <summary>
    /// Este archivo almacena todas las solicitudes procesadas.
    /// </summary>
    public static string SolicitudesFilePath { get; } = Path.Combine(
        DataDirectory,
        "solicitudes.json"
    );

    /// <summary>
    /// Ruta completa al archivo de solicitudes recibidas por el endpoint de operaciones.
    /// </summary>
    public static string ReceivedRequestsFilePath { get; } = Path.Combine(
        DataDirectory,
        "received-requests.json"
    );

    /// <summary>
    /// Inicializa la estructura de directorios si no existen.
    /// </summary>
    public static void EnsureDirectoriesExist()
    {
        try
        {
            if (!Directory.Exists(DataDirectory))
            {
                Directory.CreateDirectory(DataDirectory);
                Console.WriteLine($"Directorio de datos creado: {DataDirectory}");
            }

            // Crear archivo vacío si no existe
            if (!File.Exists(SolicitudesFilePath))
            {
                File.WriteAllText(SolicitudesFilePath, "[]");
                Console.WriteLine($"Archivo solicitudes creado: {SolicitudesFilePath}");
            }

            if (!File.Exists(ReceivedRequestsFilePath))
            {
                File.WriteAllText(ReceivedRequestsFilePath, "[]");
                Console.WriteLine($"Archivo solicitudes recibidas creado: {ReceivedRequestsFilePath}");
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Error al inicializar directorios de datos: {ex.Message}",
                ex
            );
        }
    }
}
