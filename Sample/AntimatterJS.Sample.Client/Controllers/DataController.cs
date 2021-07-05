using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AntimatterJS.Sample.Client.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DataController : ControllerBase
    {        
        [HttpGet]
        public IActionResult Get()
        {
            string physicalPath = Path.Combine(
              Directory.GetCurrentDirectory(),
              "Data",
              //"Absurdely Long PDF 15000 pages.pdf"
              //"Microsoft_Win7_UXGuide5.pdf"
              "Different Page Sizes.pdf"
              );

			return PhysicalFile(
				physicalPath,
				"application/octet-stream",
				"Microsoft_Win7_UXGuide5.pdf",
				enableRangeProcessing: true);
        }        
	}
}
