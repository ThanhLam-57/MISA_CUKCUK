$(document).ready(function() {
    // gán các sự kiện cho các element:
    initEvents();

    // Load dữ liệu:
    loadData();
})

var EmployeeID = null;
var formMode = "add";

const EnumGender = {
    Male: "Nam",
    Female: "Nữ",
    Other: "Khác"
}

const EnumWorkStatus ={
    Work: "Đang làm",
    Workered: "Nghỉ việc",
    OtherWork: "Khác"
}

var lstPosition = [];
var lstDepartment = [];
var keySearch = "";
var filterDepartment = -1;
var filterPosition = -1;
var pageSize = 15;
var pageIndex = 1;

function loadData(){
    //Build câu filter
    let filter = "";
    if(keySearch.length > 0){
        filter += "keyword=" + keySearch + "&&";
    }
    if(filterPosition != -1){
        filter += "positionID=" + filterPosition + "&&";
    }
    if(filterDepartment != -1){
        filter += "departmentID=" + filterDepartment + "&&";
    }
    if(filter.length > 0 && filterPosition != -1 && filterDepartment != -1){
        filter += "&&"
    }
    filter+= "pageSize=" + pageSize + "&&pageIndex" + pageIndex;
    //Gọi Api lấy dữ liệu
    $.ajax({
        type: "GET",
        async: false,
        url: "http://localhost:26967/api/Employees/filter?" + filter,
        success: function(res) {
            $("table#tbEmployeeList tbody").empty();
            // Xử lý dữ liệu từng đối tượng:
            var sort = 1;
            let ths = $("table#tbEmployeeList thead th");
            for (const emp of res.Data) {
                var trElement = $('<tr></tr>');
               
                // duyệt từng cột trong tiêu đề:

                for (const th of ths) {
                    // Lấy ra propValue tương ứng với các cột:
                    const propValue = $(th).attr("propValue");

                    const format = $(th).attr("format");
                    // Lấy giá trị tương ứng với tên của propValue trong đối tượng:
                    let value = null;
                    if (propValue == "Sort"){
                        value = sort}
                    else if(propValue == "Gender"){
                        if(emp["Gender"] == 0){
                            value = EnumGender.Male;
                        }
                        else if(emp["Gender"] == 1){
                            value = EnumGender.Female;
                        }
                        else{
                            value = EnumGender.Other;
                        }
                    }
                    else if(propValue == "WorkStatus"){
                        if(emp["WorkStatus"] == 0){
                            value = EnumWorkStatus.Work;
                        }
                        else if(emp["GenWorkStatusder"] == 1){
                            value = EnumWorkStatus.Workered;
                        }
                        else{
                            value = EnumWorkStatus.OtherWork;
                        }
                    }
                    else
                        value = emp[propValue];
                    let classAlign = "";
                    switch (format) {
                        case "date":
                            value = formatDate(value);
                            // classAlign = "text-align--center";
                            break;
                        case "money":
                            value = Math.round(Math.random(100) * 1000000);
                            value = formatMoney(value);
                            // classAlign = "text-align--right";
                            break;
                        default:
                            break;
                    }
                    // Tạo thHTML:
                    let thHTML = `<td class='${classAlign}'>${value||""}</td>`;
                    // Đẩy vào trHTML:
                     trElement.append(thHTML);

                }
                sort++;
                $(trElement).data("id", emp.EmployeeID);
                $(trElement).data("entity", emp);
                $("table#tbEmployeeList tbody").append(trElement)
            }
        },
        error: function(res) {
            console.log(res);
        }
    });

    if(lstPosition.length == 0){
        //Lấy ra danh sách vị trí công việc
        $.ajax({
            url: "http://localhost:26967/api/Positions/get-all",
            method: "GET",
            success: function(positions) {
                //Set vào biến global
                lstPosition = positions;
                //Reset dữ liệu
                $('#combobox-position').empty();
                $('#filter-position').empty();
                $('#filter-position').append('<option value="-1">Tất cả vị trí</option>');
                //Mapping dữ liệu mới
                for(const position of positions) {
                    let html = '<option value="' + position['PositionCode'] + '">' + position['PositionName'] + '</option>';
                    $('#combobox-position').append(html);
                    $('#filter-position').append(html);
                }
            }
        });
    }
    if(lstDepartment.length == 0){
        //lấy ra danh sách phòng ban
        $.ajax({
            url: "http://localhost:26967/api/Departments/get-all",
            method: "GET",
            success: function(departments) {
                //Set vào biến global
                lstDepartment = departments;
                //Reset dữ liệu
                $('#combobox-department').empty();
                $('#filter-department').empty();
                $('#filter-department').append('<option value="-1">Tất cả phòng ban</option>');
                //Mapping dữ liệu mới
                for(const department of departments) {
                    let html = '<option value="' + department['DepartmentCode'] + '">' + department['DepartmentName'] + '</option>';
                    $('#combobox-department').append(html);
                    $('#filter-department').append(html);
                }
            }
        });
    }

    //Xử lý dữ liệu
}
function initEvents() {
    //Thêm sự kiện tìm kiếm
    $("#filter-keysearch").keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            var input =  $("#filter-keysearch");
            keySearch = input[0].value;
            loadData();
        }
      });

    //Bắt sự kiện chọn bộ lọc vị trí
    $("#filter-position").change(function(){
        var options = $(this).find("option:selected");
        var positionCode = options[0].value;
        if(positionCode != -1){
            var position = lstPosition.find(x => x.PositionCode == positionCode);
            filterPosition = position.PositionID;
        }
        loadData();
    });
    //Bắt sự kiện chọn bộ lọc phòng ban
    $("#filter-department").change(function(){
        var options = $(this).find("option:selected");
        var departmentCode = options[0].value;
        if(departmentCode != -1){
            var department = lstDepartment.find(x => x.DepartmentCode == departmentCode);
            filterDepartment = department.DepartmentID;
        }
        loadData();
    });
    //Bắt sự kiện chọn bộ lọc phòng ban
    $("#filter--page").change(function(){
        var options = $(this).find("option:selected");
        pageSize = options[0].value;
        loadData();
    });

    

        // Thực hiện xoá
        $("#btnDelete").click(function() {
            if(!EmployeeID){
                alert("Chưa chọn dòng để thực hiện xóa");
                return;
            }
            // 
            $("#dlgDialog3").show();
        });   
        $("#btnOk").click(function() {
            if(EmployeeID != null){
                $.ajax({
                    type: "DELETE",
                    url: "http://localhost:26967/api/Employees/" + EmployeeID,
                    success: function(response) {
                        $("#dlgDialog3").hide();
                        // Load lại dữ liệu:
                        loadData();
                    }
                });
                
            }
            else{
            // Gọi api thực hiện xóa:
            alert("Chua chọn nhân viên muốn xoá");
            $("#dlgDialog3").hide();
        }
        });
    //Lưu dữ liệu
    $("#btnSave").click(saveData);
        //Nhấn đúp chuột vào dòng tr để hiển thị thông tin chi tiết
        $(document).on('dblclick', 'table#tbEmployeeList tbody tr', function() {
            formMode = "edit";
            // Hiển thị form:
            $("#dlgEmployeeDetail").show();
    
            // Focus vào ô input đầu tiên:
            $("#dlgEmployeeDetail input")[0].focus();
    
            // Binding dữ liệu tương ứng với bản ghi vừa chọn:
            let data = $(this).data('entity');
            EmployeeID = $(this).data('id');
    
            // Duyệt tất cả các input:
            let inputs = $("#dlgEmployeeDetail input, #dlgEmployeeDetail select");
    
            for (const input of inputs) {
                // Đọc thông tin propValue:
                const propValue = $(input).attr("propValue");
                if(propValue == 'DateOfBirth'){
                    //Map lại dữ liệu ngày sinh
                    input.value = formatDateValue(data['DateOfBirth']);
                }
                else if(propValue == 'IdentityIssuedDate'){
                    //Map lại dữ liệu ngày cấp
                    input.value = formatDateValue(data['IdentityIssuedDate']);
                }
                else if(propValue == 'JoiningDate'){
                    //Map lại dữ liệu ngày gia nhập cty
                    input.value = formatDateValue(data['JoiningDate']);
                }
                else if (propValue) {
                    let value = data[propValue];
                    input.value = value;
                }
            }
        });


        $(document).on('click', 'table#tbEmployeeList tbody tr', function() {
            // Xóa tất cả các trạng thái được chọn của các dòng dữ liệu khác:
            $(this).siblings().removeClass('row--selected');
            // In đậm dòng được chọn:
            this.classList.add("row--selected");
            EmployeeID = $(this).data('id');
        });
    



    // Gán sự kiện click cho button thêm mới nhân viên:
    var btnAdd = document.getElementById("btnAdd");

    btnAdd.addEventListener("click", function() {
        formMode = "add";
        // Hiển thị form nhập thông tin chi tin chi tiết:
        document.getElementById("dlgEmployeeDetail").style.display = "block";
        $('input').val(null);
        $.ajax({
            url: "http://localhost:26967/api/Employees/new-code",
            method: "GET",
            success: function(newEmployeeCode) {
                $("#txtEmployeeCode").val(newEmployeeCode);
                $("#txtEmployeeCode").focus();
            }
        });
    })    
    // Gán sự kiện click có button thêm mới nhân viên
    $("#btnAdd").click(function() {
        // Hiển thị form
        $("#dlgEmployeeDetail").show();

        // Focus vào ô nhập liệu đầu tiên:
        $('#dlgEmployeeDetail input')[0].focus();
    })
    $(".dialog__button").click(function() {
        // Ẩn dialog tương ứng với button close hiện tại:
        $(this).parents(".dialog").hide();
    })
    $("#btnCancel").click(function() {
        // Ẩn dialog tương ứng với button close hiện tại:
        $(this).parents(".dialog").hide();
    })
    $("#btnCancel2").click(function() {
        // Ẩn dialog tương ứng với button close hiện tại:
        $(this).parents(".dialog").hide();
    })


    $(document).on('click',"#btnDuplicate", function() {
        formMode = "edit";
        if(!EmployeeID){
            alert("Chưa chọn dòng để thực hiện nhân bản");
            return;
        }
        // Hiển thị form:
        $("#dlgEmployeeDetail").show();

        // Focus vào ô input đầu tiên:
        $("#dlgEmployeeDetail input")[0].focus();
    
        // Binding dữ liệu tương ứng với bản ghi vừa chọn:
        let data = $(this).data('entity');
        EmployeeID = $(this).data('id');

        // Duyệt tất cả các input:
        let inputs = $("#dlgEmployeeDetail input, #dlgEmployeeDetail select");

        for (const input of inputs) {
            // Đọc thông tin propValue:
            const propValue = $(input).attr("propValue");
            if(propValue == 'DateOfBirth'){
                //Map lại dữ liệu ngày sinh
                input.value = formatDateValue(data['DateOfBirth']);
            }
            else if(propValue == 'IdentityIssuedDate'){
                //Map lại dữ liệu ngày cấp
                input.value = formatDateValue(data['IdentityIssuedDate']);
            }
            else if(propValue == 'JoiningDate'){
                //Map lại dữ liệu ngày gia nhập cty
                input.value = formatDateValue(data['JoiningDate']);
            }
            else if(propValue == 'EmployeeCode'){
                $.ajax({
                    url: "http://localhost:26967/api/Employees/new-code",
                    method: "GET",
                    success: function(newEmployeeCode) {
                        $("#txtEmployeeCode").val(newEmployeeCode);
                        $("#txtEmployeeCode").focus();
                    }
                });
            }
            else if (propValue) {
                let value = data[propValue];
                input.value = value;
            }
        }
    });


    //Nhấn btn Refresh để load lại danh sách
    $("#btnRefresh").click(function(){
        loadData();
    });

    // Thực hiện validate dữ liệu khi nhập liệu vào các ô input bắt buộc nhập:

    $('input[input--error]').blur(function() {
        // Lấy ra value:
        var value = this.value;
        // Kiểm tra value:
        if (!value) {
            // ĐẶt trạng thái tương ứng:
            // Nếu value rỗng hoặc null thì hiển thị trạng thái lỗi:
            $(this).addClass("input--error");
            $(this).attr('title', "Thông tin này không được phép để trống");
        } else {
            // Nếu có value thì bỏ cảnh báo lỗi:
            $(this).removeClass("input--error");
            $(this).removeAttr('title');
        }
    })

    $('input[type=email]').blur(function() {
        // Kiểm tra email:
        var email = this.value;
        var isEmail = checkEmailFormat(email);
        if (!isEmail) {
            console.log("Email KHÔNG đúng định dạng");
            $(this).addClass("input--error");
            $(this).attr('title', "Email không đúng định dạng.");
        } else {
            console.log("Email đúng định dạng");
            $(this).removeClass("input--error");
            $(this).removeAttr('title', "Email không đúng định dạng.");
        }
    })
}
var count = 0;
function checkEmailFormat(email) {
    count++;
    console.log(count);
    const emailCheck =
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return email.match(emailCheck);
}
function formatDate(date) {
    try {
        if (date) {
            date = new Date(date);

            // Lấy ra ngày:
            dateValue = date.getDate();
            dateValue = dateValue < 10 ? `0${dateValue}` : dateValue;

            // lấy ra tháng:
            let month = date.getMonth() + 1;
            month = month < 10 ? `0${month}` : month;

            // lấy ra năm:
            let year = date.getFullYear();

            return `${dateValue}/${month}/${year}`;
        } else {
            return "";
        }
    } catch (error) {
        console.log(error);
    }
}

