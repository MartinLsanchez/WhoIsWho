/* Author: Team w&w */
function validateUsername() {
    var username = document.getElementById("username").value();
    if (username.contains("%")) {
        document.getElementById("username").value("");
    }
}

$(document).ready(function () {
    $('#boardGame div.cardBack').hide().css('left', 0);

    function mySideChange(front) {
        if (front) {
            $(this).parent().find('div.cardFront').show();
            $(this).parent().find('div.cardBack').hide();

        } else {
            $(this).parent().find('div.cardFront').hide();
            $(this).parent().find('div.cardBack').show();
        }
    }

    $('.cardInfo').click(function () {
        $(this).rotate3Di('toggle', 750, {direction: 'clockwise', sideChange: mySideChange});

    });

    $("#askQuestions").chained("#questionAbout");

//    Load ranking table when document is loaded
    listJson();
});

function loadRanking() {
    var room = $("#rankingRoom")

    room.slideToggle('slow');
    var link = $('#rankingLink');
    link.toggleClass('pressed');
}

function loadAbout() {
    var room = $('#aboutRoom');
    room.slideToggle('slow');
    var link = $('#aboutLink');
    link.toggleClass('pressed');
}

function loadProfile() {
    var room = $('#profileRoom');
    room.slideToggle('slow');
    var link = $('#profileLink');
    link.toggleClass('pressed');
}

var req;
function loadXML(method, url, params, callback) {
    var baseUrl = "http://dpoi2012api.appspot.com/api/1.0";
    if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        /* For IE/Windows ActiveX */
        req = new ActiveXObject("Microsoft.XMLHTTP");
    }
    req.onreadystatechange = function () {
        /*readyState 4 = Complete */
        if (req.readyState == 4) {
            /*Status = 200, everything OK*/
            if (req.status == 200) {
                var jsonData = JSON.parse(req.responseText);
                /*Check code to make sure the status is OK*/
                if (jsonData.status.code == 1) {
                    callback(jsonData);
                } else if (jsonData.status.code == 6) {
                    callback(jsonData);
                } else if (jsonData.status.code == 5) {
                    callback(jsonData);
                } else {
                    var loading = document.getElementById('loading');
                    suicide(loading);
                    showWarning(req);
                }
            } else {
                var loading = document.getElementById('loading');
                suicide(loading);
                showWarning(req);
            }
        }
    }
    ;
    req.open(method, baseUrl + url + params, true);
    req.send();
}

var host = "http://dpoi2012api.appspot.com";
var credential = "credential=ranking";
function requestRemoteData(method, url, params, callbackFunction) {
    if (window.XMLHttpRequest || window.ActiveXObject) {
        req = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var jsonData = req.responseText;
                    var jsonObj = JSON.parse(jsonData);
                    callbackFunction(jsonObj);
                } else {
                    showMessage("Can't establish connection ( Error " + req.status + " )");
                }
            }
        };
        var paramString = credential;
        if (params) {
            for (var i = 0; i < params.length; i++) {
                paramString += "&" + params[i];
            }
        }
        var url2 = host + "/" + url + "?" + paramString;
        req.open(method, url2, true);
        console.log("Sending to " + url2);
        req.send();
//        todo Put the parameters in the send line (above line)
    } else {
        showMessage("Can't identify browser");
    }
}

function listJson() {
    var method = "GET";
    var url = "/list"
    var params = "?credential=ranking";
    loadXML(method, url, params, parseJSON);
}

function updateJson(id) {
    var first = document.getElementById("editFirst").value;
    var last = document.getElementById("editLast").value;
    var mail = document.getElementById("editMail").value;
    var phone = document.getElementById("editPhone").value;

    var method = "POST";
    var url = "/update?credential=ranking";
    var params = "&id=" + id + "&first=" + first + "&last=" + last + "&mail=" + mail + "&phone=" + phone;
    loadXML(method, url, params, updateOneJson);
    hidePopUp();
}

