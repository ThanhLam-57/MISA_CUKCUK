using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using misa.hust.ntlam.api.Entities;
using MySqlConnector;
using Dapper;

namespace misa.hust.ntlam.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private string sqlconnectstring = "Server=3.0.89.182;Port=3306;Database=DAOTAO.AI.2022.NTLAM2;Uid=dev;Pwd=12345678;";
        [HttpGet("get-all")]
        public IActionResult GetAllDepartment()
        {
            try
            {
                var mySqlConnection = new MySqlConnection(sqlconnectstring);

                string getAllDepartment = "SELECT * FROM department";

                var departments = mySqlConnection.Query<Department>(getAllDepartment);
                if (departments != null)
                {
                    return StatusCode(StatusCodes.Status200OK, departments);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest);
                }
            }
            catch(Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }
    }
}
