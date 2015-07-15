var uuid 				= require("uuid");
var forge 				= require("node-forge");
var userBucket			= require("../app").userBucket;
var userBucketName		= require("../config").couchbase.userBucket;
var N1qlQuery 			= require('couchbase').N1qlQuery;

function Session() {};

Session.create = function(userID, callback) {
	var sessionModel = {
		type: "session",
		userID: userID,
		sessionID: (uuid.v4()+"_session"),
		expiry: 3600
	};
	userBucket.insert(sessionModel.sessionID, sessionModel, {expiry: sessionModel.expiry}, function(error, result) {
		if (error) {
    		callback(error, null);
    		return;
    	}
    	callback(null, sessionModel);
    });
};

Session.auth = function(req, res, next) {
	var sessionID = req.headers.Authorization;
	var sessionArray = sessionID.split(" ");
	if (sessionArray[0] === "Bearer") {
		var getSession = N1qlQuery.fromString("SELECT userID FROM `" + userBucketName + "` WHERE type = \"session\" AND sessionID = $1");
		userBucket.query(getSession, [sessionArray[1]], function(error, result) {
			if(error) {
				callback(error, null);
    			return;
			}
			req.userID = result[0].userID;
			next();
		});
	}
};

/*Session.remove = function(sessionID, callback) {
	userBucket.remove(sessionID, function(error, result) {				HANDLE THIS ON FRONT-END (sessionModel will delete in 1 hr anyways)
																		simply delete the cookie upon logout
		if(error) {
			callback(error, null);
			return;
		}
		callback(null, result);
	});
}; */

/*Session.findUser = function(sessionID, callback) {
	var findUser = N1qlQuery.fromString('SELECT userID FROM '+userBucketName+' WHERE sessionID=\"'+sessionID+'\"');
	userBucket.query(findUser, function(error, result) {
		if(error) {
			callback(error, null);
		}
		callback(null, result[0].)
	})
}*/



// potential Session.delete for forceful login

module.exports = Session;