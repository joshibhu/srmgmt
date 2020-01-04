//To print records while onLoad of viewAllRecord.html
function printTableRecords() {
    $.ajax({
        type: 'GET',
        url: '/api/servicerecords/viewAll',
        complete: function (r) {
            var JsonRes = JSON.parse(r.responseText);

            for (var i = 0; i < JsonRes.length; i++) {
                var table = document.getElementById("employees");
                var row = table.insertRow();
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = JsonRes[i].employeeId;
                cell2.innerHTML = JsonRes[i].employeeName;
                cell3.innerHTML= "<button onclick="+"downloadFileFunction("+"'"+JsonRes[i].employeeId+"'"+") id="+"download_"+JsonRes[i].employeeId+ " class="+"tblbtn"+">Download</button> <button onclick="+"getRecordHistory("+"'"+JsonRes[i].employeeId+"'"+","+"'"+JsonRes[i].employeeName+"'"+") class="+"tblbtn"+">History</button>";
                
            }

        }
    });
}

//Redirect to serviceRecordHistory.html 
function getRecordHistory(empId,empName){
    window.location.href="/serviceRecordHistory.html?empId=" + empId+"?empName="+empName;
   
}


//Download/View File

function downloadFileFunction(empId){

    $.ajax({
        type: 'GET',
        url: '/api/servicerecords/download/' + empId,
        data: {
          'empId': empId
        },
        complete: function (r) {
             console.log(r.responseText);
             var path=r.responseText.split(":");
             window.open("http://127.0.0.1:8080"+path[1]);
        }
    });
}

/*search on the basis of EmployeeName and EmployeeId */
function searchFunction() {
    var input, filter, table, i, empIdValue,empNameValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("employees");
    tr = table.getElementsByTagName("tr");
  
    for (i = 1; i < tr.length; i++) {
        empIdValue = tr[i].cells[0].innerText;
        empNameValue = tr[i].cells[1].innerText;
        if (empIdValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
        }
        else if (empNameValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }
    }
}


window.onload = printTableRecords();