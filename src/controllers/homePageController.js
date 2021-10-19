import instanceService from "../services/instaceService";
import checkLogin from "../services/loginCheck";

let handleHelloWorld = async (req, res) => {
    let instanceInfo = await instanceService.getInstance(req.user.id);
    if (checkLogin.check(req.user.id, req.user.student_id)) {
        return await res.render("homepage.ejs",{
            user: req.user,
            info: instanceInfo,
            errors: ["test"]
        }); 
    } else {
        return await res.render("homepage.ejs",{
            user: req.user,
            info: instanceInfo,
            errors: ["test"]
        });
    }
};

module.exports = {
    handleHelloWorld: handleHelloWorld,
};
