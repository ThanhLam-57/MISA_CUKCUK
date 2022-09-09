namespace misa.hust.ntlam.api.Entities.DTO
{
    /// <summary>
    /// Api tra ve danh sc
    /// </summary>
    public class PagingData
    {
        /// <summary>
        /// Danh sach nhan vien
        /// </summary>
        public List<Employee> Data { get; set; }
        /// <summary>
        /// Tong so ban ghi thoa man dieu kien
        /// </summary>
        public long TotalCount { get; set; }
    }
}
