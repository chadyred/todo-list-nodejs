var router = function (app) {
	return  {
				home: require("./home")(app),
				tasks: require("./tasks")(app, "/task")
			};
};

module.exports = router;