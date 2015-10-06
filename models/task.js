module.exports = function (orm, db) {

    var Task = db.define("task", {
        id: Number,
        date_fin: String,
        description: String,
        order_number: Number
    });     

    /**Many TAsk to One priorite avec récupération de l'entité inverse ICI. Deux accesseur sont disponible pour l'entité inverse
    * automatiquement: getTasks et setTasks.
    * priorite est le nom de l'association et définis l'attribut au travers duquel on récupérera la priporité
    * lLa clé étrangère créé sera 'priorite_id'. 
    *
    * On a 3 paramêtre: nom de l'assoc
    */
    Task.hasOne("priorite", db.models.priorite,
    	 {
		    key       : false, // Turns the foreign keys in the join table into a composite key 
		    autoFetch : true,
	     	reverse: "tasks" 
    });
}