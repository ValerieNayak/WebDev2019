#!/usr/bin/nodejs

// OAUTH REGISTRATION:   ion.tjhsst.edu/oauth/applications


// -------------- load packages -------------- //
var express = require('express')
var simpleoauth2 = require("simple-oauth2");
var request = require('request');
var app = express();
var fs = require('fs');

var cookieSession = require('cookie-session');

// tell express that the view engine is hbs
app.set('view engine', 'hbs');


// -------------- express initialization -------------- //

// Here, we set the port (these settings are specific to our site)
app.set('port', process.env.PORT || 8080 );


//COOKIES CODE 
// -------------- cookie configuration -------------- //
 
app.use(cookieSession({
  name: 'val_cookie',                         // ==> the name of the cookie is val_cookie      
  keys: ['enc_key_hello', 'enkey2_hi']   // ==> these two keys encrypt the cookie 
}))

// -------------- variable initialization -------------- //

// These are parameters provided by the authenticating server when
// we register our OAUTH client. 
//
//  YOU DON'T JUST MAKE THESE UP, THEY WERE PROVIDED AS PART OF CONFIGURATION AT:
//     https://ion.tjhsst.edu/oauth/applications/
//
//  n.b.
// -- The client ID is going to be public
// -- The client secret is super top secret. KEEP IT SECRET
// -- The redirect uri should be some intermediary 'get' request that 
//     you write in which you assign the token to the session. 

var ion_client_id = 'fOc3DGwmdN7wPtfNPq7ZFJBIqWbOawh5M4xMLFFo';
var ion_client_secret = '42D44rp1pcfs6pBnTvQ9z3kjzAR4FWgZKJ1AC2L3iGGPeGkNiL8u4LIV2USYpdIjojWbCHRuKGBwphkISJzPUf7fY6okqe5Jdc4VTJKDFlnHVs7RL4cqdTV6kmCRuYor';
var ion_redirect_uri = 'https://user.tjhsst.edu/2020vnayak/login_worker';    //    <<== you choose this one


// Here we create an oauth2 variable that we will use to manage out OAUTH operations
// DO NOT MODIFY THIS OBJECT. IT IS CONFIGURED FOR TJ
var oauth2 = simpleoauth2.create({
  client: {
    id: ion_client_id,
    secret: ion_client_secret,
  },
  auth: {
    tokenHost: 'https://ion.tjhsst.edu/oauth/',
    authorizePath: 'https://ion.tjhsst.edu/oauth/authorize',
    tokenPath: 'https://ion.tjhsst.edu/oauth/token/'
  }
});

// This is the link that will be used later on for logging in. This URL takes
// you to the ION server and asks if you are willing to give read permission to ION.

var authorizationUri = oauth2.authorizationCode.authorizeURL({
    scope: "read",
    redirect_uri: ion_redirect_uri
});


// LOOK AT THIS THING IN THE CONSOLE. IT IS JUST A LINK
console.log('authorizationUri: ')
console.log(authorizationUri)


// -------------- express 'get' endpoints -------------- //
app.get('/scrabble', function (req, res) {

    // if the user has not logged in, we'll send them to a page asking them to log in
    // -----------REPLACE WITH HANDLEBARS-----------
    
    console.log('token type', typeof(req.session.token));
    if(typeof(req.session.token) == 'undefined') {   //user hasn't logged in yet
        res.render('oauth_unauthenticated', {my_uri: authorizationUri})    
    }
    else {
        //user HAS logged in
        //res.send('this has been redirected');
        
        var access_token = req.session.token.token.access_token;
        var my_ion_request = 'https://ion.tjhsst.edu/api/profile?format=json&access_token='+access_token;
        
        //asynchronous request 
        request.get({url:my_ion_request}, function(e, r, body) {
           //request from ION was a JSON string, turn in back into JS object
           var res_object = JSON.parse(body);
           console.log(res_object);
           var user_name = res_object['short_name'];
           var person_info = {my_name: user_name};
           
           res.render('scrabble_interface', person_info);
        });
    }
});

app.get('/reset_token', function(req, res){
    req.session.token = undefined;
    res.send('cookie has been reset');
});

