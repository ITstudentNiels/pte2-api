import DBConnection from "../configs/DBConnection";
import * as nx from "nextcloud-node-client";
import { check } from "express-validator";
//import { nginx, docker } from "../services/apiRequest";
import checkLogin from "../services/loginCheck";
import apiRequest from "../services/apiRequest";
const request = require('request');
require('dotenv').config();

//Function executed from routes/web.js
let setOptions = async (req, res) => {
    //Gather the selected database and webserver
    let optionDatabase = req.body.database;
    let optionWebserver = req.body.webserver;
    let userId = req.user.id;

    //Check if database option is noDatabase and set empty
    if (!optionDatabase || optionDatabase == 'nDB') {
        optionDatabase = '';
        }

    //Try to insert the selected database and webserver into the database
    try {
        DBConnection.query(
            ' UPDATE `tmp` SET `database` = ?, instance_type = ? WHERE `instance_from` = ?', [optionDatabase, optionWebserver, userId],
            function (err) {
                if (err) {
                    req.flash("alert", "Something went wrong! Please try again or contact the administrator. ERROR: OC:15");
                    req.flash("alert", "alert-danger");
                    res.redirect("/");
                } else {
                    req.flash("alert", "The preferred hosting application and database are saved.");
                    req.flash("alert", "alert-success");
                    res.redirect("/");
                }
            }
        )
    } catch (err) {
        req.flash("alert", "Something went wrong! Please try again or contact the administrator, ERROR: DC:0");
        req.flash("alert", "alert-danger");
        res.redirect("/");
    }
};

//Function executed from routes/web.js
let startInstance = async (req, res) => {
    //Gather the selected information from the request
    var removeWordpressData = false;
    var userId = req.user.id;

    //Check if the data needs to be removed
    if (Object.keys(req.body).length != 0) {
        removeWordpressData = true;
    }

    //Gather the preferred database and hosting application from the user
    try {
        DBConnection.query(
            ' SELECT `database`, `instance_type` FROM `tmp` WHERE `instance_from` = ?', req.user.id,
            function (err, result) {
                if (err) throw err;
//		console.log(result[0].instance_type == null);
		//apiRequest.copyFiles(result[0]['instance_name']);

               	if (result[0].instance_type != null) {
			console.log(result[0].database);
			if (result[0].database == null) {
				var database = '';
				console.log('here');
			} else {
		                var database = result[0].database.toLowerCase();
				//var database = result[0].database;
			}
        	        var webserver = result[0].instance_type;
	                //Update the instance information
        	        DBConnection.query(
	                    ' UPDATE `instances` SET `valid_until` = DATE_ADD(now(),interval 3 hour), `database` = ?, instance_type = ? WHERE `instance_from` = ?; SELECT * FROM `instances` WHERE `instance_from` = ?', [database, webserver, userId, userId],
        	            function (err, result) {
                	        if (err) {
                        	    req.flash("alert", "Something went wrong! Please try again or contact the administrator, ERROR: OC:52");
	                            req.flash("alert", "alert-danger");
        	                    res.redirect("/");
                	        } else {
					console.log(result);
				    database.toLowerCase();
				    apiRequest.copyFiles(result[1][0]['instance_name']);

				    if (removeWordpressData) { 
					apiRequest.removeWordpressData(result[1][0]['instance_name']); 
				    };

				    apiRequest.docker(result[1][0]['instance_name'], result[1][0]['port'], webserver.toLowerCase(), database, result[1][0]['username'], result[1][0]['password'], 'present');
                                    req.flash("alert", "The instance has been started. It wil take several minutes before the website is live!");
                	            req.flash("alert", "alert-success");
                        	    res.redirect("/");
	                        };
        	            }
                	)
		} else {
			req.flash("alert", "No hosting application and/or database selected! Select first before starting an instance.");
			req.flash("alert", "alert-danger");
			res.redirect("/");
		}
            }
        )
    } catch (err) {
        req.flash("alert", "Something went wrong! Please try again or contact the administrator, ERROR: DC:0");
        req.flash("alert", "alert-danger");
        res.redirect("/");
    } 
};

//Function executed from routes/web.js
let stopInstance = async (req, res) => {
    var userId = req.user.id;

    try {
	DBConnection.query(
		' UPDATE `instances` SET `valid_until` = null WHERE `instance_from` = ?; SELECT `student_id` FROM `users` WHERE `id` = ?', [userId, userId] ,
		function (err, result) {
			if (err) throw err;
			apiRequest.docker(result[1][0]['student_id'], '', '', '', '', '', 'absent');
			req.flash("alert", "Instance stopped");
		        req.flash("alert", "alert-warning");
			res.redirect("/");
		}
	)
    } catch (err) {
	console.log('err');
    }
}

