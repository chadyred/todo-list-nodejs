var moment = require("moment");
var jade = require("jade");

//Les dates de l'application seront en français
moment.locale("fr");

var actions = {
	index : function(req, res, next) {

			  	res.setHeader('Content-Type', 'text/html');  


				//Test moment
			 	// console.log(moment(new Date("2015-10-1")).from());

				// Chargement du model task. Il suffit d'appelé le fichier qui chargera l'objet littéral avec "module.exprts = objet"
				//On les renge par ordre inverse (Z) Nb : A = Ordre normal
				req.models.task.all( function (err, tasks) {
					
					if (err) {
						return console.error("Chargement erreur task", err);
					}

					req.models.priorite.all(function(err, priorites) {

						// var taskForm = jade.renderFile(__dirname + '/../views/task/new.jade', {prioriteList: allPriorite});

						//Il est nécessaire de réaliser le rendu du template ici sans quoi on aura pas de valeur.prioriteList
						//Les fonction de callback sont exécuté antérieurement à la principal du rooter, ce qui 
						//fait que les données ne sont pas encore chargé?
						res.render('task/index.jade', { tasks: tasks, prioriteList: priorites, moment: moment });

				  	}); //end priority all
				});//end db load priorite
	}, //end of function
	new: function (req, res) {
			res.setHeader('Content-Type', 'text/html');

			//On récupère les paramêtres du formulaire envoyés en get
			var task = req.body.task;
			var degreeNumber = req.body.priorite; //On récupère la priorite
			var dateFin = req.body.dateFin; //La date est au format YYYY-MM-DD

			console.log("Ajout de " + task);

			// Chargement du model task. Il suffit d'appelé le fichier qui chargera l'objet littéral avec "module.exprts = objet"
			req.models.task.aggregate().max("id").get( function (err, max) {

				if(err) {
					console.error("Erreur sur le numéro d'ordre", err);

					return err;
				}

				req.models.task.create({ date_fin: dateFin, description: task, next_task_id: null,priorite_id: degreeNumber }, function(err, item) {
		            if (err) {
		            	throw err;
		            }
		            else if(max != null) {
		            	req.models.task.get(max, function(err, Task){

		            		console.log("Id du nouvel élément créé : " + item.id);
		            		Task.next_task_id = item.id;

		            		Task.save( function (err) {
							    	if(err) console.error("Erreur de mise à jour de la tâche", err);

							        console.log("saved!");
					    	});
		            	});
		            }
		        });	
		    });		

			res.redirect('/task/');
	},
	delete : function (req, res, next) {

		//On récupère l'identifiant de la tâche au sein de l'URL
		var idTache = req.params.id_tache;
		var previousTask = null;
		var nextTask = null;


		req.models.task.get(idTache, function (err, Task) {

			if(Task.next_task != null) {
				nextTask = Task.next_task;
			}

			Task.hasPreviousTask(function (err, previousExist) {

				if(previousExist) {

					Task.getPreviousTask(function (err, previousTask) {

						console.log("previousTask.id : " + previousTask);

						if (err) {
							console.error("Tâche précédente non trouvé", err);
							return err;
						}

						if(previousTask != null && nextTask != null){
							previousTask.next_task_id = nextTask.id;				
						}
						else if (previousTask != null && nextTask == null) {
							previousTask.next_task_id = null;
						}

						previousTask.save(function (err) {
							if (err) 
								return err;
							else
								console.log("Tâche précédente saved ! ");
						});
					});
				}
				else {
		    		console.log("Pas de tâche précédent la tâche !");
		    	}
			});


			Task.remove(function (err) {
			    // Does gone.. 
			    if (err) 
			    	console.error(err);
			    else
			    	console.log("Suppression réussit ! ");
			});

    	});

    	res.redirect('/task/');
	},
	edit : function (req, res) {
		res.setHeader('Content-Type', 'text/html');
		

		// Chargement du model task. Il suffit d'appelé le fichier qui chargera l'objet littéral avec "module.exprts = objet"
		req.models.task.all( function (err, tasks) {
			
			if (err) {
				return console.error("Chargement erreur task", err);
			}

			req.models.priorite.all(function(err, priorites) {

				if (err) {
					return console.error("Chargement erreur priorites", err);
				}

				req.models.task.get(req.params.id, function (err, task) {

					if (err) {
						return console.error("Chargement de la tâche erroné", err);
					}
					

					res.render('task/edit.jade', {tasks: tasks, task: task, prioriteList: priorites, moment: moment });

				});
			});
		});

	},
	update: function (req, res) {
		res.setHeader('Content-Type', 'text/html');

		var sessionUser = req.session; //On récupère la session de l'utilisateur

		var task = req.body.task; //Récupération de la valeur du champ ayant pour name = task
		var degreeNumber = req.body.priorite;//Récupération de la valeur du champ ayant pour name = priorite qui est la liste déroulant
		var dateFin = req.body.dateFin; //La date est au format YYYY-MM-DD
		
		//On récupère puis on modifie notre entité avant de la persister en BDD
		req.models.task.get(req.params.id, function (err, Task) {

				//S'il ne trouve pas un NOT FOUND sera affiché
				if(err) return console.error(err);

			    Task.description = task;
			    //priorite_id est le champs créé automatiquement
			    Task.priorite_id = degreeNumber;
			    Task.date_fin = dateFin;
			    Task.save(function (err) {
			    	if(err) console.error("Erreur de mise à jour de la tâche", err);
			        console.log("saved!");
		    });
		});

		//On redirige vers l'accueil une fois la modification réaliser
		res.redirect('/task/');	
	},
	plus : function (req, res) {

		var idTacheSuivante = null;
		var id = parseInt(req.params.id);

		//On vérifie si une tâche suis cette tâche (les tâche commence à 0)
		//On récupère puis on modifie notre entité avant de la persister en BDD
		req.models.task.get(id, function (err, Task) {

			if (err){
				 console.error('Plus error Task',err);
				 return err;
			}

			console.log("Tâche trouvé plus ! ");

			var requete = "";

			requete = "select *, MAX(order_number) As Max ";
			requete += "from task ta ";
			requete += "group by id, order_number ";
			requete += "having MAX(order_number) = (select MAX(order_number) As Max ";
			requete += "from task ta);";

			req.db.driver.execQuery(requete, function (err, data) {

				if(err) {
					console.error("Plus - erreur de récup du max", err);

					return err;
				}
				// On augment pas la position d'une tâche qui est déjà cellle au maximum. On a un tableau max qui comporte 
				// max.order_number_max et max.id
				else if(id == data[0].id){
					console.log("C'est déjà le maximum !");

					return true;
				} 

				console.log("data.length : " + data[0].order_number);
				console.log("Avant augmentation : " + Task.order_number);

				//On augmente ce nombre
				Task.order_number = data[0].order_number + 1;

				console.log("Changement plus fait ! Valeur nouvelle  :  " + Task.order_number);

				//On enregistre ici car, la requête à pour de vérifier si on est pas déjà en présence du maximum
				Task.save(function (err) {
				    	if(err) console.error("Erreur de mise à jour de la tâche", err);
				        console.log("saved!");
		    	});
			});
		});
	    
		res.redirect('/task/');
	},
	moins : function(req, res) {

		var tachePrecedente = null;
		var id = parseInt(req.params.id);

		//On vérifie si une tâche suis cette tâche (les tâche commence à 0)
		//On récupère puis on modifie notre entité avant de la persister en BDD
		req.models.task.get(id, function (err, Task) {

			if (err){
				console.error('Moins error Task ',err)
				return err;
			}


			console.log("Tâche trouvé moins ! ");

			req.models.task.get(id + 1, function (err, previousTask) {

				if (err){
					console.error('Plus error Previous Task');
					return err;
				} 

				//On intervertie la tâche précédente avec celle dont on désire descendre d'une place
				tachePrecedente = previousTask;

				previousTask.id = Task.id;
				Task.id = tachePrecedente.id;

				console.log("Changement moins fait ! ");

			});
		});

		res.redirect('/task/');
	}
} //end of array action

module.exports = actions;