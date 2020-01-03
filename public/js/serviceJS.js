
document.getElementById('file').onchange = uploadOnChange;

function uploadOnChange() {

  var filename = this.value;
  var lastIndex = filename.lastIndexOf("\\");
  if (lastIndex >= 0) {
    filename = filename.substring(lastIndex + 1);
  }
  document.getElementById('filename').value = filename;
}

function getEmpData() {
  var empId = document.getElementById('empIdInput').value;
  console.log(empId);
  $.ajax({
    type: 'GET',
    url: '/api/employees/' + empId,
    data: {
      'empId': empId
    },
    complete: function (r) {
      var JsonRes = JSON.parse(r.responseText);
      document.getElementById('empName').innerHTML = JsonRes.employeeName;
      for (var i = 0; i < JsonRes.recordTypes.length; i++) {

        var sel = document.getElementById('record_type');

        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(JsonRes.recordTypes[i]));
        opt.value = JsonRes.recordTypes[i];
        sel.appendChild(opt);
      }

      console.log(JsonRes.recordTypes);
    }
  });
}



