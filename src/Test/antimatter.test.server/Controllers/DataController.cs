using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ReactFun2026_07.Server.Controllers
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
                "Antimatter.docx.PDF"
                //"Different Page Sizes.pdf"
            );
            return PhysicalFile(
                physicalPath,
                "application/pdf", 
                "file.pdf",
                enableRangeProcessing: true);
        }        

        [HttpGet]
        [Route("samplevideo")]
        public IActionResult GetVideo()
        {
            string physicalPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "Data",
                "[[PATH TO VIDEO]]");
            return PhysicalFile(
                physicalPath,
                "video/mp4",
                "video.mp4",
                enableRangeProcessing: true);
        }
	}
}
