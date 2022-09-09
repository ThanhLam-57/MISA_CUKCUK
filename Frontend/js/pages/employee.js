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

function loadData(){
    //Gọi Api lấy dữ liệu
    $.ajax({
        type: "GET",
        async: false,
        url: "http://localhost:26967/api/Employees",
        success: function(res) {
            $("table#tbEmployeeList tbody").empty();
            // Xử lý dữ liệu từng đối tượng:
            var sort = 1;
            let ths = $("table#tbEmployeeList thead th");
            for (const emp of res) {
                // duyệt từng cột trong tiêu đề:
                var trElement = $('<tr></tr>');
                for (const th of ths) {
                    // Lấy ra propValue tương ứng với các cột:
                    const propValue = $(th).attr("propValue");

                    const format = $(th).attr("format");
                    // Lấy giá trị tương ứng với tên của propValue trong đối tượng:
                    let value = null;
                    if (propValue == "Sort")
                        value = sort
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

    //Xử lý dữ liệu
}
function initEvents() {
        // Thực hiện xoá
        $("#btnDelete").click(function() {
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
                if (propValue) {
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
        // $('textarea').val(null);
        // Lấy mã nhân viên mới:
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





    //Thực hiện copy
    // $("#btnDuplicate").click(function(){
    //     // Hiển thị form:
    //     $("#dlgEmployeeDetail").show();
    
    //     // Focus vào ô input đầu tiên:
    //     $("#dlgEmployeeDetail input")[0].focus();
    //     $.ajax({
    //     });
    // });
    $(document).on('click',"#btnDuplicate", function() {
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
            if (propValue) {
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
    console.log(employee);
    // Gọi api thực hiện cất dữ liệu:
    if (formMode == "edit") {
        $.ajax({
            type: "PUT",
            url: "http://localhost:26967/api/Employees" + EmployeeID,
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
            type: "POST",
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

            }
        });
    }


}
