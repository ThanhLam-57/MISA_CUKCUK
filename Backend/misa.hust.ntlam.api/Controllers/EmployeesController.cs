using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using misa.hust.ntlam.api.Entities;
using misa.hust.ntlam.api.Entities.DTO;
using MySqlConnector;
using Dapper;

namespace misa.hust.ntlam.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private string sqlconnectstring = "Server=3.0.89.182;Port=3306;Database=DAOTAO.AI.2022.NTLAM2;Uid=dev;Pwd=12345678;";
        [HttpGet]/// done
        public IActionResult GetAllEmployee()
        {
            try
            {
                //string sqlconnectstring = "Server=127.0.0.1;Port=3306;Database=hust.21h.2022.ntlam;Uid=root;Pwd=123456789;";
                var mySqlConnection = new MySqlConnection(sqlconnectstring);

                string getAllEmployee = "SELECT * FROM employee ORDER BY ModifiedDate DESC LIMIT 100";

                var employees = mySqlConnection.Query<Employee>(getAllEmployee);
                if (employees != null)
                {
                    return StatusCode(StatusCodes.Status200OK, employees);
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


        /// <summary>
        /// API laays thoong tin chi tiet nhan vien
        /// </summary>
        /// <param name="employeeID">ID nhan vien</param>
        /// <returns>Thong tin chi tiet nhan vien</returns>       
        [HttpGet]//done
        [Route("{employeeID}")]
        public IActionResult GetEmployeeByID(Guid employeeID)
        {
            try
            {
                //string sqlconnectstring = "Server=127.0.0.1;Port=3306;Database=hust.21h.2022.ntlam;Uid=root;Pwd=123456789;";
                var mySqlConnection = new MySqlConnection(sqlconnectstring);

                string getEmployeeByIDCommand = "SELECT * FROM employee WHERE EmployeeId = @EmployeeID";

                var parameters = new DynamicParameters();
                parameters.Add("@EmployeeID", employeeID);

               var employee = mySqlConnection.QueryFirstOrDefault(getEmployeeByIDCommand, parameters);

                if (employee != null)
                {
                    return StatusCode(StatusCodes.Status200OK, employee);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }

            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }


        /// <summary>
        /// API loc danh sach nhan vien co dieu kien tim kiem va phan trang
        /// </summary>
        /// <param name="keyword">tu khoas tim kiem</param>
        /// <param name="positionID">ID vi tri</param>
        /// <param name="departmentID">ID phong ban</param>
        /// <param name="limit">so ban ghi trong 1 trang</param>
        /// <param name="offset">vi tri ban ghi bat dau lay du lieu</param>
        /// <returns>Danh sach nhan vien</returns>       
        [HttpGet]//Done
        [Route("filter")]
        public IActionResult FilterEmployees(
            [FromQuery] string? keyword,
            [FromQuery] Guid? positionID,
            [FromQuery] Guid? departmentID,
            [FromQuery] int pageSize =10,
            [FromQuery] int pageNumber = 1)
        {
            try
            {
                //string sqlconnectstring = "Server=127.0.0.1;Port=3306;Database=hust.21h.2022.ntlam;Uid=root;Pwd=123456789;";
                var mySqlConnection = new MySqlConnection(sqlconnectstring);

                string storedProcdureName = "Proc_employee_GetPaging";

                var parameter = new DynamicParameters();
                parameter.Add("@v_Offset", (pageNumber - 1) * pageSize);
                parameter.Add("@v_limit", pageSize);
                parameter.Add("@v_Soft", "ModifiedDate DESC");

                var lstConditionKey = new List<string>();
                var orConditions = new List<string>();
                var andConditions = new List<string>();
                string whereClause = "";

                if(keyword != null)
                {
                    lstConditionKey.Add($" EmployeeCode LIKE '%{keyword}%' ");
                    lstConditionKey.Add($" EmployeeName LIKE '%{keyword}%' ");
                    lstConditionKey.Add($" PhoneNumber LIKE '%{keyword}%' ");
                }
                if (lstConditionKey.Count > 0)
                {
                    andConditions.Add($"({string.Join("OR", lstConditionKey)})");
                }
                if(positionID != null)
                {
                    andConditions.Add($" PositionID = '{positionID}'");
                }
                if (departmentID != null)
                {
                    andConditions.Add($" DepartmentID = '{departmentID}'");
                }
                if (andConditions.Count > 0)
                {
                    whereClause += $" {string.Join(" AND ",andConditions)}";
                }
                parameter.Add("@v_Where", whereClause);

                //Thuc hien goij vaof DB de chay Proc voi tham so dau vao tren
                var multipleResults =mySqlConnection.QueryMultiple(storedProcdureName, parameter, commandType: System.Data.CommandType.StoredProcedure);

                //Xu ly ket qua tra ve DB
                if(multipleResults != null)
                {
                    var employees = multipleResults.Read<Employee>().ToList();
                    var totalCount = multipleResults.Read<long>().Single();
                    return StatusCode(StatusCodes.Status200OK, new PagingData()
                    {
                        Data = employees,
                        TotalCount = totalCount
                    });
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }
            }
            catch(Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");

            }
        }
        
        
        /// <summary>
        /// API them moi 1 nhan vien
        /// </summary>
        /// <param name="employee">Doi tuong can them mowi</param>
        /// <returns>ID nhan vien vua them moi</returns>
        [HttpPost]///done
        public IActionResult InsertEmployee([FromBody] Employee employee)
        {
            try
            {
                //KHơit tạo kết nối tới DB MýQSL
                //string sqlconnectstring = "Server=127.0.0.1;Port=3306;Database=hust.21h.2022.ntlam;Uid=root;Pwd=123456789;";
                var mySqlConnection = new MySqlConnection(sqlconnectstring);
                //CHuẩn bị câu lệnh ínert into
                string insertEmployee = "INSERT INTO employee (EmployeeId,EmployeeCode, EmployeeName, DateOfBirth, Gender, IdentityNumber, IdentityIssuedDate, IdentityIssuedPlace, Email, PhoneNumber, PositionID, PositionCode, PositionName, DepartmentID, DepartmentCode, DepartmentName, TaxCode, Salary, JoiningDate, WorkStatus, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy) " +
                    "VALUES(@EmployeeId,@EmployeeCode, @EmployeeName, @DateOfBirth, @Gender, @IdentityNumber, @IdentityIssuedDate, @IdentityIssuedPlace, @Email, @PhoneNumber, @PositionID, @PositionCode, @PositionName, @DepartmentID, @DepartmentCode, @DepartmentName, @TaxCode, @Salary, @JoiningDate, @WorkStatus, NOW(), @CreatedBy, NOW(), @ModifiedBy);";
                //Chaun bi tham so dau vao
                var employeeID = Guid.NewGuid();
                var parameters = new DynamicParameters();
                parameters.Add("@EmployeeId", employeeID);
                parameters.Add("@EmployeeCode", employee.EmployeeCode);
                parameters.Add("@EmployeeName", employee.EmployeeName);
                parameters.Add("@DateOfBirth",employee.DateOfBirth);
                parameters.Add("@Gender",employee.Gender);
                parameters.Add("@IdentityNumber",employee.IdentityNumber);
                parameters.Add("@IdentityIssuedDate",employee.IdentityIssuedDate);
                parameters.Add("@IdentityIssuedPlace",employee.IdentityIssuedPlace);
                parameters.Add("@Email",employee.Email);
                parameters.Add("@PhoneNumber",employee.PhoneNumber);
                parameters.Add("@PositionID",employee.PositionID);
                parameters.Add("@PositionCode", employee.PositionCode);
                parameters.Add("@PositionName",employee.PositionName);
                parameters.Add("@DepartmentID",employee.DepartmentID);
                parameters.Add("@DepartmentCode", employee.DepartmentCode);
                parameters.Add("@DepartmentName",employee.DepartmentName);
                parameters.Add("@TaxCode",employee.TaxCode);
                parameters.Add("@Salary",employee.Salary);
                parameters.Add("@JoiningDate",employee.JoiningDate);
                parameters.Add("@WorkStatus",employee.WorkStatus);
                parameters.Add("@CreatedBy",employee.CreatedBy);
                parameters.Add("@ModifiedBy",employee.ModifiedBy);
                //Thuc hien goi vao DB vaf thuc hien insert into voi cau lenh dau vao
                int numberOfAffectedRow =  mySqlConnection.Execute(insertEmployee, parameters);
                if (numberOfAffectedRow > 0)
                {
                    return StatusCode(StatusCodes.Status201Created, employeeID);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }

            }
            catch(MySqlException mySqlException)
            {
                if(mySqlException.ErrorCode == MySqlErrorCode.DuplicateKeyEntry)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e003");
                }
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
            catch(Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }
        
        
        /// <summary>
        /// API sua nhan vien
        /// </summary>
        /// <param name="employee"Doi tuong can sua></param>
        /// <returns>ID nhan vien can sua</returns>
        [HttpPut]//done
        public IActionResult UpdateEmployee([FromBody] Employee employee)
        {
            try
            {
                //KHơit tạo kết nối tới DB MýQSL
                //string sqlconnectstring = "Server=127.0.0.1;Port=3306;Database=hust.21h.2022.ntlam;Uid=root;Pwd=123456789;";
                var mySqlConnection = new MySqlConnection(sqlconnectstring);
                //CHuẩn bị câu lệnh ínert into
                string updateEmployee = "UPDATE employee " +
                    "SET EmployeeCode= @EmployeeCode,EmployeeName= @EmployeeName,DateOfBirth= @DateOfBirth,Gender= @Gender,IdentityNumber= @IdentityNumber,IdentityIssuedDate= @IdentityIssuedDate,IdentityIssuedPlace= @IdentityIssuedPlace,Email= @Email,PhoneNumber= @PhoneNumber,PositionID= @PositionID,PositionCode= @PositionCode,PositionName= @PositionName,DepartmentID= @DepartmentID,DepartmentCode=@DepartmentCode,DepartmentName= @DepartmentName,TaxCode= @TaxCode,Salary= @Salary,JoiningDate= @JoiningDate,WorkStatus= @WorkStatus,ModifiedBy= NOW(),ModifiedBy= @ModifiedBy " +
                    "WHERE EmployeeId = @EmployeeId";
                //Chaun bi tham so dau vao
                var parameters = new DynamicParameters();
                parameters.Add("@EmployeeId", employee.EmployeeID);
                parameters.Add("@EmployeeCode", employee.EmployeeCode);
                parameters.Add("@EmployeeName", employee.EmployeeName);
                parameters.Add("@DateOfBirth", employee.DateOfBirth);
                parameters.Add("@Gender", employee.Gender);
                parameters.Add("@IdentityNumber", employee.IdentityNumber);
                parameters.Add("@IdentityIssuedDate", employee.IdentityIssuedDate);
                parameters.Add("@IdentityIssuedPlace", employee.IdentityIssuedPlace);
                parameters.Add("@Email", employee.Email);
                parameters.Add("@PhoneNumber", employee.PhoneNumber);
                parameters.Add("@PositionID", employee.PositionID);
                parameters.Add("@PositionCode", employee.PositionCode);
                parameters.Add("@PositionName", employee.PositionName);
                parameters.Add("@DepartmentID", employee.DepartmentID);
                parameters.Add("@DepartmentCode", employee.DepartmentCode);
                parameters.Add("@DepartmentName", employee.DepartmentName);
                parameters.Add("@TaxCode", employee.TaxCode);
                parameters.Add("@Salary", employee.Salary);
                parameters.Add("@JoiningDate", employee.JoiningDate);
                parameters.Add("@WorkStatus", employee.WorkStatus);
                parameters.Add("@ModifiedDate", employee.ModifiedDate);
                parameters.Add("@ModifiedBy", employee.ModifiedBy);
                //Thuc hien goi vao DB vaf thuc hien insert into voi cau lenh dau vao
                int numberOfAffectedRow = mySqlConnection.Execute(updateEmployee, parameters);
                if (numberOfAffectedRow > 0)
                {
                    return StatusCode(StatusCodes.Status201Created, employee.EmployeeID);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }

            }
            catch (MySqlException mySqlException)
            {
                if (mySqlException.ErrorCode == MySqlErrorCode.DuplicateKeyEntry)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e003");
                }
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }
        
        
        
        /// <summary>
        /// API xoa nhan vien
        /// </summary>
        /// <param name="employeeID"></param>
        /// <returns></returns>
        [HttpDelete]///done
        [Route("{employeeID}")]
        public IActionResult DeleteEmployee(Guid employeeID)
        {
            try
            {
                //string sqlconnectstring = "Server=127.0.0.1;Port=3306;Database=hust.21h.2022.ntlam;Uid=root;Pwd=123456789;";
                var mySqlConnection = new MySqlConnection(sqlconnectstring);

                string deleteEmployeeCommand = "DELETE FROM employee WHERE EmployeeId = @EmployeeID";

                var parameters = new DynamicParameters();
                parameters.Add("@EmployeeID", employeeID);

                int numberOfAffectedRows = mySqlConnection.Execute(deleteEmployeeCommand, parameters);

                if(numberOfAffectedRows > 0)
                {
                    return StatusCode(StatusCodes.Status200OK, employeeID);
                }
                else
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "e002");
                }

            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }
        }

        /// <summary>
        /// API lay max employeeCode
        /// </summary>
        /// <param name="employeeCode"></param>
        /// <returns></returns>
        [HttpGet]///done
        [Route("new-code")]
        public IActionResult getMaxEmployeeCode()
        {
            try
            {
                //string sqlconnectstring = "Server=127.0.0.1;Port=3306;Database=hust.21h.2022.ntlam;Uid=root;Pwd=123456789;";
                var mySqlConnection = new MySqlConnection(sqlconnectstring);

                string storedProcedureName = "Proc_employee_GetMaxCode";

                string maxEmployeeCode = mySqlConnection.QueryFirstOrDefault<string>(storedProcedureName, commandType:System.Data.CommandType.StoredProcedure);

                string newEmployeeCode = "NV" + (Int64.Parse(maxEmployeeCode.Substring(2)) + 1).ToString();
                return StatusCode(StatusCodes.Status200OK, newEmployeeCode);

            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
                return StatusCode(StatusCodes.Status400BadRequest, "e001");
            }

        }
    }
}
