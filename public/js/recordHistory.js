//print Employee record on the basis of employee Id
function printEmployeeRecords() {
    console.log(window.location.href);
    var fields=window.location.href.split('?');
    var empId=fields[1].split('=')[1];
    var empName=fields[2].split('=')[1];
    $.ajax({
        type: 'GET',
        url: '/api/servicerecords/history/'+empId,
        complete: function (r) {
            var JsonRes = JSON.parse(r.responseText);
            console.log(JsonRes);
            if (JsonRes.length>0)
            {
                document.getElementById('empId').innerHTML=JsonRes[0].employeeId;
                document.getElementById('empName').innerHTML=JsonRes[0].employeeName;
                for (var i = 0; i < JsonRes.length; i++) {
                    var table = document.getElementById("employees");
                    var row = table.insertRow();
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);
                    cell1.innerHTML = JsonRes[i].createTimestamp;
                    cell2.innerHTML = JsonRes[i].tokenNumber;
                    cell3.innerHTML= JsonRes[i].recordType;
                    cell4.innerHTML= JsonRes[i].comment;
                  
                }
            }
            else{
                document.getElementById('empId').innerHTML=empId;
                document.getElementById('empName').innerHTML=empName;
        
                    var table = document.getElementById("employees");
                    var row = table.insertRow();
                    var cell1 = row.insertCell(0);
                   
                    cell1.innerHTML ="<b>No records Present</b>";
                  
               
            }
            

        }
    });
}


window.onload = printEmployeeRecords();