"use strict";
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser')
var url = 'mongodb://localhost:27017/test';
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var fileName = './pdata.json';
var app = express();


app.set('port', process.env.PORT || 3210);
app.set('host', process.env.HOST || '127.0.0.1');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static('./public'));

app.get('/portfolio', (req, res) => {
  fs.readFile('pdata.json','utf8', (err, data) => {
    if(err) throw err;
    console.log(JSON.parse(data));
    res.send(JSON.parse(data));
  });
});

app.put('/connected', (req, res) => {
  let file = require(fileName);
  console.log(file.pageViews);
  file.pageViews += 1;
  console.log(file.pageViews);
  fs.writeFile(fileName, JSON.stringify(file), (err) => {
    if(err) return console.log(err);
    console.log('connected');
  });
  res.send('client connected');
});

app.put('/segmentViews/:title', (req, res) => {
  let file = require(fileName);
  for(let i = 0; i<file.projects.length;i++){
    if(file.projects[i].title == req.params.title){
      file.projects[i].views += 1;
      console.log(file.projects[i].views);
      fs.writeFile(fileName, JSON.stringify(file), (err) => {
        if(err) return console.log(err);
      });
      i = file.projects.length;
    }
  }
  res.send('increased views');
});


// ANON FACEBOOK TEMPORARY API endpoints
app.put('/createPost', (req,res) => {
  var time = new Date();
  MongoClient.connect(url, (err, db) => {
    if (err) {return console.dir(err);}
    console.log(req);
    var collection = db.collection('test');
    var postobject = {'text':req.body.text,'time':time.getTime()}
    collection.insert(postobject);
    res.send(postobject);
  });
});

app.get('/posts', (req,res)=> {
  MongoClient.connect(url, (err,db) => {
    if(err) {return console.dir(err);}
    var collection = db.collection('test');
    let currentTime = new Date;
    let diff = currentTime.getTime() - 86400000;
    collection.find({time:{$gte:diff}}).toArray( (err,docs)=>{
      // docs = docs.sort(function(a,b){
      //   // Turn your strings into dates, and then subtract them
      //   // to get a value that is either negative, positive, or zero.
      // return new Date(b.time) - new Date(a.time);
      // });
      res.send({'posts':docs});
    });
  });
});

var cleanDatabase = () => {
  MongoClient.connect(url, (err, db) => {
    if(err) {return console.dir(err);}
    var collection = db.collection('test');
    collection.find({}).toArray( (err, docs) => {
      console.log(docs);
    });
  });
}


app.listen(app.get('port'), app.get('host'), () => {
  console.log('express listening on port ' + app.get('port'));
});
