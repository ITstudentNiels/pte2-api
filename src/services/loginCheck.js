import DBConnection from "../configs/DBConnection";
import * as nx from "nextcloud-node-client";
require('dotenv').config();
var request = require('request');
var rs = require('randomstring');

let check = (id, studentID) => {
    try {
        DBConnection.query(
            ' SELECT `active` FROM `users` WHERE id = ?', id,
            async function (err, result) {
                if (err) throw err;

                if (!result[0].active) {
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
    } catch (err) {
        throw err
    }
};

module.exports = {
    check: check
};
