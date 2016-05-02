/**
 * Created with PyCharm.
 * User: LY
 * Date: 13-12-1
 * Time: 下午11:00
 * To change this template use File | Settings | File Templates.
 */

function slidedown() {
    document.getElementById('actabstract').style.display = "none";
    document.getElementById('actdetails').style.display = "block";

}
function slideup() {
    document.getElementById('actabstract').style.display = "block";
    document.getElementById('actdetails').style.display = "none";
}

window.timer = null;

var startCounting = function (timeoffset, activity) {
    var status = -1;
    function CountDown() {
        var currentTime = Date.now() + timeoffset;
        activity.currentTime = new Date(currentTime);
        var totalseconds;
        if (currentTime < activity.bookStart) {
            if (status != 0) {
                status = 0;
                render();
            }
            totalseconds = (activity.bookStart.getTime() - currentTime) / 1000;
        } else if (currentTime < activity.bookEnd) {
            if (status != 1) {
                status = 1;
                render()
            }
            totalseconds = (activity.bookEnd.getTime() - currentTime) / 1000;
        } else {
            if (status != 2) {
                status = 2;
                render();
            }
            totalseconds = 0;
        }
        totalseconds = Math.ceil(totalseconds);
        var strtimer = '';
        if (totalseconds > 0) {
            var days = parseInt(totalseconds / 60 / 60 / 24, 10);
            var hours = parseInt(totalseconds / 60 / 60 % 24, 10);
            var minutes = parseInt(totalseconds / 60 % 60, 10);
            var seconds = parseInt(totalseconds % 60, 10);
            days = checkFormat(days);
            hours = checkFormat(hours);
            minutes = checkFormat(minutes);
            seconds = checkFormat(seconds);
            strtimer = '<span class="timer">' + days + '</span>天<span class="timer">' + hours + '</span>小时<span class=timer>'
                + minutes + '</span>分<span class=timer>' + seconds + '</span>秒';
            --totalseconds;
        }
        else {
            clearInterval(timer);
            strtimer = '';
            $('#duringbook').hide();
            $('#ticket-during-book').hide();
        }
        document.getElementById('activitytimer').innerHTML = strtimer;
    }

    function checkFormat(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    CountDown();
    setTimeout(function () {
        CountDown();
        timer = setInterval(CountDown, 1000);
    }, 1000 - new Date().getMilliseconds());
};