function formatDateValue(date) {
    try {
        if (date) {
            date = new Date(date);

            // Lấy ra ngày:
            dateValue = date.getDate();
            dateValue = dateValue < 10 ? `0${dateValue}` : dateValue;

            // lấy ra tháng:
            let month = date.getMonth() + 1;
            month = month < 10 ? `0${month}` : month;

            // lấy ra năm:
            let year = date.getFullYear();

            return `${year}-${month}-${dateValue}`;
        } else {
            return "";
        }
    } catch (error) {
        console.log(error);
    }
}

function formatMoney(money) {
    try {
        money = new Intl.NumberFormat('vn-VI', { style: 'currency', currency: 'VND' }).format(money);
        return money;
    } catch (error) {
        console.log(error);
    }
}
function saveData() {
    // Thu thập dữ liệu:
    let inputs = $("#dlgEmployeeDetail input, #dlgEmployeeDetail select");
    var employee = {};
    console.log(employee);
    // build object:
    for (const input of inputs) {
        // Đọc thông tin propValue:
        const propValue = $(input).attr("propValue");
        // Lấy ra value:
        if (propValue) {
            let value = input.value;
            employee[propValue] = value;
        }
    }
    //Map dữ liệu vị trí công việc
    if(employee['PositionCode']){
        var position = lstPosition.find(x => x.PositionCode = employee.PositionCode);
        employee.PositionID = position.PositionID;
        employee.PositionName = position.PositionName;
    }
    //Map dữ liệu phòng ban
    if(employee['DepartmentCode']){
        var department = lstDepartment.find(x => x.DepartmentCode = employee.DepartmentCode);
        employee.DepartmentID = department.DepartmentID;
        employee.DepartmentName = department.DepartmentName;
    }
    console.log(employee);
    // Gọi api thực hiện cất dữ liệu:
    if (formMode == "edit") {
        //Kiểm tra nếu là sửa nhân viên thì gán lại EmployeeID
        employee.EmployeeID = EmployeeID;
        $.ajax({
            method: "PUT",
            url: "http://localhost:26967/api/Employees",
            data: JSON.stringify(employee),
            dataType: "json",
            contentType: "application/json",
            success: function(response) {
                alert("Sửa dữ liệu thành công!");
                // load lại dữ liệu:
                loadData();
                // Ẩn form chi tiết:
                $("#dlgEmployeeDetail").hide();

            }
        });
    } else {
        $.ajax({
            method: "POST",
            url: "http://localhost:26967/api/Employees",
            data: JSON.stringify(employee),
            dataType: "json",
            contentType: "application/json",
            success: function(response) {
                alert("Thêm mới dữ liệu thành công!");
                // load lại dữ liệu:
                loadData();
                // Ẩn form chi tiết:
                $("#dlgEmployeeDetail").hide();
            },
            error: function(response){
                alert("Chưa nhập đủ thông tin");
            }
        });
    }


}
