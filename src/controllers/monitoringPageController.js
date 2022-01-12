import apiRequest from "../services/apiRequest";

let handleMonitoring = async (req, res) => {
	try {
		let instanceStats = await apiRequest.instanceStats(req.user.student_id);
		return await res.render("monitor.ejs", {
			instanceStats: instanceStats
		});
	} catch(err) {
		return res.redirect("/");
	}
};

module.exports = {
	handleMonitoring: handleMonitoring,
};
