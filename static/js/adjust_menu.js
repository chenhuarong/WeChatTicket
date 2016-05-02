/**
 * Created with PyCharm.
 * User: Epsirom
 * Date: 13-12-14
 * Time: 上午11:36
 */

function upmenu(count) {
    if (count > 0) {
        var menus = locals.showActs;
        var menu = menus[count];
        menus[count] = menus[count - 1];
        menus[count - 1] = menu;
        render();
     }
}

function downmenu(count) {
    var menus = locals.showActs;
    var len = menus.length;
    if (count < len - 1) {
        var menu = menus[count];
        menus[count] = menus[count + 1];
        menus[count + 1] = menu;
        render();
    }
}

function removemenu(count) {
    var menus = locals.showActs;
    locals.hideActs.push(menus.splice(count, 1)[0]);
    render();
}

function change_alter(i) {
    var alters = locals.hideActs;
    var menus = locals.showActs;
    menus.push(alters.splice(i, 1)[0]);
    render();
}
