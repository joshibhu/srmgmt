//To print records while onLoad of viewAllRecord.html
function printTableRecords() {
    $.ajax({
        type: 'GET',
        url: '/api/servicerecords/viewAll',
        complete: function (r) {
            var JsonRes = JSON.parse(r.responseText);
            for (var i = 0; i < JsonRes.length; i++) {
                var table = document.getElementById("employeesTbody");
                var row = table.insertRow();
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = JsonRes[i].employeeId;
                cell2.innerHTML = JsonRes[i].employeeName;
                cell3.innerHTML = "<button onclick=downloadFile(" + "'" + JsonRes[i].employeeId + "'" + ")  id=download" + JsonRes[i].employeeId + " class=submitbtn>Download</button>" 
               +"&nbsp;&nbsp;" + "<button onclick=" + "getRecordHistory(" + "'" + JsonRes[i].employeeId + "'" + "," + "'" +encodeURIComponent(JsonRes[i].employeeName) + "'" + ") class=" + "submitbtn" + ">History</button>";
            }
            pagination();

        }
    });
}

//Redirect to serviceRecordHistory.html 
function getRecordHistory(empId,empName) {
    window.location.href = "/serviceRecordHistory?empId=" + empId + "?empName=" +empName;
}

function downloadFile(empId) {
    disableScreen();
    $.ajax({
        url: '/api/servicerecords/download/'+empId,
        method: 'GET',
        xhrFields: {
            responseType: 'blob'
        },
        success: function (data) {
            console.log(data);
            var a = document.createElement('a');
            var url = window.URL.createObjectURL(data);
            a.href = url;
            a.download = empId+'_SR.pdf';
            document.body.append(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            element = document.querySelector('.disable_overlay'); 
            element.style.visibility = 'hidden'; 
            element.parentNode.removeChild(element)
        }
    });
}


//Download/View File

function downloadFileFunction(empId) {

    $.ajax({
        type: 'GET',
        url: '/api/servicerecords/download/' + empId,
        complete: function (r) {
            console.log(r.responseText);
           // var path = r.responseText.split(":");
            window.open(r);
        }
    });
}

/*search on the basis of EmployeeName and EmployeeId */
function searchFunction() {
    document.getElementById("pagination").style.display = "none";
    var input, filter, table, i, empIdValue, empNameValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("employees");
    tr = table.getElementsByTagName("tr");

    for (i = 1; i < tr.length; i++) {
        empIdValue = tr[i].cells[0].innerText;
        empNameValue = tr[i].cells[1].innerText;
        if (empIdValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
        } else if (empNameValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }
    }
    if(filter.length==0)
    {
        var req_num_row = 5;
        var $tr = jQuery('tbody tr');
        var total_num_row = $tr.length;
        var num_pages = 0;
        if (total_num_row % req_num_row == 0) {
            num_pages = total_num_row / req_num_row;
        }
        if (total_num_row % req_num_row >= 1) {
            num_pages = total_num_row / req_num_row;
            num_pages++;
            num_pages = Math.floor(num_pages++);
        }
        $tr.each(function (i) {
            jQuery(this).hide();
            if (i + 1 <= req_num_row) {
                $tr.eq(i).show();
            }
    
        });
        document.getElementById("pagination").style.display = "";
    } 
    else
        document.getElementById("pagination").style.display = "none";


}

//------------pagination funtion-------------------------------------------------------//

function pagination() {
    var req_num_row = 5;
    var $tr = jQuery('tbody tr');
    var total_num_row = $tr.length;
    var num_pages = 0;
    if (total_num_row % req_num_row == 0) {
        num_pages = total_num_row / req_num_row;
    }
    if (total_num_row % req_num_row >= 1) {
        num_pages = total_num_row / req_num_row;
        num_pages++;
        num_pages = Math.floor(num_pages++);
    }
    for (var i = 1; i <= num_pages; i++) {
        if (i == 1)
            jQuery('#pagination').append("<a class=" + "active" + ">" + i + "</a>");
        else
            jQuery('#pagination').append("<a>" + i + "</a>");

    }
    $tr.each(function (i) {
        jQuery(this).hide();
        if (i + 1 <= req_num_row) {
            $tr.eq(i).show();
        }

    });
    jQuery('#pagination a').click(function (e) {
        e.preventDefault();
        $tr.hide();
        var page = jQuery(this).text();
        var temp = page - 1;
        var start = temp * req_num_row;

        for (var i = 0; i < req_num_row; i++) {

            $tr.eq(start + i).show();
            var current = document.getElementsByClassName("active");
            $(current).removeClass("active");
            $(this).addClass("active");
        }
    });
}
//-------------------------------pagination funtion end-----------------------------------------//


window.onload = printTableRecords();