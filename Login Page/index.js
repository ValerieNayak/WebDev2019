#!/usr/bin/nodejs


// -------------- load packages -------------- //
var express = require('express');
var app = express();
var path = require('path');

var cookieSession = require('cookie-session');


// -------------- express initialization -------------- //
app.set('port', process.env.PORT || 8080 );

// tell express that the view engine is hbs
app.set('view engine', 'hbs');


// -------------- serve static folders -------------- //
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/css', express.static(path.join(__dirname, 'css')))
app.use('/img', express.static(path.join(__dirname, 'img')))


// -------------- middleware
color_votes = {
    'red': 0,
    'green': 0,
    'blue': 0
};

function votingHelper(req, res, next) {
    console.log('helper method');
    vote = req.query.my_vote;
    console.log('vote', vote);
    if(vote=='#ff0000') {
        color_votes['red']++;
    }
    else if(vote=='#80ff80'){
        color_votes['green']++;
    }
    else {
        color_votes['blue']++;
    }
    next();
}

// -------------- variable definition -------------- //
var visitorCount = 0; 

// -------------- express 'get' handlers -------------- //
app.get('/', function(req, res){
    //MAPS STUFF
    console.log('no sub-page');
    res.sendFile(__dirname + '/index.html');
});

// this is called by AJAX
app.get('/handle_voting', [votingHelper], function(req, res){
    console.log('reached app.get');  
    console.log('color_votes', color_votes);
    res.send(JSON.stringify(color_votes));
})

// app.get('/:page', function(req, res){
//     var landingPage = req.params.page
//     console.log('User requested page: '+landingPage)

//     res.sendFile(__dirname + '/index.html');
// });

//COOKIES CODE 
// -------------- cookie configuration -------------- //
 
app.use(cookieSession({
  name: 'val_cookie',                         // ==> the name of the cookie is val_cookie      
  keys: ['enc_key_hello', 'enkey2_hi']   // ==> these two keys encrypt the cookie 
}))
 
// -------------- express endpoints for cookies -------------- //

//req.session.logged_in = false;

app.get('/content', function (req, res) {

  // req.session is the cookie. It defaults to an object that you can add  
  //   key-value pairs to.  
  // 
  // req.session is 'silently' passed in as part of the request AND returned
  //   back to the browser. The data in req.session is stored in the browser 
  //   until the client makes another request.
  //
  // the contents of req.session are unique to each browser
  // 
  // req.session will live in the cookies of the browser with the name provided
  //   (in this example, "snorkles") until the user deletes the cookie.
  //
  // you can programmatically clear the cookie by setting the cookie to null:
  //   req.session = null;
 
  if( typeof(req.session.views)=='undefined' ) {            // if the cookie has not been set
      req.session.views = 1;                                //   set it to 1;
  } else {                                                  // otherwise, 
      req.session.views++;                                  //   increment its value
  }

  // res.send("Welcome, visitor #" + req.session.views );
  if(req.session.views<5 || req.session.logged_in===true) {
    //res.send('Views ' + req.session.views);
    console.log('views ', req.session.views);
    if(req.session.logged_in===false){
        res.render('cookies_premium_content', {my_name: 'log in to see your name', premium_content: 'my premium content goes here'});      
    }
    else{
        res.render('cookies_premium_content', {my_name: req.session.username, premium_content: 'my premium content goes here'});      
    }
  }
  else {
    var exceeded_limit_msg = "Sorry! You've exceeded your content limit. Log in to view more!"  
    res.render('cookies_premium_content', {premium_content: exceeded_limit_msg});
  }
})

app.get('/login', function(req, res) {
    var username = req.query.username;
    req.session.username = username;
    req.session.logged_in = true;
    res.send('Hello, ' + username + '. You are logged in!');
});

app.get('/logout', function(req, res) {
    req.session.logged_in = false;
    res.send('You are logged out. See you next time!')
})

app.get('/reset', function (req, res, next) {
  req.session = null;                                       // programmatically deletes the cookie
  res.send('cookie has been reset');
})

// -------------- listener -------------- //
// The listener is what keeps node 'alive.' 

var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});