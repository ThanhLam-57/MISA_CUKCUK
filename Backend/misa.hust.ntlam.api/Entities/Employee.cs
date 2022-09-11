namespace misa.hust.ntlam.api.Entities
{
    /// <summary>
    /// Thông tin nhâ viên
    /// </summary>
    public class Employee
    {
        public Guid? EmployeeID { get; set; }
        public string? EmployeeCode { get; set; }
        public string? EmployeeName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int Gender { get; set; }
        public string? IdentityNumber { get; set; }
        public DateTime? IdentityIssuedDate { get; set; }
        public string? IdentityIssuedPlace { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public Guid? PositionID { get; set; }
        public string? PositionCode { get; set; }
        public string? PositionName { get; set; }
        public Guid? DepartmentID { get; set; }
        public string? DepartmentCode { get; set; }
        public string? DepartmentName { get; set; }
        public string? TaxCode { get; set; }
        public double? Salary { get; set; }
        public DateTime? JoiningDate { get; set; }
        public int WorkStatus { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string? ModifiedBy { get; set; }
    }
}
