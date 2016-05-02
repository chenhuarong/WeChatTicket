/**
 * Created with PyCharm.
 * User: Epsirom
 * Date: 13-12-3
 * Time: 下午11:12
 */

var timeOffset = 0;

function getSmartStatus(act) {
    if (act.status == 0) {
        return '未发布';
    } else if (act.status == 1) {
        var now = act.currentTime;
        if (now < act.bookStart) {
            return '等待订票';
        } else if (now < act.bookEnd) {
            return '正在订票';
        } else if (now < act.startTime) {
            return '正在出票';
        } else if (now < act.endTime) {
            return '活动进行中';
        } else {
            return '已结束';
        }
    } else {
        return '未知';
    }
}

function wrapTwoDigit(num) {
    if (num < 10) {
        return '0' + num;
    } else {
        return num;
    }
}

function getChsDate(dt) {
    return wrapTwoDigit(dt.getDate()) + '日';
}

function getChsMonthDay(dt) {
    return wrapTwoDigit(dt.getMonth() + 1) + '月' + getChsDate(dt);
}

function getChsFullDate(dt) {
    return dt.getFullYear() + '年' + getChsMonthDay(dt);
}

function getChsDay(dt) {
    var dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return dayMap[dt.getDay()];
}

function getTimeStr(dt) {
    return wrapTwoDigit(dt.getHours()) + ':' + wrapTwoDigit(dt.getMinutes());
}

function isSameYear(d1, d2) {
    return d1.getFullYear() == d2.getFullYear();
}

function isSameMonth(d1, d2) {
    return isSameYear(d1, d2) && (d1.getMonth() == d2.getMonth());
}

function isSameDay(d1, d2) {
    return isSameYear(d1, d2) && isSameMonth(d1, d2) && (d1.getDate() == d2.getDate());
}

function getSmartTimeRange(start_time, end_time) {
    var result = getChsFullDate(start_time) + ' ' + getChsDay(start_time) + ' ' + getTimeStr(start_time) + ' - ';
    if (isSameDay(start_time, end_time)) {
        result += getTimeStr(end_time);
    } else if (isSameMonth(start_time, end_time)) {
        result += getChsDate(end_time) + ' ' + getChsDay(end_time) + ' ' + getTimeStr(end_time);
    } else if (isSameYear(start_time, end_time)) {
        result += getChsMonthDay(end_time) + ' ' + getChsDay(end_time) + ' ' + getTimeStr(end_time);
    } else {
        result += getChsFullDate(end_time) + ' ' + getChsDay(end_time) + ' ' + getTimeStr(end_time);
    }
    return result;
}

function expand_long_text(dom) {
    var newhtml, par = $(dom).parent(), refdata = par.text().trim();
    dom = $(dom);
    refdata = refdata.substring(0, refdata.length - 3);
    newhtml = dom.attr('ref-data') + ' <a style="cursor:pointer;" ref-data="' + refdata + '" ref-hint="' + dom.text() + '" onclick="expand_long_text(this);">' + dom.attr('ref-hint') + '</a>';
    par.html(newhtml);
}

function deleteact(actid){
    var i, len, curact, activities = locals.activities;
    for(i = 0, len = activities.length; i < len; ++i){
        if(activities[i].id == actid){
            curact = activities[i];
            break;
        }
    }
    var content = '确认删除<span style="color:red">'+getSmartStatus(curact)+'</span>活动：<span style="color:red">'+curact.name+'</span>？';
    $('#modalcontent').html(content);
    $('#act-'+actid).css("background-color","#FFE4C4");
    $('#deleteid').val(actid);
    $('#delModal').modal({
      keyboard: false,
      backdrop:false
    });
}

function delConfirm(){
    var delid = $('#deleteid').val();
    api.post('/api/a/activity/delete', {id: parseInt(delid)}, function () {
        window.location.reload();
    }, dftFail, function () {
        $('#act-'+delid).css("background-color","#FFF");
    });
}

function delCancel(){
    var delid = $('#deleteid').val();
    $('#act-'+delid).css("background-color","#FFF");
}

function createtips(){
    var duringbook = [], beforeact = [], duringact = [];
    $.each(locals.activities, function (i, act) {
        if (act.currentTime >= act.bookStart && act.currentTime <= act.bookEnd) {
            duringbook.push(act.id);
        } else if (act.currentTime >= act.bookEnd && act.currentTime <= act.startTime) {
            beforeact.push(act.id);
        } else if (act.currentTime >= act.startTime && act.currentTime <= act.endTime) {
            duringact.push(act.id);
        }
    });
    var id;
    for(id in duringbook){
        $('#del-'+duringbook[id]).popover({
            html: true,
            placement: 'top',
            title:'',
            content: '<span style="color:red;">活动正在订票中，不能删除!</span>',
            trigger: 'hover',
            container: 'body'
        });
    }
    for(id in beforeact){
        $('#del-'+beforeact[id]).popover({
            html: true,
            placement: 'top',
            title:'',
            content: '<span style="color:red;">活动已出票，不能删除!</span>',
            trigger: 'hover',
            container: 'body'
        });
    }
    for(id in duringact){
        $('#del-'+duringact[id]).popover({
            html: true,
            placement: 'top',
            title:'',
            content: '<span style="color:red;">活动正在进行中，不能删除!</span>',
            trigger: 'hover',
            container: 'body'
        });
    }
}
