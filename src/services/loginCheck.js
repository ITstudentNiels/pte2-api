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
<<<<<<< HEAD
                    
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
=======
                    console.log('first login');
                const server = new nx.Server(
                  { basicAuth:
                    { password: process.env.NX_PASSWORD,
                      username: process.env.NX_USERNAME,
                    },
                  url: "http://" + process.env.NX_HOST,
                });

			    const client = new nx.Client(server);
			    const folder = await client.createFolder(studentID);
			    const share = await client.createShare({ fileSystemElement: folder, sharePermission: 31 });
                const sharePassword = rs.generate({ length: 8 });
			    share.setPassword(sharePassword); 
			    const shareID = share.memento.id
			    const shareLink = 'https://' + process.env.NX_DOMAIN + '/index.php/s/' + share.memento.token;

                var headers = {
                    'OCS-APIRequest': 'true',
		    'Content-Type': 'application/json'
                };
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
                    }
                };
                function callback(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                    }
                }

                await request(options, callback); 

                DBConnection.query(
                    'UPDATE `users` SET `active` = ?, files_url = ?, files_pass = ? WHERE `id` = ?; INSERT INTO `instances` (instance_name, domain_name, instance_from) VALUES (?, ?, ?); INSERT INTO `tmp` (instance_from) VALUES (?)', ['1', shareLink, sharePassword, id, studentID, 'https://' + studentID + '.pte2.tech', id, id],
                    function (err, result) {
                        if (err) throw err;
                    }
                )
	        await new Promise(resolve => setTimeout(resolve, 5000));
		await request(options, callback);
	     }
        });
>>>>>>> 99fb57ed01f86315e6c19a719d8e03a94719a3ac
    } catch (err) {
        throw err
    }
};

module.exports = {
    check: check
};
<<<<<<< HEAD


// import DBConnection from "../configs/DBConnection";
// import Client, { SharePermission, UploadFilesCommand } from "nextcloud-node-client";

// let check = (id, studentID) => {
//     try {
//         DBConnection.query(
//             //' UPDATE `instances` SET `database` = ?, instance_type = ? WHERE `instance_from` = ?', [optionDatabase, optionWebserver, userId],
//             ' SELECT `active` FROM `users` WHERE id = ?', id,
//             function (err, result) {
//                 if (err) throw err;

//                 if (!result[0].active) {
//                     console.log('first login');
//                     DBConnection.query(
//                         ' UPDATE `users` SET `active` = ? WHERE `id` = ?', ['1' ,id],
//                         function (err, result) {
//                             if (err) throw err;
//                             console.log('user updated');
//                         }
//                     )

//                     (async () => {
//                         try {
//                             const server = new Server (
//                                 { basicAuth:
//                                     {
//                                         password: "dankjewelpeter62",
//                                         username: "root"
//                                     },
//                                     url: "http://10.0.0.4",
//                                 }
//                             )

//                             const client = new Client(server);
//                             const folder = await client.createFolder(studentID);
                            
//                             const share = await client.creaeteShare({ fileSystemElement: folder, SharePermission: 3 });
//                             share.setPassword("dankjewelpeter62");
//                             share.setPublicUpload();
//                             //SharePermission
//                             const shareLink = share.url;

//                             console.log(shareLink);

//                         } catch (err) {
//                             throw err;
//                         }

//                     })


//                     return;
//                 }
//             }
//         )
//     } catch (err) {
//         throw err
//     }
// };

// module.exports = {
//     check: check
// };
=======
>>>>>>> 99fb57ed01f86315e6c19a719d8e03a94719a3ac
