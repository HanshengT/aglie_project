const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const secret = "abc123";
const crypto = require('crypto');
const session = require('express-session');
const flash = require('express-flash');
const nodemailer = require('nodemailer');
const async = require('async');
const { google } = require('googleapis');
const saltrounds = 10;
const backend = require('./backend');
const port = process.env.PORT || 8080;

var app = express();
var utils = require('./utils');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(flash());
app.use(
    session({
        secret: secret,
        resave: true,
        saveUninitialized: false
    })
);
app.use('/profile', (request, response, next) => {
    if (request.session.user) {
        next();
    } else {
        response.status(401).send('User not authorized. Please log in.');
    }
});

app.use('/game', (request, response, next) => {
    if (request.session.user) {
        next();
    } else {
        response.status(401).send('User not authorized. Please log in.');
    }
});

app.use('/game1', (request, response, next) => {
    if (request.session.user) {
        next();
    } else {
        response.status(401).send('User not authorized. Please log in.');
    }
});


app.use('/change-password', (request, response, next) => {
    if (request.session.user) {
        next();
    } else {
        response.status(401).send('User not authorized. Please log in.');
    }
});


app.all('/logout', (request, response) => {
    request.session.destroy();
    response.redirect('/');
});

app.get('/', function(request, response) {
    response.render('home.hbs', {
        title: 'Home'
    });
});

app.get('/register', function(request, response) {
    response.render('register.hbs', {
        title: 'Register'
    });
});

app.get('/succeed/:username', function(request, response) {
    response.render('register_succeed.hbs', {
        title: 'Succeed',
        username: request.params.username
    });
});

app.get('/leaderboard', function(request, response) {
    var db = utils.getDB();

    db.collection('users').find({

    }).toArray(function(err, result) {

        var r_ranking = []
        var c_ranking = []

        result.forEach(function(item, index) {
            r_ranking.push(['Username: ' + item.username + '  >>  Score: ', item.score])
            c_ranking.push(['Username: ' + item.username + '  >>  Score: ', item.score1])
        })
        r_ranking.sort(function(a, b) {
            if (a[1] < b[1]) {
                return 1;
            }
            if (a[1] > b[1]) {
                return -1;
            }
            return 0;
        })
        if (r_ranking.length != 5) {
            r_ranking.push(['', ''], ['', ''], ['', ''], ['', ''], ['', ''])
            r_ranking.splice(4, r_ranking.length - 5)
        }

        c_ranking.sort(function(a, b) {
            if (a[1] < b[1]) {
                return 1;
            }
            if (a[1] > b[1]) {
                return -1;
            }
            return 0;
        })
        if (c_ranking.length != 5) {
            c_ranking.push(['', ''], ['', ''], ['', ''], ['', ''], ['', ''])
            c_ranking.splice(4, c_ranking.length - 5)
        }

        response.render('leaderboard.hbs', {
            title: 'Leaderboard',
            r_1: r_ranking[0][0] + r_ranking[0][1],
            r_2: r_ranking[1][0] + r_ranking[1][1],
            r_3: r_ranking[2][0] + r_ranking[2][1],
            r_4: r_ranking[3][0] + r_ranking[3][1],
            r_5: r_ranking[4][0] + r_ranking[4][1],
            c_1: c_ranking[0][0] + c_ranking[0][1],
            c_2: c_ranking[1][0] + c_ranking[1][1],
            c_3: c_ranking[2][0] + c_ranking[2][1],
            c_4: c_ranking[3][0] + c_ranking[3][1],
            c_5: c_ranking[4][0] + c_ranking[4][1],

        });
    })
})

app.get('/profile', function(request, response) {
    var db = utils.getDB();

    db.collection('users').find({
        username: request.session.user.username
    }).toArray(function(err, result) {
        response.render('profilepage.hbs', {
            title: 'Account',
            username: request.session.user.username,
            scoreT: result[0].scoreT,
            score: result[0].score,
            score1: result[0].score1,
        });
    })
});

app.get('/game', function(request, response) {
    var db = utils.getDB();

    db.collection('users').find({
        username: request.session.user.username
    }).toArray(function(err, result) {
        response.render('game.hbs', {
            title: 'Roulette',
            username: request.session.user.username,
            score: result[0].score
        });

    })
});


app.get('/404', function(request, response) {
    response.send('Page Not Fount');
});

app.get('/save-score/:score', function(request, response) {
    var db = utils.getDB();

    var score = Number(request.params.score)

    db.collection('users').find({
        username: request.session.user.username
    }).toArray(function(err, result) {
        var scoreT = score + result[0].score1
        db.collection('users').updateOne({
            "username": request.session.user.username

        }, { $set: { "scoreT": scoreT, "score": score } }, function(error, result) {
            response.redirect(`/profile`)
        })
    });
})

