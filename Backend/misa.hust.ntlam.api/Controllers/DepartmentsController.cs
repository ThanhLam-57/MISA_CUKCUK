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
        [HttpGet]
        public IActionResult GetAllDepartment()
        {
            try
            {
                string sqlconnectstring = "Server=127.0.0.1;Port=3306;Database=hust.21h.2022.ntlam;Uid=root;Pwd=123456789;";
                var mySqlConnection = new MySqlConnection(sqlconnectstring);

                string getAllDepartment = "SELECT*FROM department";

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
