const fs = require('fs');
const request = require('request');
const _ = require('lodash');
var deckCode = 0;
var accounts = {users:{},
                high_scores:{}};

const file = 'test_users.json';



function saveHighScore(username, score){

    try{
        if(username === undefined){
            return "Sorry, Guests cannot be part of the rankings"
        }
        var readUser = fs.readFileSync(file);
        accounts = JSON.parse(readUser);

        if(score > accounts['high_scores'][username] || accounts['high_scores'][username] === undefined){
            accounts['high_scores'][username] = score;
            writeToJSON()
            return `Congratulations, you have a new high score: ${score} points`
        }else{
            return ""
        }
    }catch(e){
        console.log(`Error: ${e.message}`);
        console.log(`Creating Account File`);
    }
}

/*
    Retrieve an array of high scores from JSON file and
    sort them from highest to lowest using sortable.
 */
function getHighScores() {
    try{
        var readUser = fs.readFileSync(file);
        accounts = JSON.parse(readUser);
        var sortable = [];
        for (var user in accounts['high_scores']){
            sortable.push([user,accounts['high_scores'][user]])
        }
        sortable.sort(function (a, b) {
            return b[1] - a[1];
        });
        console.log(sortable);
        return sortable
    }catch(e){
        console.log(`Error: ${e.message}`);
    }
}

/*
	Validate Username and Password and return a value based on their validation.
	Temporarily placed for flexibility use
*/
function validateCredentials(username,password){
    return true;
    //return (validateAccountNum(username) && validatePassword(password));
}

/*
	Validate account username format,
	Temporary placement for flexibility use
*/
function validateAccountNum(username){
    return true;
}

/*
	Validates account password's length,
	Temporary placement for flexibility use
*/
function validatePassword(pass){
    return true;
}

function accountDelete(username) {
    return `Account ${username} Deleted`
}

function accountCreate(username) {
    return `Account ${username} Created`
}

function highScore(username){
    return 0
}

function currentScore(username){
    return 0
}


/*
    Get X counts of new decks from deckofcards api
 */
var getDeck = (count) =>{
    return new Promise((resolve, reject) => {
        request({
            url: `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${count}`,
            json: true
        }, (error, response, body) => {
            if(error){
                reject('Cannot connect to RestCountries API')
            }else if(body.status === '401'){
                reject('Unauthorized Access to webpage')
            }else if(body.shuffled === '404'){
                reject('No API method supports the URL')
            }else if(body.error !== undefined){
                reject('Currency not supported')
            }else{
                deckCode = body.deck_id
                resolve(body)
            }
        });
    })
};


/*
    Draw X counts of cards from a deck using the deck id retrieved from deckofcards api
 */
var drawDeck = (deck_id, count) =>{
    return new Promise((resolve, reject) => {
        request({
            url: `https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${count}`,
            json: true
        }, (error, response, body) => {
            if(error){
                reject('Cannot connect to RestCountries API')
            }else if(body.status === '401'){
                reject('Unauthorized Access to webpage')
            }else if(body.shuffled === '404'){
                reject('No API method supports the URL')
            }else if(body.error !== undefined){
                reject('Currency not supported')
            }else{
                resolve(body)
            }
        });
    })
};

module.exports = {
    drawDeck,
    getDeck,
    saveHighScore,
    getHighScores,
    accountCreate,
    accountDelete,
    highScore,
    currentScore
};