//Function executed from routes/web.js
let filesUploaded = async (req, res) => {
    //Init server with the credentials
	const server = new nx.Server({
		basicAuth: {
			password: process.env.NX_PASSWORD,
			username: process.env.NX_USERNAME,
		},
		url: "http://" + process.env.NX_HOST,
	});
	try {
        //Init client with the server details
        const client = new nx.Client(server);
        //Create folder with the name of the student number
        const folder = await client.getFolder("/" + req.user.student_id);
        //Get the files inside the folder
        const files = await folder.getFiles();
        //Get the amount of files that are inside the folder
        const filesLength = files.length;
        //Update the amount of files uploaded inside the database
		DBConnection.query(
			' UPDATE `instances` SET `files_uploaded` = ? WHERE `instance_from` = ?', [filesLength, req.user.id],
			function (err) {
				if (err) {
                    req.flash("alert", "Something went wrong! Please try again or contact the administrator, ERROR: OC:99");
                    req.flash("alert", "alert-danger");
                    res.redirect("/");
                } else {
                    req.flash("alert", "The uploaded files are saved, when a new instance is started they will be used!");
                    req.flash("alert", "alert-success");
                    res.redirect("/");
                }
			}
		)
	} catch (err) {
        req.flash("alert", "Something went wrong! Please try again or contact the administrator, ERROR: OC:92");
        req.flash("alert", "alert-danger");
        res.redirect("/");
	}
};

//Function executed from /routes/web.js
let submitFiles = async (req, res) => {
    //Get the submitted url
    const submittedUrl = req.body['github-url'];
    //Gather the environment variables
    const fileExtensions = process.env.GITHUB_FILE_EXT.split(", ");
    const githubDomains = process.env.GITHUB_DOMAINS.split(", ");
    //Define a variable to save the valid boolean
    let validUrl;
    //Loop over each githubdomain
    for (let item of githubDomains) {
        var getIndexOfDomain = submittedUrl.indexOf(item);
        if (getIndexOfDomain >= 0) {
            validUrl = true;
        }
    }
    //Loop over each fileExtension
    for (let item1 of fileExtensions) {
        var getIndexOfExtension = submittedUrl.slice(submittedUrl.length - 4).indexOf(item1);
        if (getIndexOfExtension >= 0) {
            validUrl = true;
	    break;
	} else {
	    validUrl = false;
	    break;
	}
    }
    //Redirect the user back to the homepage with the alert message
    if (validUrl) {
//	const server = new nx.Server({
//		basicAuth: {
//			password: process.env.NX_PASSWORD,
//			username: process.env.NX_USERNAME,
//		},
//		url: "http://" + process.env.NX_HOST,
//	});
	try {

		DBConnection.query(
			'SELECT student_id FROM `users` WHERE `id` = ?', req.user.id,
			function (err, result) {
				if (err) throw err;
				apiRequest.files(result[0]['student_id'], 'github', submittedUrl);
//				let dataLength = await apiRequest.dataLength(result[0]['student_id']);
//				console.log(await apiRequest.dataLength(result[0]['student_id']));
//				const dataLength = await apiRequest.dataLength(result[0]['student_id']);
//				await new Promise(resolve => setTimeout(resolve, 1000));
//				console.log('test', dataLength);
		//		console.log(dataLength);

				req.flash("alert", "The github repository files are downloaded");
				req.flash("alert", "alert-success");
				res.redirect("/");
			}
		)
//		let dataLength = await apiRequest.dataLength('460499');
//		console.log('result', dataLength.size);
//		DBConnection.query(
//			'UPDATE instances SET files_uploaded = ? WHERE instance_from = ?', [dataLength.size, req.user.id],
//			function (err, result) {
//				if (err) throw err;
//				console.log(result);
//				req.flash("alert", "The Github repository files are downloaded");
//				req.flash("alert", "alert-success");
//				res.redirect("/");
//			}
//		)
//			DBConnection.query(
//				'UPDATE `instances` SET `files_uploaded` = ? WHERE `instance_from` = ?', [req.user.id, dataLength, req.user.id],
//				function (err, result) {
//					if (err) throw err;
//				        req.flash("alert", "The Github repository files are downloaded and saved.");
//					        req.flash("alert", "alert-success");
//			       		res.redirect("/");
//				}
//			)



//		console.log(await dataLength);
//		const dataLength = 0;
//		const test = await dataLength;
//		DBConnection.query(
//			'UPDATE `instances` SET `files_uploaded` = ? WHERE `instance_from` = ?', [req.user.id, dataLength, req.user.id],
//			function (err, result) {
//				if (err) throw err;
//			        req.flash("alert", "The Github repository files are downloaded and saved.");
//			        req.flash("alert", "alert-success");
//			        res.redirect("/");
//			}
//		)

	} catch (err) {
		console.log(err);
		req.flash("alert", "Something went wrong! Please try again or contact the administrator. ERROR: OC:188");
		req.flash("alert", "alert-danger");
		res.redirect("/");
	}
    } else {
        req.flash("alert", "The Github url you have submitted is not valid: " + submittedUrl + "! Maybe you are missing the .git extension.");
        req.flash("alert", "alert-danger");
        res.redirect("/");
    }
};

