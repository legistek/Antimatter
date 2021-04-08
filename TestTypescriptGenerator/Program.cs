using System;
using System.IO;

using Antimatter.Net;
using AntimatterJS.Sample;
using AntimatterJS.Sample.AppModel;

namespace TestTypescriptGenerator
{
    class Program
    {
        static void Main(string[] args)
        {
            using (var str = File.Create(@"C:\VSProjects\Antimatter\Sample\AntimatterJS.Sample.Client\ClientApp\src\model\Model.tsx"))
            {
                using (var sw = new StreamWriter(str))
                {
                    TypescriptGenerator.Generate(typeof(App).Assembly, sw);
                }
            }
        }
    }
}
