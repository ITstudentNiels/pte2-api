import DBConnection from "../configs/DBConnection";
import * as nx from "nextcloud-node-client";
import { check } from "express-validator";
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
    var removeData = false;
    var userId = req.user.id;

    //Check if the data needs to be removed
    if (Object.keys(req.body).length != 0) {
        removeData = true;
    }

    //Gather the preferred database and hosting application from the user
    try {
        DBConnection.query(
            ' SELECT `database`, `instance_type` FROM `tmp` WHERE `instance_from` = ?', req.user.id,
            function (err, result) {
                if (err) throw err;
                var database = result[0].database;
                var webserver = result[0].instance_type;
                //Update the instance information
                DBConnection.query(
                    ' UPDATE `instances` SET `valid_until` = DATE_ADD(now(),interval ? hour), `database` = ?, instance_type = ? WHERE `instance_from` = ?', [process.env.INSTANCE_HOURS, database, webserver, userId],
                    function (err) {
                        if (err) {
                            req.flash("alert", "Something went wrong! Please try again or contact the administrator, ERROR: OC:52");
                            req.flash("alert", "alert-danger");
                            res.redirect("/");
                        } else {
                            req.flash("alert", "The instance has been started. It wil take several minutes before the website is live!");
                            req.flash("alert", "alert-success");
                            res.redirect("/");
                        };
                    }
                )
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
    req.flash("alert", "Instance stopped");
    req.flash("alert", "alert-warning");
    res.redirect("/");
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
        }
    }
    //Redirect the user back to the homepage with the alert message
    if (validUrl) {
        req.flash("alert", "The Github repository files are downloaded and saved.");
        req.flash("alert", "alert-success");
        res.redirect("/");
    } else {
        req.flash("alert", "The Github url you have submitted is not valid: " + submittedUrl);
        req.flash("alert", "alert-danger");
        res.redirect("/");
    }
};

//Function executed from routes/web.js
let introDone = async (req, res) => {
    //Update the users table when the user has finished the intro
    try {
        DBConnection.query(
            ' UPDATE `users` SET `intro_done` = ? WHERE `id` = ?', [1, req.user.id],
            function (err, result) {
                if (err) {
                    req.flash("alert", "Something went wrong! Please try again or contact the administrator, ERROR: OC:122");
                    req.flash("alert", "alert-danger");
                    req.redirect("/");
                } else {
                    req.redirect("/");
                };
            }
        );
    } catch (err) {
        req.flash("alert", "Something went wrong! Please try again or contact the administrator, ERROR: DC:0");
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
}