let nextcloudUpload = (req, res) => {
	DBConnection.query(
		'SELECT student_id FROM `users` WHERE id = ?', req.user.id,
		function (err, result) {
			if (err) throw err;
			apiRequest.files(result[0]['student_id'], 'nextcloud', '');
			res.redirect("/?#modalUpload");
		}
	)
};

//Function executed from routes/web.js
let introDone = async (req, res) => {
	var port = parseInt(process.env.START_PORT) + parseInt(req.user.id);
        await checkLogin.check(req.user.id, req.user.student_id);
        await apiRequest.files(req.user.student_id, 'docker');
//	await apiRequest.nginx(result[1][0]['student_id'], result[0][0]['domain_name'], result[0][0]['port'], 'present');
	await new Promise(resolve => setTimeout(resolve, 5000));
//	console.log(`checkLogin response: ${response}`);
	try {
   		DBConnection.query(
	        ' SELECT `domain_name`, `port` FROM `instances` WHERE `instance_from` = ?; SELECT `student_id` FROM `users` WHERE `id` = ?; UPDATE `users` SET `active` = 1 WHERE `id` = ?', [req.user.id, req.user.id, req.user.id],
        	function (err, result) {
                	if (err) {
	                	    res.redirect("/");
	               	} else {
			            apiRequest.nginx(result[1][0]['student_id'], result[1][0]['student_id'] + '.pte2.tech', port, 'present');
	        	            res.redirect("/");
               		};
	       	}
        	);
    	} catch (err) {
        	req.flash("alert", "Something went wrong! Please try again or contact the administrator, ERROR: DC:0");
	        req.flash("alert", "alert-danger");
        	res.redirect("/");
     	};
};
//	console.log(port);
//    await checkLogin.check(req.user.id, req.user.student_id);
    //Update the users table when the user has finished the intro//
let offboard = async (req, res) => {
//	var userId = req.user.id;
	var userId = req.user.id;
	//const student_id = 460499;

	const server = new nx.Server({
		basicAuth: {
			password: process.env.NX_PASSWORD,
			username: process.env.NX_USERNAME,
		},
		url: "https://" + process.env.NX_HOST,
	});

	try {
		DBConnection.query(
			'SELECT * FROM `users` WHERE id = ?; UPDATE `users` SET files_url = ?, files_pass = ?, active = ? WHERE id = ?; DELETE FROM `tmp` WHERE instance_from = ?; DELETE FROM `instances` WHERE instance_from = ?', [userId, null, null, 0, userId, userId, userId],
			function (err, result) {
				if (err) {
					req.flash("error", process.env.ERROR_MESSAGE);
					req.flash("error", "alert-danger");
					res.redirect("/");
				} else {
					apiRequest.docker(result[0]['student_id'], '', '', '', 'absent');
					apiRequest.nginx(result[0]['student_id'], '', '', 'absent');
				}
			}
		);
		apiRequest.docker(req.user.student_id, '', '', '', '', '', 'absent');
		apiRequest.nginx(req.user.student_id, '', '', 'absent');

		var headers = {
			'OCS-APIRequest': 'true',
			'Content-Type': 'application/json'
		};

		var options = {
			url: 'http://' + process.env.NX_HOST + '/remote.php/dav/files/root/' + req.user.student_id,
			method: 'DELETE',
			headers: headers,
			auth: {
				'user': process.env.NX_USERNAME,
				'pass': process.env.NX_PASSWORD
			}
		};

//		function callback(error, response, body) {
//			console.log(response.statusCode);
//			if (!error && response.statusCode == 204) {
//				console.log('Nextcloud folder removed');
//			}
//		}
		
		const response = await request(options);


		
//		req.flash("error", process.env.ERROR_MESSAGE);
//		req.flash("error", "alert-danger");
//		console.log(req.session);
		
		await req.session.destroy(function(err) {
			res.redirect("/login");
		});
//		res.redirect("/logout");
	} catch (err) {
		req.flash("alert", "Something went wrong! Please try again or contact the administrator ERROR: OC200");
		req.flash("alert", "alert-danger");
		res.redirect("/");
	};
};

module.exports = {
    setOptions: setOptions,
    startInstance: startInstance,
    stopInstance: stopInstance,
    filesUploaded: filesUploaded,
    submitFiles: submitFiles,
    introDone: introDone,
    offboard: offboard,
    nextcloudUpload: nextcloudUpload,
}