function updateOneJson(json) {
    var mail = json.payload.mail;
    var phone = json.payload.phone;
    var last = json.payload.last;
    var first = json.payload.first;
    var id = json.payload.id;
    var row = document.getElementById(id);
    suicide(row);
    createTableRow(id, first, last, mail, phone);
}

function viewJson(id) {
    var method = "GET";
    var url = "/view";
    var params = "?credential=nconstanzo&id=" + id;
    loadXML(method, url, params, popUp);
}

function viewEditJson(id) {
    var method = "GET";
    var url = "/view";
    var params = "?credential=nconstanzo&id=" + id;
    loadXML(method, url, params, editPopUp);
}

function createJson() {
    var first = document.getElementById("editFirst").value;
    var last = document.getElementById("editLast").value;
    var mail = document.getElementById("editMail").value;
    var phone = document.getElementById("editPhone").value;

    var method = "POST";
    var url = "/create?credential=ranking";
    var params = "&first=" + first + "&last=" + last + "&mail=" + mail + "&phone=" + phone;
    loadXML(method, url, params, parseOneJson);
    hidePopUp();
}

function parseOneJson(json) {

    var id = json.payload.id;
    var mail = json.payload.name;
    var phone = json.payload.rank;
    var last = json.payload.Win;
    var first = json.payload.Lost;
    createTableRow(id, first, last, mail, phone);
}

function deleteJson(id) {
    var method = "POST";
    var url = "/delete";
    var params = "?credential=nconstanzo&id=" + id;
    loadXML(method, url, params, deleteRow);
    hidePopUp();
}

function deleteRow(json) {

    var id = json.payload.id;
    var row = document.getElementById(id);
    suicide(row);

}

function bubbleSort(a) {
    var swapped;
    do {
        swapped = false;
        for (var i = 0; i < a.length - 1; i++) {
            if (Number(a[i].win) > Number(a[i + 1].win)) {
                var temp = a[i];
                a[i] = a[i + 1];
                a[i + 1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
    return a;
}

var players;
function parseJSON(json) {
    players = [];
    for (i = 0; i < json.payload.count; i++) {
        var RankObject = {};
        RankObject.id = json.payload.items[i].id;
        RankObject.name = json.payload.items[i].name;
        RankObject.rank = json.payload.items[i].rank;
        RankObject.win = json.payload.items[i].Win;
        RankObject.lose = json.payload.items[i].Lost;
        players[i] = RankObject;

    }
    players = bubbleSort(players);
    $("#rankingTable").find("tr:gt(0)").remove();

    var length = players.length;
    for (i = length - 10; i < length; i++) {
        var id = json.payload.items[i].id;
        var credential = json.payload.items[i].credential;
        var first = length - (i);
        var last = players[i].name;
        var mail = players[i].win;
        var phone = players[i].lose;
        var created = json.payload.items[i].created;
        createTableRow(id, first, last, mail, phone);
    }
    //document.getElementById('table1').deleteRow(json.payload.count+1);
    //var loading = document.getElementById('loading');
    //suicide (loading);
}

function addPlayer(playerName, firstPoint,callbackFunction) {
    var win = 0;
    var lose = 0;
    if (firstPoint == "win"){
        win++;
    } else if (firstPoint == "lose"){
        lose++;
    }
    var params = ["name=" + playerName,"Win=" + win, "Lost=" + lose];

    requestRemoteData("POST", "api/1.0/create", params, callbackFunction);
}

function updatePlayer(player, state) {
    if (state == "win"){
        player.win = parseInt(player.win) + 1;
    } else if (state == "lose"){
        player.lose = parseInt(player.lose) + 1;
    }
    var params = ["id=" + player.id,"name=" + player.name,"Win=" + player.win, "Lost=" + player.lose];

    requestRemoteData("POST", "api/1.0/update", params, listJson);
}

function updatePlayerByName(playerName, state) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].name == playerName) {
            updatePlayer(players[i], state);
            return;
        }
    }
    addPlayer(playerName, state, listJson);
}

