import DBConnection from "../configs/DBConnection";

//Function executed from /routes/web.js
let getInstance = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            DBConnection.query(
                ' SELECT instances.instance_from, instances.database, instances.instance_type, tmp.database AS tmp_database, tmp.instance_type AS tmp_instance_type, instances.domain_name, instances.valid_until, instances.instance_name, instances.files_uploaded FROM instances INNER JOIN tmp ON tmp.instance_from = instances.instance_from WHERE instances.instance_from = ?;', id,
                function(err, rows) {
                    if (err) {
                        reject(err)
                    }
                    let info = rows[0];
                    resolve(info);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = {
    getInstance: getInstance
};