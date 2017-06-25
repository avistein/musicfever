var q, pageCounter = 0,
    totalPages;

//enabling enter to search
function handle(e) {
    if (e.keyCode === 13) {
        search();
    }
    return false;
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
    pageCounter = 1;
    var responseObj = response.items;
    totalPages = Math.round(response.pageInfo.totalResults / 10);
    var nextPageToken = response.nextPageToken;
    var prevPageToken = response.prevPageToken;
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
    if (pageCounter == totalPages) {
        $(".nextPage").attr("disabled", true);
        $(".nextPage").css({ "background-color": "rgba(255,255,255,0.3)" });
        $(".nextPage").addClass("nohover");
    }
    //changing pages onclick
    $(".nextPage").on("click", { page: nextPageToken }, pageFunction);
    $(".prevPage").on("click", { page: prevPageToken }, pageFunction);
}
//preparing youtubeAPI
function onClientLoad() {
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}
//when API is ready
function onYouTubeApiLoad() {
    gapi.client.setApiKey('AIzaSyCVbaE8960HYm7yTRNb4LXdbQcgSwFYwBo');
    $('.searchInput').attr('disabled', false);
    $('.searchButton').attr('disabled', false);
    $(".searchButton").on("click", search);
    $("#search2").on("click", search);
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
        var request = gapi.client.youtube.search.list({
            q: q,
            type: 'video',
            part: 'snippet',
            maxResults: 10
        });
        request.execute(showResponse);
    }
}
//modal popup dialogue box
function popup(event) {
    $('#download' + event.data.count).attr('disabled', true);
    $(".modal-header > h3").empty();
    $(".modal-body").empty();
    var popTitle = event.data.value['snippet']['title'];
    $(".modal-header > h3").append(popTitle);

    $(".close").on("click", function() {
        $(".modal").css("display", "none");
    });
    $("#cancel").on("click", function() {
        $(".modal").css("display", "none");
    });
    $("#iframe").empty();
    $("#iframe").append("<iframe scrolling='no' src='//www.youtubeinmp3.com/widget/button/?video=https://www.youtube.com/watch?v=" + event.data.value['id']['videoId'] + "&color=cc1a1a'>");
    var youtubeInMp3 = "https://www.youtubeinmp3.com/fetch/?format=JSON&video=http://www.youtube.com/watch?v=" + event.data.value['id']['videoId'] + "&filesize=1&bitrate=1";
    $.ajax({
        url: youtubeInMp3,
        success: function(response) {
            try {
                $('#download' + event.data.count).attr('disabled', false);
                var responseToObj = JSON.parse(response);
                var filesize = (responseToObj['filesize'] / (1024 * 1024)).toFixed(2);
                var bitrate = responseToObj['bitrate'];

                var downLink = responseToObj['link'];
                var popBody = "<img class='img-responsive center-block' src=" + event.data.value['snippet']['thumbnails']['medium']['url'] + "><div class='audio'><audio class='music-preview' controls='controls'><source src='"+downLink+"' type='audio/mp3'></audio></div><div id='filesize'>Size: " + filesize + "MB</div><div id='bitrate'>Bitrate: " + bitrate + "kbps</div>";

                $(".modal-body").append(popBody)
                $(".modal").css("display", "block");

                $("#iframe").css("display", "none");
                $(".popDownload").css("display", "inline-block");
                $(".popDownload").attr("href", downLink);
            } catch (e) {

                var popBody = "<img class='img-responsive center-block' src=" + event.data.value['snippet']['thumbnails']['medium']['url'] + "><div class='audio'><audio class='music-preview' controls='controls'><source src='"+downLink+"' type='audio/mp3'></audio></div>";

                $(".modal-body").append(popBody);
                $(".modal").css("display", "block");

                $(".popDownload").css("display", "none");
                $("#iframe").css("display", "block");


            }
        },
        error: function() {
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
    var request = gapi.client.youtube.search.list({
        q: q,
        type: 'video',
        part: 'snippet',
        pageToken: event.data.page,
        maxResults: 10
    });
    request.execute(showPageResponse);
};
//response callback for pageFunction()
function showPageResponse(response) {
    $("#display").empty();
    var mainTitle = "<div id='mainTitle'>Showing results for '" + q + "'</div>";
    $("#display").append(mainTitle);
    var responseObj = response.items;
    var nextPageToken = response.nextPageToken;
    var prevPageToken = response.prevPageToken;
    for (var i = 0; i < responseObj.length; i++) {
        var searchResult = "<div class=container2><div><img class ='thumbnail img-responsive' src=" + responseObj[i]['snippet']['thumbnails']['default']['url'] + "></div><div class='title'><h4>" + responseObj[i]['snippet']['title'] + "</h4></div><div id='desc' class='hidden-xs'>" + responseObj[i]['snippet']['description'] + "</div><button name='download' type='button' id='download" + i + "'><i class='fa fa-download' aria-hidden='true'></i>Download MP3</button></div>";
        $("#display").append(searchResult);
        $("#download" + i).on("click", { value: responseObj[i], count: i }, popup);
    }
    $("#display").append("<div id='page'><div id='pageCount' class='text-center'>Page " + pageCounter + " of " + totalPages + "</div><div id='pageButtons'><button type='button' class='prevPage'><<</button><button type='button' class='nextPage'>>></button></span></div>");
    $(".nextPage").on("click", { page: nextPageToken }, pageFunction);
    $(".prevPage").on("click", { page: prevPageToken }, pageFunction);
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
}
