
function deleteFile(fileId) {
    //disableScreen();
    if (confirm('Are you sure ?')) {
        $.ajax({
            url: '/tracker/api/files/' + fileId,
            method: 'DELETE',
        })
            .done(function (data) {
                if (!data.message) {
                    $('#message').html('File Deleted Successfully !!!');
                } else {
                    $('#message').html('Error while file deletion !!!');
                }
                location.reload();
            });;
    }
}

function updateRecord(fileId) {

}


function changeStatus(fileId, action) {
    // disableScreen();
    $.ajax({
        url: '/tracker/api/files/' + fileId + '/action/' + action,
        method: 'PUT',
    })
        .done(function (data) {
            if (!data.message) {
                $('#message').html('Successfully changed !!!');
            } else {
                $('#message').html('Error while changing status !!!');
            }
        });;
}
