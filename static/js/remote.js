function message(msg, importance) {
    $("#message").html("");
    $("#message").show("slow");
    if (importance == 1) {
        $("#message").html("<p class='bg-success'>" + msg + "</p>");
    } else if (importance == 2) {
        $("#message").html("<p class='bg-danger'>" + msg + "</p>");
    } else {
        $("#message").html("<p class='bg-info'>" + msg + "</p>");
    }
    setTimeout(function () {
        $("#message").hide("slow");
    }, 3000);
}

function advanced() {
    $("#advanced").toggle("fast");
}

function mkrequest(url, response) {
    try {
        var newURL = document.location.origin + url;
        if (response == 1) {
            message("Trying to get video stream URL. Please wait ~ 10-30 seconds.", 0);
        } else if (response == 2) {
            message("Trying to add video to queue. ", 0);
        } else if (response == 3) {
            message("Trying to program shutdown. ", 0);
        }

        var req = new XMLHttpRequest();
        req.timeout = 500;
        req.open('GET', newURL, true);
        req.onreadystatechange = function (aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    setTimeout(getPlaylist, 2000);
                    if (req.responseText == "1") {
                        if (response == 1) {
                            message("Success ! Video should now be playing.", 1);
                        } else if (response == 2) {
                            message("Success ! Video has been added to queue.", 1);
                        } else if (response == 3) {
                            message("Success ! Shutdown has been successfully programmed.", 1);
                        } else if (response == 4) {
                            message("Success ! Shutdown has been cancelled.", 1);
                        }

                    } else {
                        message("An error occured during the treatment of the demand. Please make sure the link/action is compatible", 2);
                    }
                } else {
                    message("Error during connecting requesting from server !", 2);
                }
            }
        };
        req.send(null);
        setTimeout(function () {
           // req.abort()
        }, 1000)
    }
    catch (err) {
        message("Error ! Make sure the ip/port are corrects, and the server is running.")
    }
}

$(function () {

    $("#castbtn").click(function () {
        if ($("#media_url").val() !== "") {
            var url = $("#media_url").val();
            var url_encoded_url = encodeURIComponent(url);
            mkrequest("/stream?url=" + url_encoded_url, 1)
        } else {
            message("You must enter a link !", 2)
        }
    });

    $("#addqueue").click(function () {
        if ($("#media_url").val() !== "") {
            var url = $("#media_url").val();
            var url_encoded_url = encodeURIComponent(url);
            mkrequest("/queue?url=" + url_encoded_url, 2)
        } else {
            message("You must enter a link !", 2)
        }
    });

    $("#shutbtn").click(function () {
        if ($("#time_shut").val() !== "") {
            var time = $("#time_shut").val();
            console.log($("#time_shut").val());
            mkrequest("/shutdown?time=" + time, 3)
        } else {
            message("You must enter a duration !", 2)
        }
    });


    function secondsToHms(d) {
        d = Number(d);

        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
    }

    var to = false;
    var progress = $('#progress').slider({
        formatter: function (value) {
            return secondsToHms(value);
        }
    }).change(function () {
        var _that = this;
        if (to) {
            clearTimeout(to)
        }
        to = setTimeout(function () {
            console.log($(_that).val());
        }, 50);
    });
    var nowPlaying = function () {

        $.get('/status', function (response) {
            //console.log(response)
            $('#video-image').addClass('hidden');
            if (response.hasOwnProperty('thumbnail') && response.thumbnail) {
                $('#video-image').removeClass('hidden');
                $('#video-image').attr('src', response.thumbnail);
                //$('#progress').attr('value', response['position']).attr('max', response.duration)
                $('#position').html(secondsToHms(response['position']))
                $('#title').html(response.title)
                $('#duration').html(secondsToHms(response.duration))

                progress.slider('setAttribute', 'max', response.duration)
                progress.slider('setValue', response.position);

            }
        })
    };
    setInterval(nowPlaying, 1000);
    nowPlaying();
    window.getPlaylist = function () {
        $.get('/playlist', function (playlist) {
            console.log(playlist);
            var rows = [];
             $.each(playlist, function (key, item) {
                    //console.log(item);
                    var row = '<div class="item">' +
                        '<div class="pull-left col-xs-2 cover-image" style="background-image: url('+ item.thumbnail +');"></div>' +
                        '<div class="pull-left col-xs-10">'+ item.title +' ['+ secondsToHms(item.duration) +']</div>'+
                        '</div>'

                    rows.push(row)

                });
            $('#playlist').html(rows.join(''))
        });
    };
    setInterval(getPlaylist, 10000);
    getPlaylist();

});
