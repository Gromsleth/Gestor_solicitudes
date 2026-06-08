using BackendDotnet.Models;

namespace BackendDotnet.Domain;

public sealed class TextUppercaseProcessor : IOperationProcessor
{
    public string OperationCode => OperationCodes.TextUppercase;

    public object Execute(object? payload)
    {
        var payloadObject = PayloadJsonHelper.RequireObject(payload, OperationCode);
        var text = PayloadJsonHelper.ReadRequiredString(payloadObject, "text", OperationCode);

        return new
        {
            originalText = text,
            processedText = text.ToUpperInvariant()
        };
    }
}

