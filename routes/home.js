var controllers = require("../controllers");

/* GET home page. */
routes = function (app) {
	app.get('/', controllers.home.index);
}

// Permet d'exporter directement. Nul besoin d'appelé de sous élément lors de l'importation, c'est la fonction
// router qui sera directement accéssible.
module.exports = routes;