using System.IO;
using System.Threading.Tasks;

namespace Application.Files;

public interface IFileStorage
{
    Task<(string path, string name, string contentType)> SaveAsync(Stream stream, string fileName, string contentType);
}
