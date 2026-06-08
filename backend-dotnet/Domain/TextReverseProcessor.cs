using BackendDotnet.Models;

namespace BackendDotnet.Domain;

public sealed class TextReverseProcessor : IOperationProcessor
{
    public string OperationCode => OperationCodes.TextReverse;

    public object Execute(object? payload)
    {
        var payloadObject = PayloadJsonHelper.RequireObject(payload, OperationCode);
        var text = PayloadJsonHelper.ReadRequiredString(payloadObject, "text", OperationCode);

        var characters = text.ToCharArray();
        Array.Reverse(characters);
        var reversed = new string(characters);

        return new
        {
            originalText = text,
            processedText = reversed
        };
    }
}

