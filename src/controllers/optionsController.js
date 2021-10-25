import DBConnection from "../configs/DBConnection";
import * as nx from "nextcloud-node-client";
require('dotenv').config();

let setOptions = async (req, res) => {
    let optionDatabase = req.body.database;
    let optionWebserver = req.body.webserver;
    let userId = req.user.id;
    if (!optionDatabase || optionDatabase == 'nDB') {
	optionDatabase = '';
    }
    console.log(optionDatabase, optionWebserver);

    try {
        DBConnection.query(
            ' UPDATE `tmp` SET `database` = ?, instance_type = ? WHERE `instance_from` = ?', [optionDatabase, optionWebserver, userId],
            function (err, result, chosen) {
                if (err) throw err;
                console.log(chosen)
                req.flash("errors", "The instance and database are changed, after starting a new instance they will be used.");
                req.flash("errors", "alert-success");
                res.redirect("/")
            }
        )
    } catch (err) {
        throw err
        req.flash("errors", "Something went wrong, please submit again!");
        req.flash("errors", "alert-warning");
        res.redirect("/");
    }
};

let startInstance = async (req, res) => {
    var removeData = false;
    var userId = req.user.id;

    if (Object.keys(req.body).length != 0) {
        removeData = true;
    }

    try {
        DBConnection.query(
            ' SELECT `database`, `instance_type` FROM `tmp` WHERE `instance_from` = ?', req.user.id,
            function (err, result, fields) {
                if (err) throw err;
                var database = result[0].database;
                var webserver = result[0].instance_type;

                DBConnection.query(
                    ' UPDATE `instances` SET `database` = ?, instance_type = ? WHERE `instance_from` = ?', [database, webserver, userId],
                    function (err, result) {
                        if (err) throw err;
                        req.flash("errors", "Instances started, it will take a few minutes before the instance is fully booted");
			req.flash("errors", "alert-success");
                        res.redirect("/");
                    }
                )
            }
        )
    } catch (err) {
        throw err;
    } 
};

let filesUploaded = async (req, res) => {
	console.log('filesUploaded ran');
	const server = new nx.Server({
		basicAuth: {
			password: process.env.NX_PASSWORD,
			username: process.env.NX_USERNAME,
		},
		url: "http://" + process.env.NX_HOST,
	});
	const client = new nx.Client(server);
	const folder = await client.getFolder("/" + req.user.student_id);
	const files = await folder.getFiles();
        const filesLength = files.length;
	console.log(client);
	try {
		DBConnection.query(
			' UPDATE `instances` SET `files_uploaded` = ? WHERE `instance_from` = ?', [filesLength, req.user.id],
			function (err, result) {
				if (err) throw err;
                                req.flash("errors", "The uploaded files are saved, when a new instance is started they will be used!");
				req.flash("errors", "alert-success");
				res.redirect("/");
			}
		)
	} catch (err) {
		throw err;
	}
};

module.exports = {
    setOptions: setOptions,
    startInstance: startInstance,
    filesUploaded: filesUploaded,
}
