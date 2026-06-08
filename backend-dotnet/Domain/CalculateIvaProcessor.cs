using BackendDotnet.Models;

namespace BackendDotnet.Domain;

public sealed class CalculateIvaProcessor : IOperationProcessor
{
    public string OperationCode => OperationCodes.CalculateIva;

    public object Execute(object? payload)
    {
        var payloadObject = PayloadJsonHelper.RequireObject(payload, OperationCode);
        var amount = PayloadJsonHelper.ReadRequiredDecimal(payloadObject, "amount", OperationCode);
        var ivaRate = PayloadJsonHelper.ReadRequiredDecimal(payloadObject, "ivaRate", OperationCode);

        if (amount < 0)
        {
            throw new InvalidOperationException("El campo amount no puede ser negativo.");
        }

        if (ivaRate < 0)
        {
            throw new InvalidOperationException("El campo ivaRate no puede ser negativo.");
        }

        var ivaAmount = decimal.Round(amount * ivaRate, 2, MidpointRounding.AwayFromZero);
        var totalAmount = decimal.Round(amount + ivaAmount, 2, MidpointRounding.AwayFromZero);

        return new
        {
            baseAmount = amount,
            ivaRate,
            ivaAmount,
            totalAmount
        };
    }
}

