var settings = {
  		port       : process.env.NODE_PORT || 3000,
		database : {
	    	host     : "127.0.0.1",
			protocol : "postgresql",
    		query    : { pool: false },
			user 	 : "nodejs",
			password : "nodejs",
			database : "todolist"
		}
}

module.exports = settings;