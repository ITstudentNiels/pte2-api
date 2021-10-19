import DBConnection from "../configs/DBConnection";
import Client from "nextcloud-node-client";

let check = (id, studentID) => {
    try {
        DBConnection.query(
            //' UPDATE `instances` SET `database` = ?, instance_type = ? WHERE `instance_from` = ?', [optionDatabase, optionWebserver, userId],
            ' SELECT `active` FROM `users` WHERE id = ?', id,
            function (err, result) {
                if (err) throw err;

                if (!result[0].active) {
                    console.log('first login');
                    DBConnection.query(
                        ' UPDATE `users` SET `active` = ? WHERE `id` = ?', ['1' ,id],
                        function (err, result) {
                            if (err) throw err;
                            console.log('user updated');
                        }
                    )

                    (async () => {
                        try {
                            const server = new Server (
                                { basicAuth:
                                    {
                                        password: "dankjewelpeter62",
                                        username: "root"
                                    },
                                    url: "http://10.0.0.4",
                                }
                            )

                            const client = new Client(server);
                            const folder = await client.createFolder(studentID);
                            const share = await client.creaeteShare({ fileSystemElement: folder });
                            share.setPassword("dankjewelpeter62");
                            share.setPublicUpload();
                            const shareLink = share.url;

                            console.log(shareLink);

                        } catch (err) {
                            throw err;
                        }

                    })


                    return;
                }
            }
        )
    } catch (err) {
        throw err
    }
};

module.exports = {
    check: check
};