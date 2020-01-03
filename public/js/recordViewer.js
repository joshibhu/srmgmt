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
                cell3.innerHTML= "<button class="+"tblbtn"+">View</button>"+"<button class="+"tblbtn"+">Download</button> <button class="+"tblbtn"+">History</button>";
                var button=document.createElement('button');
                button.innerHTML = "Do Something";
            }

            console.log(JsonRes);
        }
    });
}


window.onload = printTableRecords();