using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using misa.hust.ntlam.api.Entities;
using MySqlConnector;
using Dapper;

namespace misa.hust.ntlam.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PositionsController : ControllerBase
    {
        private string sqlconnectstring = "Server=3.0.89.182;Port=3306;Database=DAOTAO.AI.2022.NTLAM2;Uid=dev;Pwd=12345678;";
        [HttpGet("get-all")]
        public IActionResult GetAllPosition()
        {
            try
            {
                var mySqlConnection = new MySqlConnection(sqlconnectstring);

                string getAllPosition = "SELECT*FROM positions";

                var positions = mySqlConnection.Query<Position>(getAllPosition);
                if (positions != null)
                {
                    return StatusCode(StatusCodes.Status200OK, positions);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest);
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }
    }
}
