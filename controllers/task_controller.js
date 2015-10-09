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

			// Chargement du model task. Il suffit d'appelé le fichier qui chargera l'objet littéral avec "module.exports = objet"
			req.models.task.find({next_task_id: null}, function (err, taskWithoutNext) {

				if(err) {
					console.error("Erreur sur le numéro d'ordre", err);

					return err;
				}
				console.log("taskWithoutNext" + taskWithoutNext);

				req.models.task.create({ date_fin: dateFin, description: task,priorite_id: degreeNumber }, function(err, item) {
					//On ajoute en next_id le dernière élément entré
		            if (err) {
		            	throw err;
		            }
		            else if(typeof taskWithoutNext[0] != "undefined" && taskWithoutNext[0].id != item.id) {

	            		console.log("Id du nouvel élément créé : " + item.id);
	            		console.log("Id de taskWithoutNext : " + taskWithoutNext[0].id);

	            		taskWithoutNext[0].next_task = item;

	            		taskWithoutNext[0].save( function (err) {
						    	if(err) console.error("Erreur de mise à jour de la tâche", err);

						        console.log("saved!");
				    	});
		            }
		        });	
		    });		

			res.redirect('/task/');
	},
	delete : function (req, res, next) {

		//On récupère l'identifiant de la tâche au sein de l'URL
		var idTache = req.params.id_tache;
		var prevTask = null;
		var nextTask = null;

		console.log("Tâche id par url : " + idTache);

		req.models.task.get(idTache, function (err, Task) {

			if(typeof Task.next_task !=  "undefined") {
				nextTask = Task.next_task;
			}

			//Retourne un tableau d'objet. A croire que le OneToOne n'héxiste pas...
			//On récupère celuis qui nous cible. La tâche ici présente est en situation d'inverse
			Task.getPreviousTask(function (err, prevTask) {

				if(prevTask[0])
				{
					console.log("prevTask.id : " + prevTask[0].id);

					if (err) {
						console.error("Tâche précédente (prevTask) non trouvé", err);
						return err;
					}


						if (err || typeof prevTask[0] === "undefined") {
							console.error("Tâche précédente nn trouvée lors de la suppréssion", err);

							return err;
						}

						if(prevTask[0] != null && nextTask != null){
							prevTask[0].next_task_id = nextTask.id;				
						}
						else if (prevTask[0] != null && nextTask == null) {
							prevTask[0].next_task_id = null;
						}

						prevTask[0].save(function (err) {
							if (err) 
								return err;
							else
								console.log("Tâche précédente saved ! ");							
						});			

						//Je remove ici car l'ensemble des tâche précédente s'xécuteront si oui ou non une tâche existe.
						Task.remove(function (err) {
							    // Does gone.. 
							    if (err) 
							    	console.error(err);
							    else{
							    	console.log("Suppression réussit ! ");

									//On redirige vers l'accueil une fois la suppression réalisé
									res.redirect('/task/');	
							    }

						});			

				}
				else {
		    		console.log("Pas de tâche précédent la tâche !");

		    		//Je remove ici car l'ensemble des tâche précédente s'xécuteront si oui ou non une tâche existe.
					Task.remove(function (err) {
						    // Does gone.. 
						    if (err) 
						    	console.error(err);
						    else{
						    	console.log("Suppression réussit ! ");

								//On redirige vers l'accueil une fois la suppression réalisé
								res.redirect('/task/');	
						    }

					});
		    	}

		    	

			});			

    	});

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

			console.log("La tâche existe");

			//Si on a bien une tâche suivante
			if(Task.next_task_id)
			{
				req.models.task.get(Task.next_task_id, function (err, nextTask) {


					if (err){
						 console.error('Plus error Task suivante',err);
						 return err;
					}

					//Une tâche suivante existe ? Sinon on ne fait rien !
					if(typeof nextTask !== "undefined") {

						var oldPreviousTaskId = null;

						//Une tâche précédente? 
						if(typeof Task.previousTask[0] != "undefined") {
							oldPreviousTaskId = Task.previousTask[0].id;
						} else {
							console.log("Pas de tâche précédente !");
						}


						nextTask.next_task = Task;

						//On récupère l'identifiant avant que celui-ci ne change via une fonction de callback 
						if(oldPreviousTaskId != null) {
							console.log('Une tâche précédente existe : oldPreviousTaskId = ' + oldPreviousTaskId);
							 //Une tâche suivanteSuivante existe ?
							req.models.task.get(oldPreviousTaskId, function (err, prevTask) {

								if (err) {
									console.error("Erreur de récupération de la prevTask", err);
									return err;
								}

								//On affecte notre previous task en tant que previous du next. 
								nextTask.previousTask[0] = prevTask;

								prevTask.save( function (err){									
									if (err) {
										console.error("Erreur d'enregistrement prevTask", err);
										return err;
									} else {
										console.log("Enregistrement réussis prevTask! " + prevTask.next_task.id)
									}
								});
							});
						}

						//Une tâche suivanteSuivante existe ?
						if(nextTask.next_task_id) {
							req.models.task.get(nextTask.next_task_id, function (err, nextNextTask) {

								if (err){
									 console.error('Plus error Task suivanteSuivante',err);
									 return err;
								}

								console.log("nextNextTask Existe !");
								Task.next_task = nextNextTask;

								
								Task.save( function (err){
									if (err) {
										console.error("Erreur d'enregistrement Task", err);
										return err;
									} else {
										console.log("Enregistrement réussis Task ! ");
									}
								});

								nextTask.save( function (err){
									if (err) {
										console.error("Erreur d'enregistrement nextTask", err);
										return err;
									} else {
										console.log("Enregistrement  nextTask réussis ! ");
									}
								});
							});	
						} else {
							console.log("Pas de nextNext task !");

							//On a pas de tâche après celle ci signifie que c'est la dernière de la pile
							Task.next_task_id = null;
							
							//On sauvegarde l'état de la tâche tout de même
							nextTask.save( function (err){
									if (err) {
										console.error("Erreur d'enregistrement nextTask", err);
										return err;
									} else {
										console.log("Enregistrement réussis nextTask ! ");
									}
								});

							Task.save( function (err){
									if (err) {
										console.error("Erreur d'enregistrement Task", err);
										return err;
									} else {
										console.log("Enregistrement réussis Task ! ");
									}
								});
						}				
					}

				});
			} else {
				console.log("Pas de tâche suivante, rien ne bouge ! ");
			}

			res.redirect('/task/');	

		});

				
	    
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