app.post('/create-user', function(request, response) {
    var db = utils.getDB();

    var username = request.body.username;
    var password = request.body.password;
    var password_confirm = request.body.password_confirm;
    var email = request.body.email;

    var create = 1;

    if (password != password_confirm) {
        response.render('simple_response.hbs', {
            h1: 'Passwords must match',
            url: '/register'
        });
        create = 0;
    };

    db.collection('users').find({
        email: email
    }).toArray(function(err, result) {
        if (result[0] != null) {
            response.render('simple_response.hbs', {
                h1: 'Email already in use',
                url: '/register'
            })
            create = 0;
        };
    });


    db.collection('users').find({
        username: username
    }).toArray(function(err, result) {
        if (result[0] == null && create == 1) {
            db.collection('info').insertOne({
                username: username,
                info: password
            })
            password = bcrypt.hashSync(password, saltrounds);
            db.collection('users').insertOne({
                username: username,
                password: password,
                email: email,
                scoreT: 0,
                score: 0,
                score1: 0,
                score2: 0
            }, (err, result) => {
                if (err) {
                    response.render('simple_response.hbs', {
                        h1: 'Unable to add user',
                        url: '/register'
                    });
                }
                response.redirect(`/succeed/${username}`);
            });
        } else {
            response.render('simple_response.hbs', {
                h1: 'Username not available',
                url: '/register'
            });
        }
    });

});

app.post('/login-user', function(request, response) {
    var db = utils.getDB();

    var username = request.body.username;
    var password = request.body.password;

    db.collection('users').find({
        username: username
    }).toArray(function(err, result) {
        if (result[0] != null) {
            let verify = bcrypt.compareSync(password, result[0].password);
            if (verify) {
                request.session.user = {
                    username: result[0].username,
                    email: result[0].email,
                    id: result[0]._id,
                    scoreT: result[0].scoreT,
                    score: result[0].score,
                    score1: result[0].score1
                };
                response.redirect('/profile');
            } else {
                response.render('simple_response.hbs', {
                    h1: 'Incorrect Password',
                    url: '/'
                });
            }
        } else {
            response.render('simple_response.hbs', {
                h1: 'Username not found',
                url: '/'
            });
        }
    });

});

//not login
app.get('/reset-password', function(request, response) {
    response.render('pass_reset.hbs');
});

//login
app.get('/change-password', function(request, response) {
    response.render('pass_change.hbs', {
        username: request.session.user.username
    });
});

app.get('/leaderboard', function(request, response) {
    response.render('leaderboard.hbs');
});

app.post('/reset', function(request, response) {
    var db = utils.getDB();

    var url = '/reset-password'

    var username = request.body.username;
    if (username == null) {
        username = request.session.user.username
        var url = '/change-password'
    }
    var email = request.body.email;

    var old_password = request.body.old_password;


    var new_password = request.body.new_password
    var password_confirm = request.body.password_confirm;
    if (new_password != password_confirm) {
        response.render('simple_response.hbs', {
            h1: 'Password does not match',
            url: url
        })
    }

    db.collection('info').updateOne({
        "username": username
    }, { $set: { "info": new_password } })

    var password = bcrypt.hashSync(new_password, saltrounds)


    db.collection('users').find({
        username: username,
    }).toArray(function(err, result) {
        if (result[0] != null) {
            if (!request.session.user) {
                old_password = result[0].password
                if (result[0].email == email) {
                    db.collection('users').updateOne({
                        "username": username

                    }, { $set: { "password": password } }, function(error, result) {
                        response.redirect('/')
                    })
                } else {
                    response.render('simple_response.hbs', {
                        h1: 'Incorrect Email',
                        url: url
                    })
                }
            } else {
                if (bcrypt.compareSync(old_password, result[0].password)) {
                    db.collection('users').updateOne({
                        "username": username

                    }, { $set: { "password": password } }, function(error, result) {
                        response.redirect('/profile')
                    })
                } else {
                    response.render('simple_response.hbs', {
                        h1: 'Incorrect Password',
                        url: url
                    });
                }
            }
        } else {
            response.render('simple_response.hbs', {
                h1: 'Username not found',
                url: url
            });
        }
    });
});





// Game 2 - Card Game

var deck = 0;
var card = 0;
var card2 = 0;
var cardback = "https://previews.123rf.com/images/bobyramone/bobyramone1206/bobyramone120600016/14167526-playing-card-back-side-30x60-mm.jpg"
var score = 0;
var current_username = undefined

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('breaklines', function(text) {
    text = hbs.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new hbs.SafeString(text);
});



app.get('/game1', async function(request, response) {
    deck = await backend.getDeck(1);

    var db = utils.getDB();

    db.collection('users').find({
        username: request.session.user.username
    }).toArray(function(err, result) {
        renderGame(request, response, "disabled", cardback, cardback, deck.remaining, "")

    })
});

