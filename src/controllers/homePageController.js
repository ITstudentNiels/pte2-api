import instanceService from "../services/instaceService";
import checkLogin from "../services/loginCheck";

//Function executed from routes/web.js 
let handleHomepage = async (req, res) => {
    //Variable that contains information about the instance from the current user
    let instanceInfo = await instanceService.getInstance(req.user.id);
<<<<<<< HEAD
    //If the information is empty set the variable to empty information
    if (!instanceInfo) {
        instanceInfo = {
            domain_name: '',
            valid_until: '',
            files_uploaded: '',
            instance_type: '',
            database: ''        
        }
    }
    //Check whether the user already logged in once
    await checkLogin.check(req.user.id, req.user.student_id);
    
    //Request the alert 
    let alertMessage = req.flash("alert");
    //Push an extra element to the alert list
    alertMessage.push("&times;");
    //Check if there are no errors found
    if (Object.keys(alertMessage).length <= 1) {
        //Set the error variable to an empty list
        alertMessage = [];
    }
    //Return the user to the homepage with the different information
    return await res.render("homepage.ejs", {
        user: req.user,
        info: instanceInfo,
        alert: alertMessage,
    })
=======
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
>>>>>>> 99fb57ed01f86315e6c19a719d8e03a94719a3ac
};

module.exports = {
    handleHomepage: handleHomepage,
};
