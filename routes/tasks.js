/* GET users listing. */
var controllers = require("../controllers");

var routes = function (app, prefix, urlParser) {
	app.get(prefix + '/', controllers.task.index);
	app.get(prefix + '/:id_tache/delete', controllers.task.delete);
	app.post(prefix + '/new/', controllers.task.new);
	app.get(prefix + '/:id/edit/', controllers.task.edit);
	app.post(prefix + '/:id/update/', controllers.task.update);
	app.get(prefix + '/:id/plus/', controllers.task.plus);
	app.get(prefix + '/:id/moins/', controllers.task.moins);
};

module.exports = routes;