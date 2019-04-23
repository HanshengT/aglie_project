var player_score = Number(document.getElementById("score").innerHTML);
var position = 0
var rotation = 0

var bot_name = null
var position_bot = 0
var rotation_bot = 0
var status = 'Selecting'

var point = '';
var switch_time = Math.round(Math.random() * 3000 + 3000);
var game_start = false;
var current_pic = 1
var who_go = 'self'
var round = 1



function SetPosition(num) {
    position = Number(num);
}

function SetRotation() {
    var num = document.getElementById('rotation_num').value;
    rotation = Number(num);
}

function BotPosition() {
    position_bot = Math.round(Math.random() * 12);
    while (position_bot == 0) {
        position_bot = Math.round(Math.random() * 12);
    }
}
BotPosition()

function BotRotation() {
    rotation_bot = Math.round(Math.random() * 11);
    while (rotation_bot == 0) {
        rotation_bot = Math.round(Math.random() * 11);
    }
}
BotRotation()


function GenBotName() {
    var index = Math.round(Math.random() * 50);
    document.getElementById("bot_name").innerHTML = `Bot #${index}`
}
GenBotName()


function Check() {
    SetRotation();
    if (position == 0) {
        alert('Select a Number on the roulette');
        return;
    } else if (rotation == 0) {
        alert('Select a Number from the list on the right');
        return;
    }
    StartGame();
}

function ApplyMask() {
    var mask = document.getElementById("mask");
    mask.style.height = '720px';
    mask.style.width = '720px';
}

function ApplyMask2() {
    var mask2 = document.getElementById("mask2");
    mask2.style.height = '360px';
    mask2.style.width = '360px';
}

function HideMask() {
    var mask = document.getElementById("mask");
    mask.style.height = '0px';
    mask.style.width = '0px';
}

function HideMask2() {
    var mask2 = document.getElementById("mask2");
    mask2.style.height = '0px';
    mask2.style.width = '0px';
}

function Spin(num) {

}


function point_adding() {
    if (point != '.......') {
        point = point + '.'
    } else {
        point = ''
    }
    setTimeout("point_adding()", 300);
}
point_adding()


function WriteBotStatus() {
    if (game_start == false) {
        document.getElementById("status").innerHTML = `${status}${point}`
        var write = setTimeout('WriteBotStatus()', 100);
    } else {
        clearTimeout(write)
        document.getElementById("status").innerHTML = ''
    }

}

function ChangeStatus() {
    setTimeout(() => { status = 'Waiting' }, switch_time);
}

setTimeout('WriteBotStatus(ChangeStatus())', 3000);

function CurrentPic(num) {
    var num = Number(num)
    if (current_pic + num > 12) {
        var new_current = current_pic + num - 12
        return new_current
    }

    var new_current = current_pic + num
    return new_current
}




function StartGame() {
    console.log(position);
    console.log(rotation);

    console.log(position_bot);
    console.log(rotation_bot);

    console.log('----------');


    game_start = true;

    ApplyMask();
    ApplyMask2();

    if (who_go = "self") {
        current_pic = CurrentPic(rotation)
        if (current_pic == position_bot || current_pic == position) {
            player_score = player_score - round * 5;
            document.getElementById("score").innerHTML = player_score;
            alert('You Are Hit By The Bullet!')
            position = 0
            rotation = 0
            GenBotName()
            SetPosition()
            SetRotation()
            staus = "Selecting"
            switch_time = Math.round(Math.random() * 3000 + 3000);
            game_start = false
            who_go = "self"
            round = 1
            HideMask()
            HideMask2()
        } else {
            document.getElementById("notification").innerHTML = 'You Got Really Lucky'
            current_pic = CurrentPic(rotation_bot)
            if (current_pic == position_bot || current_pic == position) {
                player_score = player_score + round * 5;
                document.getElementById("score").innerHTML = player_score;
                alert('You Won The Game!')
                position = 0
                rotation = 0
                GenBotName()
                SetPosition()
                SetRotation()
                status = "Selecting"
                switch_time = Math.round(Math.random() * 3000 + 3000);
                game_start = false
                who_go = "self"
                round = 1
                HideMask()
                HideMask2()
            } else {
                document.getElementById("notification").innerHTML = 'Ready For Next Round'
                rotation = 0
                SetRotation()
                status = "Selecting"
                switch_time = Math.round(Math.random() * 3000 + 3000);
                game_start = false
                who_go = "bot"
                round = round + 1
                HideMask2()
            }
        }
    } else if (who_go = "bot") {
        current_pic = CurrentPic(rotation_bot)
        if (current_pic == position_bot || current_pic == position) {
            player_score = player_score + round * 5;
            document.getElementById("score").innerHTML = player_score;
            alert('You Won The Game!')
            position = 0
            rotation = 0
            GenBotName()
            SetPosition()
            SetRotation()
            staus = "Selecting"
            switch_time = Math.round(Math.random() * 3000 + 3000);
            game_start = false
            who_go = "self"
            round = 1
            HideMask()
            HideMask2()
        } else {
            document.getElementById("notification").innerHTML = 'It Is Hard To Win'
            current_pic = CurrentPic(rotation)
            if (current_pic == position_bot || current_pic == position) {
                player_score = player_score - round * 5;
                document.getElementById("score").innerHTML = player_score;
                alert('You Are Hit By The Bullet!')
                position = 0
                rotation = 0
                GenBotName()
                SetPosition()
                SetRotation()
                status = "Selecting"
                switch_time = Math.round(Math.random() * 3000 + 3000);
                game_start = false
                who_go = "self"
                round = 1
                HideMask()
                HideMask2()
            } else {
                document.getElementById("notification").innerHTML = 'Ready For Next Round'
                rotation = 0
                SetRotation()
                status = "Selecting"
                switch_time = Math.round(Math.random() * 3000 + 3000);
                game_start = false
                who_go = "self"
                round = round + 1
                HideMask2()
            }

        }

    }

}