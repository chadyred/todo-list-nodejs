module.exports = function (orm, db) {

    var Priorite = db.define("priorite", {
        id      : Number,
        option   : String
    });	
};

// Get all priority - 
exports.all = function(cb) {
  db.fetch({}, cb);
}

exports.remove = function (task, cb) {
	db.find(task).remove();
}