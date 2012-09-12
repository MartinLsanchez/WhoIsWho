/**
 * User: Mart0
 * Date: 4/30/12
 */
var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket;
var WSPath = $("#WSocketPath").val();
var chatSocket = new WS(WSPath);
chatSocket.onmessage = receiveEvent;
$("#talk").keypress(handleReturnKey);

function sendMessage(type) {
    chatSocket.send(JSON.stringify(
        {
            type:type,
            text:$("#talk").val(),
            questionAbout:qAbout,
            questionValue:qValue,
            questionString:qString,
            answer:qAnswer,
            guessCard:guessCardName
        }
    ))
    ;
    $("#talk").val('');
}

function receiveEvent(event) {
    var data = JSON.parse(event.data);
    console.log("Recive event: " + data);

    // Handle errors
    if (data.error) {
        chatSocket.close();
        $("#onError span").text(data.error);
        $("#onError").show();
        return
    } else {
        $("#onChat").show();
    }

    // Create the message element

//    var chatLine = $('<div class="message"><span></span><user></user><p></p></div>');
    var chatLine = $('<div class="message"><user></user><p></p></div>');

    if (data.type == 'chat') {
        $(chatLine).addClass('chat');
        $("user", chatLine).text(data.name + ":");
    }
    if (data.type == 'mistake') $(chatLine).addClass('mistake');
    if (data.type == 'start') $(chatLine).addClass('start');
    if (data.type == 'leave') $(chatLine).addClass('leave');
    if (data.type == 'info') $(chatLine).addClass('info');


    if (data.type == 'ask') {
        $("#questionPanel").show();
        $("#answerPanel").hide();
    }
    if (data.type == 'answer') {
        $("#answerPanel").show();
    }
    if (data.type == 'wait') {
        $("#questionPanel").hide();
        $("#answerPanel").hide();
    }
    if (data.type == 'my-ask' || data.type == 'my-answer') {
        $(chatLine).addClass('question');
        $("#questionPanel").hide();
        $("#answerPanel").hide();
    }
    if (data.type == 'op-ask' || data.type == 'op-answer') {
        $(chatLine).addClass('question');
    }
    if (data.type == "lie") {
        $("#lies").html(data.message);
        $(chatLine).addClass('lie');
        data.message = "Lier !!!!";
    }
    if (data.type == "end") {
        $("#questionPanel").hide();
        $("#answerPanel").hide();
        $(chatLine).addClass('end');
        updateRanking();
    }
    if (data.type == 'op-guess' || data.type == 'my-guess') {
        $(chatLine).addClass('end');
    }


//    $("span", chatLine).text(data.type);
    $("p", chatLine).text(data.message);
    $('#messages').append(chatLine)
}


var updated = false;
function updateRanking() {
    if(!updated){
        updated = true;
        // todo CHEQUEAR SI EL USUARIO ESTA EN LA LISTA.
        // todo SI ESTA, HACER UPDATE, SINO CREARLO
    }
}

function handleReturnKey(e) {
    if (e.charCode == 13 || e.keyCode == 13) {
        e.preventDefault();
        sendMessage("chat");
    }
}

function getServerInfo() {
    sendMessage("serverInfo");
}

var qAbout;
var qValue;
var qString;
function askQuestion() {
    var question = $("#askQuestions").val().split(",");
    qAbout = $("#questionAbout").val();
    qValue = question[0];
    qString = question[1];
    sendMessage("question");
}

var qAnswer;
function answerQuestion(answer) {
    qAnswer = answer;
    sendMessage("answer");
}

var guessCardName;
function guessCard() {
    smoke.prompt('What\'s the card?', function (e) {
        if (e) {
            guessCardName = e;
            sendMessage("guess");
        }
    });
}


