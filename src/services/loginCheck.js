import DBConnection from "../configs/DBConnection";
import * as nx from "nextcloud-node-client";
require('dotenv').config();
var request = require('request');
var rs = require('randomstring');

//Executed from controllers/homePageController
let check = (id, studentID) => {
    //Try to get the current user status
    try {
        DBConnection.query(
            ' SELECT `active` FROM `users` WHERE id = ?', id,
            async function (err, result) {
                if (err) throw err;

                //Check if the user account is not active
                if (!result[0].active) {
                    
                    //Instantiate the connection details
                    const server = new nx.Server({ 
                        basicAuth: { 
                            password: process.env.NX_PASSWORD,
                            username: process.env.NX_USERNAME,
                        },
                        url: "http://" + process.env.NX_HOST,
                    });

                    //Instantiate the connection with Nextcloud
    			    const client = new nx.Client(server);
                    //Create a nextcloud folder with the student number as name
			        const folder = await client.createFolder(studentID);
                    //Share the folder that is created
			        const share = await client.createShare({ fileSystemElement: folder, sharePermission: 31 });
                    //Generate a password for the share
                    const sharePassword = rs.generate({ length: 8 });
                    //Set the generated password 
                    share.setPassword(sharePassword); 
                    //Gather the share id
                    const shareID = share.memento.id
                    //Create the share link with the domain and share token
                    const shareLink = 'https://' + process.env.NX_DOMAIN + '/index.php/s/' + share.memento.token;

                    //The following code is to set the share as file drop
                    //Define the header for the API request
                    var headers = {
                        'OCS-APIRequest': 'true',
		                'Content-Type': 'application/json'
                    };
                    //Define the options for the request
                    var options = {
                        url: 'http://' + process.env.NX_HOST + '/ocs/v2.php/apps/files_sharing/api/v1/shares/' + shareID,
                        method: 'PUT',
                        headers: headers,
                        body: JSON.stringify({
			                "permissions": 4
		                }),
                        auth: {
                            'user': process.env.NX_USERNAME,
                            'pass': process.env.NX_PASSWORD
                        },
                    };
                    
                    //Function to handle the request error, response and body
                    function callback(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log(body);
                        }
                    }

                    //REMOVE! await request(options, callback); 

                    //Update the users, instance and tmp database table 
                    DBConnection.query(
                        'UPDATE `users` SET `active` = ?, files_url = ?, files_pass = ? WHERE `id` = ?; INSERT INTO `instances` (instance_name, domain_name, instance_from) VALUES (?, ?, ?); INSERT INTO `tmp` (instance_from) VALUES (?)', ['1', shareLink, sharePassword, id, studentID, 'https://' + studentID + '.pte2.tech', id, id],
                        function (err, result) {
                            if (err) throw err;
                        }
                    )
                    
                    //Wait 5 seconds before executing the api request
	                await new Promise(resolve => setTimeout(resolve, 5000));
                    //Make the API request
		            request(options, callback);
                }
            }
        );
    } catch (err) {
        throw err
    }
};

module.exports = {
    check: check
};
