namespace BackendDotnet.Domain;

public interface IOperationProcessor
{
    string OperationCode { get; }

    object Execute(object? payload);
}

