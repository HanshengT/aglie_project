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
const atoken = "ya29.GlvmBrkOyJpvGJMrHC3qHNRkWTniML2DgCTQ26yjbnrkQyCr2R6P5-l6XYPg9nkvkM3Kl4XXYd4iMEDCC-XoFEELZhyTTI83Bh9qyQv3uN0TIcf53jLddDqsmXsD";
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
    console.log(request.params.username);
    response.render('register_succeed.hbs', {
        title: 'Succeed',
        username: request.params.username
    });
});

app.get('/profile', function(request, response) {
    var db = utils.getDB();

    db.collection('users').find({
        username: request.session.user.username
    }).toArray(function(err, result) {
        response.render('profile.hbs', {
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
            username: request.session.user.username,
            title: 'Roulette',
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
        var scoreT = score + request.session.user.score1
        console.log(score);
        console.log(scoreT);
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
    var token = "";
    var tokenExpires = "";
    var create = 1;

    if (password != password_confirm) {
        response.render('simple_response.hbs', {
            h1: 'Passwords must match'
        });
        create = 0;
    };

    db.collection('users').find({
        email: email
    }).toArray(function(err, result) {
        if (result[0] != null) {
            response.render('simple_response.hbs', {
                h1: 'Email already in use'
            })
            create = 0;
        };
    });

    password = bcrypt.hashSync(password, saltrounds);

    db.collection('users').find({
        username: username
    }).toArray(function(err, result) {
        if (result[0] == null && create == 1) {
            db.collection('users').insertOne({
                username: username,
                password: password,
                email: email,
                token: token,
                tokenExpire: tokenExpires,
                scoreT: 0,
                score: 0,
                score1: 0,
                score2: 0
            }, (err, result) => {
                if (err) {
                    response.render('simple_response.hbs', {
                        h1: 'Unable to add user'
                    });
                }
                response.redirect(`/succeed/${username}`);
            });
        } else {
            response.render('simple_response.hbs', {
                h1: 'Username not available'
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
                    token: result[0].token,
                    tokenExpire: result[0].tokenExpire,
                    scoreT: result[0].scoreT,
                    score: result[0].score,
                    score1: result[0].score1
                };
                response.redirect('/profile');
            } else {
                response.render('simple_response.hbs', {
                    h1: 'Incorrect Password'
                });
            }
        } else {
            response.render('simple_response.hbs', {
                h1: 'Username not found'
            });
        }
    });

});

app.get('/reset-password', function(request, response) {
    response.render('pass_reset.hbs');
});

app.post('/reset', function(request, response) {
    var db = utils.getDB();

    var email = request.body.email;
    var token;


    db.collection('users').find({
        email: email
    }).toArray(function(err, result) {

        if (!result[0]) {
            response.render('simple_response.hbs', {
                h1: 'No account with specified email'
            });
        } else {

            request.session.user = {
                username: result[0].username,
                email: result[0].email,
                id: result[0]._id,
                token: result[0].token,
                tokenExpire: result[0].tokenExpire,
                score: result[0].score,
            };

            crypto.randomBytes(15, function(err, buf) {
                token = buf.toString('hex');

                db.collection('users').updateOne({ email: email }, {
                    $set: {
                        token: token,
                        tokenExpire: Date.now() + 3600
                    }
                })

                request.session.user.token = token
                request.session.user.tokenExpire = Date.now() + 3600
                request.session.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                })
            });

            var auth = {
                type: 'oauth2',
                user: 'roulettegame.node@gmail.com',
                clientId: process.env.client_id,
                clientSecret: process.env.client_secret,
                refreshToken: process.env.refresh_token,
                accessToken: atoken
            };

            db.collection('users').find({
                email: email
            }).toArray(function(err, result) {
                var mailOptions = {
                    to: result[0].email,
                    from: 'roulettegame.node@gmail.com',
                    subject: 'Password Reset',
                    text: 'The account linked to this email has requested a password reset. Click the following link and enter a new password. \n' + 'localhost:8080' +
                        '/reset/' + request.session.user.token,
                    auth: {
                        user: 'roulettegame.node@gmail.com',
                        refreshToken: process.env.refresh_token,
                        accessToken: atoken
                    }
                };

                console.log(request.session.user.token);

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: auth
                });

                transporter.sendMail(mailOptions, (err, response) => {
                    if (err) {
                        console.log(err);
                    }
                });

                if (err) {
                    console.log(err);
                } else {
                    response.render('simple_response.hbs', {
                        h1: 'An email has been sent'
                    });
                }
            });

        }
    });

});

app.get('/reset/:token', function(request, response) {
    var db = utils.getDB();

    db.collection('users').find({
        token: request.params.token
    }).toArray(function(err, result) {
        if (result[0] == null) {
            response.render('simple_response.hbs', {
                h1: 'Invalid Token'
            });
        } else {
            response.render('reset.hbs', {
                username: result[0].username
            });
        }
    });
});

