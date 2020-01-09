
document.getElementById('file').onchange = uploadOnChange;

//To get the name of file uploaded
function uploadOnChange() {

  var filename = this.value;
  var lastIndex = filename.lastIndexOf("\\");
  if (lastIndex >= 0) {
    filename = filename.substring(lastIndex + 1);
  }
  document.getElementById('filename').value = filename;
}

//Auto populate Employee Name on Emp Id Submit
function getEmpData() {
  var empId = document.getElementById('empIdInput').value;
  document.getElementById("empIdInput").readOnly = true;
  console.log(empId);
  $.ajax({
    type: 'GET',
    url: '/api/employees/' + empId,
    data: {
      'empId': empId
    },
    complete: function (r) {
      var JsonRes = JSON.parse(r.responseText);
      document.getElementById('empName').value = JsonRes.employeeName;
      document.getElementById("empName").readOnly = true;
      for (var i = 0; i < JsonRes.recordTypes.length; i++) {

        var sel = document.getElementById('record_type');

        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(JsonRes.recordTypes[i]));
        opt.value = JsonRes.recordTypes[i];
        sel.appendChild(opt);
      }
      element_form = document.querySelector('.update-form'); 
      element_form.style.visibility = 'visible'; 
      element = document.querySelector('.submit_empIdBtn'); 
      element.style.visibility = 'hidden'; 
      element.parentNode.removeChild(element)
      console.log(JsonRes.recordTypes);
    }
  });
}