function createTableRow(id, first, last, mail, phone) {
    var table = document.getElementById('rankingTable').insertRow(1);
    table.setAttribute("class", "row");

    var cero = table.insertCell(0);
    var one = table.insertCell(1);
    var two = table.insertCell(2);
    var three = table.insertCell(3);


    table.setAttribute("id", id);

    cero.innerHTML = first;
    one.innerHTML = last;
    two.innerHTML = mail;
    three.innerHTML = phone;

}

function showWarning(req) {
    var index = document.getElementById("index");
    var element = document.createElement("span");

    element.setAttribute("id", "error");
    element.setAttribute("class", "message");
    element.innerHTML = "Oops... An error ocurred: \n" + req.statusText;

    setTimeout(fade(element), 1000);

    index.appendChild(element);
}

function fade(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1) {
            clearInterval(timer);

            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

function popUp(json) {
    var window = document.getElementById("viewPopUp");
    var blanket = document.getElementById("popUpBlanket");
    show(window);
    show(blanket);

    var table = document.getElementById("userTable")

    var id = json.payload.id;
    var mail = json.payload.mail;
    var phone = json.payload.phone;
    var last = json.payload.last;
    var first = json.payload.first;
    var created = json.payload.created;
    table.deleteRow(1);
    var row = table.insertRow(1);

    var zero = row.insertCell(0);
    var one = row.insertCell(1);
    var two = row.insertCell(2);
    var three = row.insertCell(3);
    var four = row.insertCell(4);
    var five = row.insertCell(5);

    zero.innerHTML = id;
    one.innerHTML = first;
    two.innerHTML = last;
    three.innerHTML = mail;
    four.innerHTML = phone;
    five.innerHTML = created;
}

function editPopUp(json) {
    var window = document.getElementById("editPopUp");
    var blanket = document.getElementById("popUpBlanket");
    show(window);
    show(blanket);

    var title = document.getElementById("editTitle");
    title.innerHTML = "Edit User Information";


    var id = json.payload.id;

    var first = document.getElementById("editFirst");
    var last = document.getElementById("editLast");
    var mail = document.getElementById("editMail");
    var phone = document.getElementById("editPhone");

    first.value = json.payload.first;
    last.value = json.payload.last;
    mail.value = json.payload.mail;
    phone.value = json.payload.phone;

    var saveEdit = document.getElementById("saveEdit");
    saveEdit.setAttribute("onclick", "updateJson('" + id + "')");

}

function hidePopUp() {
    var window = document.getElementById("viewPopUp");
    var editWindow = document.getElementById("editPopUp");
    var cancelWindow = document.getElementById("cancelPopUp");
    var blanket = document.getElementById("popUpBlanket");
    hide(window);
    hide(editWindow);
    hide(cancelWindow);
    hide(blanket);

}

function createUserPopUp() {
    var window = document.getElementById("editPopUp");
    var blanket = document.getElementById("popUpBlanket");
    show(window);
    show(blanket);

    var title = document.getElementById("editTitle");
    title.innerHTML = "Add new user";

    var first = document.getElementById("editFirst");
    var last = document.getElementById("editLast");
    var mail = document.getElementById("editMail");
    var phone = document.getElementById("editPhone");

    first.value = "";
    last.value = "";
    mail.value = "";
    phone.value = "";


    var saveUser = document.getElementById("saveEdit");
    saveUser.setAttribute("onclick", "createJson()")
}

function cancelPopUp(id) {
    var window = document.getElementById("cancelPopUp");
    var blanket = document.getElementById("popUpBlanket");
    show(blanket);
    show(window);

    var ok = document.getElementById("confirmDelete");
    ok.setAttribute("onclick", "deleteJson('" + id + "')");

}

function suicide(element) {
    element.parentNode.removeChild(element);
}

function show(element) {
    element.style.display = "block";
}