app.post('/reset/:token', function(request, response) {
    var db = utils.getDB();

    var password = request.body.password;
    password = bcrypt.hashSync(password, saltrounds);
    var token = request.params.token;

    db.collection('users').find({
        token: token
    }).toArray(function(err, result) {
        if (result[0] != null) {
            db.collection('users').updateOne({ token: token }, {
                $set: {
                    password: password
                }
            });
            response.render('reset_result.hbs', {
                h1: 'Password Reset',
                message: 'Your password has been succesfully reset.'
            });
        } else {
            response.render('reset_result.hbs', {
                h1: 'Invalid Token',
                message: 'You have provided an invalid token. No changes have been made.'
            });
        }
    });
});

// Game 2 - Card Game

var deck = 0;
var card = 0;
var card2 = 0;
var cardback = "https://playingcardstop1000.com/wp-content/uploads/2018/11/Back-Russian-historical-cards-200x300.jpg"
var score = 0;
var current_username = undefined

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('breaklines', function (text) {
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

app.post('/newgame', async (request,response) => {
    score = 0;
    try {
        deck = await backend.shuffleDeck(deck.deck_id);
        card = await backend.drawDeck(deck.deck_id, 1);
        card2 = await backend.drawDeck(deck.deck_id, 1);
        renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, "")
    }catch(e){
        console.log(e)
    }
});

app.post('/bigger', async (request,response) => {
    try {
        if(getNumeric(card.cards[0].value) < getNumeric(card2.cards[0].value)){
            score+=1;
            card = card2;
            if(card2.remaining > 0) {
                card2 = await backend.drawDeck(deck.deck_id, 1);
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining,"")
            }else {
                var win_message = `Congratulations, you have finished the deck with ${score} point`;
                if(current_username !== undefined){
                    await backend.saveHighScore(current_username.username, score)
                }
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, win_message)
            }
        }else{
            var lose_message = `Sorry, you have lost with ${score}`;
            if(current_username !== undefined){
                await backend.saveHighScore(current_username.username, score);
                lose_message = `New Personal High Score ${score}`
            }
            renderGame(request, response, "disabled", card.cards[0].image, card2.cards[0].image, card.remaining,
                lose_message)
            score = 0;
        }
    }catch(e){
        console.log(e)
    }
});

app.post('/tie', async (request,response) => {
    try {
        if (getNumeric(card.cards[0].value) === getNumeric(card2.cards[0].value)) {
            score += 4;
            card = card2;
            if(card2.remaining > 0) {
                card2 = await backend.drawDeck(deck.deck_id, 1);
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining,"")
            }else{
                var win_message = `Congratulations, you have finished the deck with ${score} point`;
                if(current_username !== undefined){
                    await backend.saveHighScore(current_username.username, score)
                }
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, win_message)
            }
        } else {
            var lose_message = `Sorry, you have lost with ${score}`;
            if(current_username !== undefined){
                await backend.saveHighScore(current_username.username, score);
                lose_message = `New Personal High Score ${score}`
            }
            renderGame(request, response, "disabled", card.cards[0].image, card2.cards[0].image, card.remaining,
                       lose_message);
            score = 0;
        }
    }catch(e){
        console.log(e)
    }
});

app.post('/smaller', async (request,response) => {
    try {
        if (getNumeric(card.cards[0].value) > getNumeric(card2.cards[0].value)) {
            score += 1;
            card = card2;
            if(card2.remaining > 0) {
                card2 = await backend.drawDeck(deck.deck_id, 1);
                renderGame(request, response, "", card.cards[0].image, cardback, card.remaining,"")
            }else{
                var win_message = `Congratulations, you have finished the deck with ${score} point`;
                if(current_username !== undefined){
                    await backend.saveHighScore(current_username.username, score)
                }renderGame(request, response, "", card.cards[0].image, cardback, card.remaining, win_message)
            }
        } else {
            var lose_message = `Sorry, you have lost with ${score}`;
            if(current_username !== undefined){
                await backend.saveHighScore(current_username.username, score);
                lose_message = `New Personal High Score ${score}`
            }
            renderGame(request, response, "disabled", card.cards[0].image, card2.cards[0].image, card.remaining,
                lose_message)
            score = 0;
        }
    }catch (e) {
        console.log(e)
    }
});

app.get(`/deck`, async (request, response) => {
    try {
        deck = await backend.getDeck(1);
        renderGame(request, response, "disabled", cardback, cardback, deck.remaining, "")
    }catch(e){
        console.log(e)
    }
});

function getNumeric(card){
    var trimmed = card.trim()
    if(trimmed === "KING"){
        return 13
    }else if(trimmed === "QUEEN"){
        return 12
    }else if(trimmed === "JACK"){
        return 11
    }else if(trimmed === "ACE"){
        return 1
    }else{
        return parseInt(trimmed)
    }
}

function renderGame(request, response, state, first_card, second_card, remaining, game_state){
    if(current_username !== undefined){
        var name = current_username.username
    }
    response.render('game1.hbs', {
        title: 'Big or Small | Play Game',
        card: first_card,
        card2: second_card,
        bigger:state,
        smaller:state,
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