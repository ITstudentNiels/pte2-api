import instanceService from "../services/instaceService";
import checkLogin from "../services/loginCheck";

let handleHelloWorld = async (req, res) => {
    let instanceInfo = await instanceService.getInstance(req.user.id);
    await checkLogin.check(req.user.id, req.user.student_id);
    if (!instanceInfo) {
	instanceInfo = {
		domain_name: '',
		valid_until: '',
		files_uploaded: '',
		instance_type: '',
		database: ''
	}
    }
    let error = req.flash("errors");
    error.push("&times;");
	console.log(error);
    if (Object.keys(error).length <= 1) {
	error = ["", ""];
    } 
    //let errors;
    //if (typeof errors == 'undefined') {
    //    errors = ["Welcome " + req.user.fullname];
    //}
//    console.log(req);
    return await res.render("homepage.ejs", {
	user: req.user,
	info: instanceInfo,
	//errors: ["Welcome"]
        errors: error,
    });
};

module.exports = {
    handleHelloWorld: handleHelloWorld,
};
