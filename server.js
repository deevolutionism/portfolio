var express = require('express');
var request = require('request');
var fs = require('fs');
var fileName = './pdata.json';
var app = express();

app.set('port', process.env.PORT || 8080);
app.set('host', process.env.HOST || '127.0.0.1');


app.use(express.static('./public'));

app.get('/portfolio', (req, res) => {
  fs.readFile('pdata.json','utf8', (err, data) => {
    if(err) throw err;
    console.log(JSON.parse(data));
    res.send(JSON.parse(data));
  });
});

app.put('/connected', (req, res) => {
  var file = require(fileName);
  console.log(file.pageViews);
  file.pageViews += 1;
  console.log(file.pageViews);
  fs.writeFile(fileName, JSON.stringify(file), (err) => {
    if(err) return console.log(err);
    console.log(file);
  });
  res.send('client connected');
});


app.listen(app.get('port'), app.get('host'), () => {
  console.log('express listening on port ' + app.get('port'));
});
