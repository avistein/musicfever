var q, pageCounter = 1,
    totalPages;

//enabling enter to search
function handle(e) {
    if (e.keyCode === 13) {
        search();
    }
}

$(document).ready(function() {
    onResize();
    //responsive main logo
    function checkPosition() {
        if (window.matchMedia('(max-width: 480px)').matches)
            $('#mainLogo').attr('src', 'images/musicfeverxs.png');
        else if (window.matchMedia('(max-width: 767px)').matches)
            $('#mainLogo').attr('src', 'images/musicfeverm.png');
        else
            $('#mainLogo').attr('src', 'images/musicfeverl.png');
    }
    checkPosition();
    //collapsble button defocusing fix
    $(window).resize(checkPosition);
    $(".navbar-toggle").blur(function() {
        $("#collapsble-nav").collapse("hide");
    });

});
// apply dynamic padding at the top of the body according to the fixed navbar height
var onResize = function() {
    $("body").css("padding-top", $(".navbar-fixed-top").height());
};
$(window).resize(onResize);
//response callback for search
function showResponse(response) {
    $('.searchButton').attr('disabled', true);
    $('.search2').attr('disabled', true);
    if(response.status == 200) {
        var responseObj = response.data.items;
        totalPages = Math.round(response.data.pageInfo.totalResults / 10);
        var nextPageToken = response.data.nextPageToken;
        var prevPageToken = response.data.prevPageToken;
        $("#display").empty();
        var mainTitle = "<div id='mainTitle'>Showing results for '" + q + "'</div>";
        $("#display").append(mainTitle);
        for (var i = 0; i < responseObj.length; i++) {
            var searchResult = "<div class=container2><div><img class ='thumbnail img-responsive' src=" + responseObj[i]['snippet']['thumbnails']['default']['url'] + "></div><div class='title'><h4>" + responseObj[i]['snippet']['title'] + "</h4></div><div id='desc' class='hidden-xs'>" + responseObj[i]['snippet']['description'] + "</div><button name='download' type='button' id='download" + i + "'><i class='fa fa-download' aria-hidden='true'></i>Download MP3</button></div>";
            $("#display").append(searchResult);
            $("#download" + i).on("click", { value: responseObj[i], count: i }, popup);
        }
        $("#display").append("<div id='page'><div id='pageCount' class='text-center'>Page " + pageCounter + " of " + totalPages + "</div><div id='pageButtons'><button type='button' class='prevPage' disabled='true'><<</button><button type='button' class='nextPage'>>></button></span></div>");
        $(".prevPage").css({ "background-color": "rgba(255,255,255,0.3)" });
        $(".prevPage").addClass("nohover");
        //disbaling the onclick when there are no pages left to display
        if (pageCounter == 1) {
            $(".prevPage").attr("disabled", true);
            $(".prevPage").css({ "background-color": "rgba(255,255,255,0.3)" });
            $(".prevPage").addClass("nohover");
        } else
            $(".prevPage").attr("disabled", false);
        if (pageCounter == totalPages) {
            $(".nextPage").attr("disabled", true);
            $(".nextPage").css({ "background-color": "rgba(255,255,255,0.3)" });
            $(".nextPage").addClass("nohover");
        } else
            $(".nextPage").attr("disabled", false);
        //changing pages onclick
        $(".nextPage").on("click", { page: nextPageToken }, pageFunction);
        $(".prevPage").on("click", { page: prevPageToken }, pageFunction);
    }
}

//search function for each entered query
function search() {
    $('.search2').attr('disabled', true);
    $("#display").empty();
    if ($(".navbar-form").css('display') == 'none')
        q = $('.searchInput').val();
    else
        q = $('.form-control').val();
    if (q) {
        if ($(".navbar-form").css("display") == "none") {
            $("#search").hide();
            $(".navbar-form").css("display", "block");
            $("#navLogo").css("display", "block");
        }
        let postData = {
            q: q
        };
        $.ajax({
            url: 'http://localhost:5000/musicfever/api/v1/search', // API endpoint
            type: 'POST', // HTTP method
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(postData), // Data to be sent
            success: showResponse,
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
        });
    }
}
//modal popup dialogue box
function popup(event) {
    $('#download' + event.data.count).attr('disabled', true);
    $.ajax({
        url: 'http://localhost:5000/musicfever/api/v1/download', // API endpoint
        type: 'POST', // HTTP method
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({ id: event.data.value.id.videoId }), // Data to be sent
        xhrFields: {
            responseType: 'blob'  // Ensure the response is a Blob (binary data)
        },
        success: function(response, xhr) {
            try {
                // Enable the download button
                $('#download' + event.data.count).attr('disabled', false);
    
                // Get the Content-Disposition header to extract the filename
                const contentDisposition = xhr.getResponseHeader('Content-Disposition');
                console.log(contentDisposition);
    
                const matches = contentDisposition ? contentDisposition.match(/filename="(.+)"/) : null;
                const fileName = matches ? matches[1] : 'audio.mp3'; // Default to 'audio.mp3' if no filename is found
    
                // Create a new Blob from the response (audio file)
                const blob = response;  // Since we've set the responseType to 'blob', it's already a Blob
    
                // Create a link element
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = fileName;  // Set the download file name
                downloadLink.click();  // Trigger the download
            } catch (e) {
                console.log("Error:", e);
            }
        },
        error: function() {
            // In case of error, re-enable the download button
            $('#download' + event.data.count).attr('disabled', false);
        }
    });
    
};
//previous/next page display
function pageFunction(event) {
    var butCls = $(this).attr('class');
    if (butCls == "nextPage")
        pageCounter++;
    else
        pageCounter--;

    let postData = {
        q: q,
        pageToken : event.data.page
    };
    $.ajax({
        url: 'http://localhost:5000/musicfever/api/v1/search', // API endpoint
        type: 'POST', // HTTP method
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(postData), // Data to be sent
        success: showResponse,
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
};
