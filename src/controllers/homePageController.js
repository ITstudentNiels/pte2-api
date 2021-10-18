import instanceService from "../services/instaceService";

let handleHelloWorld = async (req, res) => {
    let instanceInfo = await instanceService.getInstance(req.user.id);
    return await res.render("homepage.ejs",{
       user: req.user,
       info: instanceInfo,
       errors: ["test"]
    });
};

module.exports = {
    handleHelloWorld: handleHelloWorld,
};
