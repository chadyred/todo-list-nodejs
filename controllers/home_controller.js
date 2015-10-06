//Ensemble des actions => structures

var actions = {
	index : function(req, res, next) {
	  res.render('layout.jade', { title: 'Todo' });
	}
}

module.exports = actions;