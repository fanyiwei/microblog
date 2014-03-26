
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret:settings.cookieSecret,
	store:new MongoStore({
		db:settings.db
	})

}));
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/u/:user',routes.user);
app.post('/mAdd',routes.mAdd);
app.post('/delWB/:WB_id',routes.delWB);

app.get('/reg',routes.reg);
app.post('/reg',routes.doReg);
app.get('/login',routes.login);
app.post('/login',routes.doLogin);
app.get('/logout',routes.logout);

app.get('/explore',routes.explore);
app.post('/attention/:attentionUserEmail',routes.attention);
app.post('/disAttention/:attentionUserEmail',routes.disAttention);

app.post('/comment/add/:WB_id',routes.addComment);
app.get('/comment/get/:WB_id',routes.getComment);
app.post('/comment/del/:commentId',routes.delComment);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
