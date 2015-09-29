var express = require("express");
var morgan = require("morgan");
var cookieSession = require("cookie-session"); //Le middleware de session est à installer
var bodyParser = require('body-parser');

var app = express();

// create application/json parser 
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser 
var urlencodedParser = bodyParser.urlencoded({ extended: false })

/*
	- Middleware
*/
app.use(morgan('combined'))
.use(cookieSession({ //Initialisation du middleware de session
  secret: 'keyboard cat',
  /*'resave' est à false car il se peut que cela entraine des conflits du multipe session. Dans le futur cela 
  sera supprimé*/

  name: "session"
}))
/*
	- Middleware initialisation de session
*/
.use(function(req, res, next) {

	//On liste les tâche présente dans la session de l'utilisateur
	var sessionUser = req.session;

	if(typeof sessionUser.tasks == "undefined"){
		sessionUser.tasks = [];
	}

	next();
})
/*
	- URL
*/
.get('/', function(req, res) {
	res.setHeader('Content-Type', 'text/html');

	//On liste les tâche présente dans la session de l'utilisateur
	var sessionUser = req.session;
	var tasks = [];

	tasks = sessionUser.tasks;

	res.render('index.ejs', {tasks: tasks});	
})
.post('/task/new/', urlencodedParser, function(req, res) {
	res.setHeader('Content-Type', 'text/html');


	//On récupère les paramêtres du formulaire envoyés en get
	var task = req.body.task;
	var sessionUser = req.session;

	console.log(task);

	sessionUser.tasks.push(task);

	res.render('index.ejs', {tasks: sessionUser.tasks});
})
.get('/task/:id/edit/', function (req, res) {
	res.setHeader('Content-Type', 'text/html');

	var sessionUser = req.session; //On récupère la session de l'utilisateur
	var tasks = sessionUser.tasks; //Récupération des tâche de l'utilisateur
	var task = ""; //Tâche à éditer

	//On vérifie si le numéro id de la tâche existe
	if(sessionUser.tasks[req.params.id]){
		//Si c'est le cas on le supprime
		task = sessionUser.tasks[req.params.id];
	}


	res.render('edit.ejs', {tasks: tasks, task: task});	
})
.post('/task/:id/update/', urlencodedParser, function (req, res) {
	res.setHeader('Content-Type', 'text/html');

	var sessionUser = req.session; //On récupère la session de l'utilisateur
	var tasks = sessionUser.tasks; //Récupération des tâche de l'utilisateur
	var task = req.body.task;

	// On vérifie si le numéro id récupérer dans l'URL lors de l'envoie correspond à une des tâche présente dans la 
	// session de l'utilisateur 
	if(sessionUser.tasks[req.params.id]){
		//Si c'est le cas on va remplacer la tâche dans le tableau
		sessionUser.tasks[req.params.id] = task;
	}

	//On redirige vers l'accueil une fois la modification réaliser
	res.redirect('/');	
})
.get('/task/:numero/delete', function(req, res) {
	res.setHeader('Content-Type', 'text/html');

	var sessionUser = req.session;
	var tasks = [];

	//On vérifie si le numéro id de la tâche existe
	if(sessionUser.tasks[req.params.numero]){
		//Si c'est le cas on le supprime
		sessionUser.tasks.splice(req.params.numero, 1);
		tasks = sessionUser.tasks;
	}

	res.render('index.ejs', {tasks: tasks});	
})
.use(function (req, res, next) {
	/*res.sendStatus(404).body("Page non trouvé <a href="\/">index</a>.");*/
	 /*res.end('Page non trouvée vous allez être redirigé vers l\'index.');*/

 	res.redirect('/');
});

app.listen(8080);