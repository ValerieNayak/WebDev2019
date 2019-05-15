#!/usr/bin/nodejs

// OAUTH REGISTRATION:   ion.tjhsst.edu/oauth/applications


// -------------- load packages -------------- //
var express = require('express')
var simpleoauth2 = require("simple-oauth2");
var request = require('request');
var app = express();
var fs = require('fs');
var mysql = require('mysql');

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

var pool  = mysql.createPool({
  connectionLimit : 10,
  user            : 'site_2020vnayak',
  password        : 'nUTHruG8TgvQ4SFuRfPgybmf',
  host            : 'mysql1.csl.tjhsst.edu',
  port            : 3306,
  database        : 'site_2020vnayak'
});

// -------------- express 'get' endpoints -------------- //
app.get('/bakery', function (req, res) {

    // if the user has not logged in, we'll send them to a page asking them to log in
    // -----------REPLACE WITH HANDLEBARS-----------
    
    console.log('req.session.token', req.session.token);
    
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
           req.session.user_name = user_name; 
            
            pool.query('CALL add_user(?)', user_name, function (error, results, fields) {
              if (error) throw error;
              console.log('added user to sql table:', user_name)
              
              var person_info = {
                   my_name: user_name,
                   money: 0,
                   pantry: 0
               };
               
               pool.query('SELECT cash, food FROM shops WHERE tj_id = ?', user_name, function(error, results, fields){
                   person_info['money'] = results[0].cash;
                   person_info['pantry'] = results[0].food;
                   console.log('cash', results[0].cash);
                   console.log('pantry', results[0].food);
                   
                   console.log('person_info', person_info);
                   res.render('bakery', person_info);
               })
            });
           
        });
    }
});

app.get('/reset_token', function(req, res){
    req.session.token = undefined;
    res.send('cookie has been reset');
});

// this is called by AJAX
app.get('/manage_store', function(req, res){
    console.log('reached app.get');
    var button_type = req.query.b_type;
    if(button_type=='0') {
        pool.query('CALL buy_sell_item(?,?)', [req.session.user_name, 0], function(error, results, fields){
            pool.query('SELECT cash, food FROM shops WHERE tj_id = ?', [req.session.user_name], function(error2, results2, fields2){
                var person_info = {
                   my_name: req.session.user_name,
                   money: 0,
                   pantry: 0
               };
                person_info['money'] = results2[0].cash;
                person_info['pantry'] = results2[0].food;
                console.log('cash', person_info['money']);
                console.log('pantry', person_info['pantry']);
                res.send(person_info);
            });        
        });
    }
    else {
        pool.query('CALL buy_sell_item(?,?)', [req.session.user_name, 1], function(error, results, fields){
            pool.query('SELECT cash, food FROM shops WHERE tj_id = ?', [req.session.user_name], function(error2, results2, fields2){
                var person_info = {
                   my_name: req.session.user_name,
                   money: 0,
                   pantry: 0
               };
                person_info['money'] = results2[0].cash;
                person_info['pantry'] = results2[0].food;
                console.log('cash', person_info['money']);
                console.log('pantry', person_info['pantry']);
                res.send(person_info);
            });        
        });
    }
})

// -------------- intermediary login helper -------------- //

app.get('/login_worker', async function (req, res) {   // <<== async, see line 112

    // Step one. Assuming we were send here following an authentication and that there is a code attached.
    if (typeof req.query.code != 'undefined') {

        // This code was generated by ION. We need it to...
        var theCode = req.query.code 

        // .. construct options that will be used to generate a login token
        var options = {
            code: theCode,
            redirect_uri: ion_redirect_uri,
            scope: 'read'
         };
        var result = await oauth2.authorizationCode.getToken(options);

        // The above result will now be converted to an AccessToken
        var token = oauth2.accessToken.create(result);
        req.session.token = token;

        res.redirect('https://user.tjhsst.edu/2020vnayak/bakery');
    } else {
        res.send('no code attached')
    }
});

// -------------- express listener -------------- //
var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});
