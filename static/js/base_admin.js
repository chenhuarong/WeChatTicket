window.loginRequired = function (cb) {
    api.get('/api/a/login', {}, cb, function () {
        window.location.href = '/a/login?' + $.param({
            next: window.location.pathname
        });
    });
};

window.logout = function () {
    api.post('/api/a/logout', {}, null, dftFail, function () {
        window.location.href = '/a/login?' + $.param({
            next: window.location.pathname
        });
    });
};

window.api.form = function (form, success, fail, before, complete) {
    before = before || $.noop;
    success = success || $.noop;
    fail = fail || $.noop;
    complete = complete || $.noop;
    form.submit(function () {
        var data = {};
        $.each($(this).serializeArray(), function (i, input) {
            data[input.name] = input.value;
        });
        if (before(data) === false) {
            return false;
        }
        api.post($(this).attr('action'), data, success, fail, complete);
        return false;
    })
};

window.api.postForm = function (url, data, success, fail, complete) {
    success = success || $.noop;
    fail = fail || $.noop;
    complete = complete || $.noop;
    return $.ajax({
        type: 'POST',
        url: url,
        data: data,
        processData: false
    }).done(function (response, status, xhr) {
        if (response.code != 0) {
            return fail(response.code, response.msg);
        } else {
            return success(response.data);
        }
    }).fail(function (xhr, errmsg, e) {
        return fail(-2, errmsg, e);
    }).always(complete);
};

window.wrapDate = function (obj) {
    for (var i = 1, len = arguments.length; i < len; ++i) {
        var key = arguments[i];
        if (obj[key + '-year']) {
            obj[key] = new Date(
                parseInt(obj[key + '-year']),
                parseInt(obj[key + '-month']) - 1,
                parseInt(obj[key + '-day']),
                parseInt(obj[key + '-hour']),
                parseInt(obj[key + '-minute'])
            );
            delete obj[key + '-year'];
            delete obj[key + '-month'];
            delete obj[key + '-day'];
            delete obj[key + '-hour'];
            delete obj[key + '-minute'];
        }
    }
};

window.updateObj = function (obj, newObj) {
    for (var key in newObj) {
        obj[key] = newObj[key];
    }
};