//middleware
var letters = [];
var letters_str;
var possible_words = [];

var text = fs.readFileSync("./scrabble_dict.txt").toString('utf-8');
var word_dictionary = text.split("\r\n")

function splitLetters(req, res, next) {
    console.log('splitLetters');
    letters_str = req.query.my_letters.toUpperCase();
    console.log('letters_str', letters_str);
    letters = letters_str.split("");
    //console.log('letters', letters);
    letters = letters.sort();
    letters_str = letters.join("");
    console.log('letters_str', letters_str);
    next();
}

function findWordsHelper(req, res, next) {
    console.log('findWordsHelper');
    //console.log('dictionary', word_dictionary);
    
    possible_words = word_dictionary.filter(wordsCallback);
    console.log('possible_words', possible_words);
    next();
}

function wordsCallback(curr, index, arr) {
    // sort string alphabetically 
        // convert input string to char array 
    var wordArr = curr.split(""); 
    wordArr = wordArr.sort();
    current_word = wordArr.join("");
    // console.log('letters_str', letters_str);
    // console.log('current_word', current_word);
    if(letters_str.indexOf(current_word) != -1) {
        return true;
    }
    
    // console.log('wordsCallback');
}

poss_words_dict = {}
function sort_possibles_len() {
    possible_words.forEach(add_to_dict);
}

function add_to_dict(elem) {
    len = elem.length;
    if(len in poss_words_dict === false) {
        poss_words_dict[len] = elem;
    }
    else {
        poss_words_dict[len] = poss_words_dict[len] + ', ' + elem;
    }
}

// this is called by AJAX
app.get('/handle_letters', [splitLetters, findWordsHelper], function(req, res){
    console.log('reached app.get');  
    // res.send(possible_words.join(', '));
    sort_possibles_len();
    res.send(JSON.stringify(poss_words_dict));
})


// -------------- intermediary login helper -------------- //

// The name '/login' here is not arbitrary!!! The location absolutely
// must match ion_redirect_uri for OAUTH to work!
//
//  HOWEVER - THE USER WILL NEVER ACTUALLY TYPE IN https://user.tjhsst.edu/pckosek/login_worker!!!!
//    This is a hidden endpoint used for authentication purposes. It is used as 
//    an intermediary worker that ultimately redirects authenticaed users

app.get('/login_worker', async function (req, res) {   // <<== async, see line 112

    // The whole purpose of this 'get' handler is to attach your  token to the session. 
    // Your users should not be going here if they are not trying to login in - and you
    // should not be attaching your login token in any other methods (like the default landing page)

    // Step one. Assuming we were send here following an authentication and that there is a code attached.
    if (typeof req.query.code != 'undefined') {
        
        // OK - we were given a code which likely means we're here via redirect.
        // The goal here is to transform the redirect (with a code) into an
        // authentication token that we can attach to the session.

        // This code was generated by ION. We need it to...
        var theCode = req.query.code 

        // .. construct options that will be used to generate a login token
        var options = {
            code: theCode,
            redirect_uri: ion_redirect_uri,
            scope: 'read'
         };

        // This code will be passed back to ion to request a token.
        // The authorization request is an asyncronous function call.
        //   This would really muck our workflow up - but we can serialize the call by 
        //   placing the <<await>> instruction before the function call, BUT in order to
        //   use <<await>> we have to putrequires the command to be placed in an
        //   asyncronous function (the async from line 89)
        var result = await oauth2.authorizationCode.getToken(options);

        // The above result will now be converted to an AccessToken
        var token = oauth2.accessToken.create(result);
        req.session.token = token;
        
        // OK - this is patently bad, but useful for debugging.
        // This link will reveal the access token. In all fairness, the access token should be 
        // treated like a credit card and kep secret - BUT for ONE TIME ONLY, we are going to reveal
        // it so see how to construct get requests as an authenticated user.
        // var sample_link = 'https://ion.tjhsst.edu/api/profile?format=json&access_token='+token.token.access_token;

        res.redirect('https://user.tjhsst.edu/2020vnayak/scrabble');
    } else {
        res.send('no code attached')
    }
});

// -------------- express listener -------------- //
var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});
