using System;
using System.IO;
using System.Threading.Tasks;
using Application.Files;
using Microsoft.Extensions.Hosting;

namespace Infrastructure.Files;

public class LocalFileStorage : IFileStorage
{
    private readonly string _root;

    public LocalFileStorage(IHostEnvironment env)
    {
        _root = Path.Combine(env.ContentRootPath, "uploads");
        Directory.CreateDirectory(_root);
    }

    public async Task<(string path, string name, string contentType)> SaveAsync(Stream stream, string fileName, string contentType)
    {
        var name = $"{Guid.NewGuid()}_{Sanitize(fileName)}";
        var path = Path.Combine(_root, name);
        using var fs = File.Create(path);
        await stream.CopyToAsync(fs);
        return (path, name, contentType);
    }

    private static string Sanitize(string s) => string.Join("_", s.Split(Path.GetInvalidFileNameChars()));
}