app.post('/newgame', async (request, response) => {
    score = 0;
    try {
        deck = await backend.shuffleDeck(deck.deck_id);
        card = await backend.drawDeck(deck.deck_id, 1);
        card2 = await backend.drawDeck(deck.deck_id, 1);
        renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, "")
    } catch (e) {
        console.log(e)
    }
});

app.post('/bigger', async (request, response) => {
    try {
        if (getNumeric(card.cards[0].value) < getNumeric(card2.cards[0].value)) {
            score += 5;
            card = card2;
            if (card2.remaining > 0) {
                card2 = await backend.drawDeck(deck.deck_id, 1);
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, "")
            } else {
                var win_message = `Congratulations, you have finished the deck with ${score} point`;
                if (current_username !== undefined) {
                    await backend.saveHighScore(current_username.username, score)
                }
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, win_message)
            }
        } else {
            var lose_message = `Sorry, you have lost with ${score}`;
            if (current_username !== undefined) {
                await backend.saveHighScore(current_username.username, score);
                lose_message = `New Personal High Score ${score}`
            }
            renderGame(request, response, "disabled", card.cards[0].image, card2.cards[0].image, card.remaining,
                lose_message)
            // score = 0;
        }
    } catch (e) {
        console.log(e)
    }
});

app.post('/tie', async (request, response) => {
    try {
        if (getNumeric(card.cards[0].value) === getNumeric(card2.cards[0].value)) {
            score += 15;
            card = card2;
            if (card2.remaining > 0) {
                card2 = await backend.drawDeck(deck.deck_id, 1);
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, "")
            } else {
                var win_message = `Congratulations, you have finished the deck with ${score} point`;
                if (current_username !== undefined) {
                    await backend.saveHighScore(current_username.username, score)
                }
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, win_message)
            }
        } else {
            var lose_message = `Sorry, you have lost with ${score}`;
            if (current_username !== undefined) {
                await backend.saveHighScore(current_username.username, score);
                lose_message = `New Personal High Score ${score}`
            }
            renderGame(request, response, "disabled", card.cards[0].image, card2.cards[0].image, card.remaining,
                lose_message);
            // score = 0;
        }
    } catch (e) {
        console.log(e)
    }
});

app.post('/smaller', async (request, response) => {
    try {
        if (getNumeric(card.cards[0].value) > getNumeric(card2.cards[0].value)) {
            score += 5;
            card = card2;
            if (card2.remaining > 0) {
                card2 = await backend.drawDeck(deck.deck_id, 1);
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, "")
            } else {
                var win_message = `Congratulations, you have finished the deck with ${score} point`;
                if (current_username !== undefined) {
                    await backend.saveHighScore(current_username.username, score)
                }
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, win_message)
            }
        } else {
            var lose_message = `Sorry, you have lost with ${score}`;
            if (current_username !== undefined) {
                await backend.saveHighScore(current_username.username, score);
                lose_message = `New Personal High Score ${score}`
            }
            renderGame(request, response, "disabled", card.cards[0].image, card2.cards[0].image, card.remaining,
                lose_message)
            // score = 0;
        }
    } catch (e) {
        console.log(e)
    }
});

app.get(`/deck`, async (request, response) => {
    try {
        deck = await backend.getDeck(1);
        renderGame(request, response, "disabled", cardback, cardback, deck.remaining, "")
    } catch (e) {
        console.log(e)
    }
});

function getNumeric(card) {
    var trimmed = card.trim()
    if (trimmed === "KING") {
        return 13
    } else if (trimmed === "QUEEN") {
        return 12
    } else if (trimmed === "JACK") {
        return 11
    } else if (trimmed === "ACE") {
        return 1
    } else {
        return parseInt(trimmed)
    }
}

app.get('/save-score', function(request, response) {
    var db = utils.getDB();


    db.collection('users').find({
        username: request.session.user.username
    }).toArray(function(err, result) {
        if (score > result[0].score1) {
            var scoreT = score + result[0].score

            db.collection('users').updateOne({
                "username": request.session.user.username

            }, { $set: { "scoreT": scoreT, "score1": score } }, function(error, result) {
                response.redirect(`/profile`)
            })
        } else {
            response.redirect(`/profile`)
        }
    });
})

function renderGame(request, response, state, first_card, second_card, remaining, game_state) {
    if (current_username !== undefined) {
        var name = current_username.username
    }
    response.render('game1.hbs', {
        title: 'Big or Small | Play Game',
        card: first_card,
        card2: second_card,
        bigger: state,
        smaller: state,
        tie: state,
        score: score,
        remaining: remaining,
        username: request.session.user.username,
        game_state: game_state
    });
}

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
    utils.init();
});

module.exports = {
    getNumeric,
}