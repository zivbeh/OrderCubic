window.onload = async function () {
    await $.ajax({
        url: '/errors',
        timeout: 2000,
        success: function(data){
            if (data && data != '') {
                alert(data)
            }
        }
    });
}