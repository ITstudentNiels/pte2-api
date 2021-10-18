import DBConnection from "../configs/DBConnection";

let setOptions = async (req, res) => {
    let optionDatabase = req.body.database;
    let optionWebserver = req.body.webserver;
    let userId = req.user.id;
    console.log(optionDatabase, optionWebserver);

    try {
        DBConnection.query(
            //' UPDATE `instances` SET `database` = ?, instance_type = ? WHERE `instance_from` = ?', [optionDatabase, optionWebserver, userId],
            ' UPDATE `tmp` SET `database` = ?, instance_type = ? WHERE `instance_from` = ?', [optionDatabase, optionWebserver, userId],
            function (err, result) {
                if (err) throw err;
                res.redirect("/")
            }
        )
    } catch (err) {
        throw err
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
                        res.redirect("/");
                    }
                )
            }
        )
    } catch (err) {
        throw err;
    }
    
};

module.exports = {
    setOptions: setOptions,
    startInstance: startInstance
}
