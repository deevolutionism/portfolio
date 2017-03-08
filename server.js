"use strict";
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser')
var cors = require('cors')
var url = 'mongodb://localhost:27017/';
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var fileName = './pdata.json';
var app = express();


app.set('port', process.env.PORT || 3210);
app.set('host', process.env.HOST || '127.0.0.1');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors()) // allow cross-origin-access-controll headers http://stackoverflow.com/questions/7067966/how-to-allow-cors
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
app.put('/api/createPost', (req,res) => {
  //This submits a new post to the database.
  var time = new Date();
  MongoClient.connect(url+'test', (err, db) => {
    if (err) {return console.dir(err);}
    console.log(req);
    var collection = db.collection('test');
    var postobject = {'text':req.body.text,'time':time.getTime()}
    collection.insert(postobject);
    res.send(postobject);
  });
});

app.put('/api/createPost/:board', (req,res) => {
  //This submits a new post to the database.
  var time = new Date();
  MongoClient.connect(`${url}${req.params.board}`, (err, db) => {
    if (err) {return console.dir(err);}
    console.log(req);
    var collection = db.collection(req.params.board);
    var postobject = {'text':req.body.text,'time':time.getTime()}
    collection.insert(postobject);
    res.send(postobject);
  });
});

app.put('/api/submitComment', (req, res) => {
  //this submits a new comment to the database.
	var time = new Date();
	MongoClient.connect(`${url}test`, (err, db) => {
		if(err) { return console.dir(err) }
		var collection = db.collection('test');
		collection.update(
			{"_id":ObjectId(req.body._id)},
			{$push:{comments:req.body.comment}}
		) 
	});
});

app.get('/api/posts', (req,res)=> {
  //this retrieves posts from the database.
  MongoClient.connect(`${url}test`, (err,db) => {
    if(err) {return console.dir(err)}
    var collection = db.collection('test');
    let currentTime = new Date;
    let diff = currentTime.getTime() - 86400000;
    collection.find({time:{$gte:diff}}).toArray( (err,docs) => {
      // docs = docs.sort(function(a,b){
      //   // Turn your strings into dates, and then subtract them
      //   // to get a value that is either negative, positive, or zero.
      // return new Date(b.time) - new Date(a.time);
      // });
      res.send({'posts':docs});
    });
  });
});

app.get('/api/b/:board', (req, res) => {
	MongoClient.connect(`${url}${req.params.board}`, (err,db) => {
		if(err) {return console.dir(err)}
		var collection = db.collection(req.params.board)
		collection.find({}).toArray( (err,docs) => {
			res.send({'posts':docs})
		})
	})
})

app.get('/api/announcements', (req,res) => {
  //this returns data for the announcements component to render.
  fs.readFile('announcements.json','utf8', (err, data) => {
    if(err) throw err;
    console.log(JSON.parse(data));
    res.send(JSON.parse(data));
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
