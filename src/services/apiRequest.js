const request = require('request');
//const EventEmitter = require('events').EventEmitter;
import DBConnection from "../configs/DBConnection";
require('dotenv').config();
const fetch = require('node-fetch');
import { encode  } from "base-64";

var headers = {
	'Content-Type': 'application/json'
}

var auth = {
	'username': process.env.API_USERNAME,
	'password': process.env.API_PASSWORD
}

var hostUrl = 'http://' + process.env.API_HOST + ':' + process.env.API_PORT;

let docker = (student_number, port, instance, database, username, password, state) => {

	var options = {
		url: hostUrl + '/api/docker',
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			"data": {
				"student_number": student_number,
				"port": port,
				"instance": instance,
				"database": database,
				"database_username": username,
				"database_password": password,
				"state": state
			}
		}),
		auth: auth
	}

	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			return true;
		} else {
			return false;
		}
	};
	const response = request(options, callback);
	console.log(response.body);
};

let nginx = (student_number, domain, port, state) => {

	var options = {
		url: hostUrl + '/api/nginx',
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			"data": {
				"student_number": student_number,
				"port": port,
				"domain": domain,
				"state": state
			}
		}),
		auth: auth
	}

	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			return true;
		} else {
			return false;
		}
	};

	const response = request(options, callback);
	console.log(response.body);
};

let files = (student_number, type, url) => {
	if (type === 'github') {
		var options = {
			url: hostUrl + '/api/files',
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				"data": {
					"student_number": student_number,
					"type": type,
					"url": url
				}
			}),
			auth: auth
		}

		function callback(error, response, body) {
			if (!error && response.statusCode == 200) {
				return true;
			} else {
				return false;
			}
		};

		const response = request(options, callback);
		console.log(response.body);
	}
	if (type === 'nextcloud') {
		var options = {
			url: hostUrl + '/api/files',
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				"data": {
					"student_number": student_number,
					"type": type
				}
			}),
			auth: auth
		}

		function callback(error, response, body) {
			if (!error && response.statusCode == 200) {
				return true;
			} else {
				return false;
			}
		};

		const response = request(options, callback);
	}
};

let dataLength = async (student_number) => {
	var url = hostUrl + '/api/dataLength';

	var response = await fetch(url, 
		{
			method: 'POST',
			body: JSON.stringify({
				"data": {
					"student_number": student_number
				}
			}),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + encode(auth.username + ":" + auth.password)
			}
	})

//	await DBConnection.query(
//		'UPDATE `instances` SET files_uploaded = ? WHERE `instance_name` = ?', [student_number],
//		function (err, result) {
//			return;
//		}
//	)

	return await response.json();
};

let copyFiles = (student_number) => {
	var options = {
		url: hostUrl + '/api/copyFiles',
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			"data": {
				"student_number": student_number
			}
		}),
		auth: auth
	}

	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			return true;
		} else {
			return false;
		}
	}

	request(options, callback);
}

let removeWordpressData = (student_number) => {
	var options = {
		url: hostUrl + '/api/wordpressData',
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			"data": {
				"student_number": student_number,
				"state": 'absent'
			}
		}),
		auth: auth
	}

	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			return true;
		} else {
			return false;
		}
	}

	request(options, callback);
}

let instanceStats = async (student_number) => {
//	try {
//		const url = 'http://192.168.0.3:9090/api/v1/query?query=container_fs_inodes_free';
//		const req = await fetch(url, {method:'POST',header: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + encode('admin:admin') },  });
//		const data = await req;
//		console.log(data);
//	} catch (err) {
//		console.log(err);
//	}

//	console.log(encode('admin:admin'));
//	var response = await fetch('http://192.168.0.3:9090/api/v1/query?',
	var responseRAM = await fetch(`http://192.168.0.3:9090/api/v1/query?query=sum(container_memory_usage_bytes{container_label_com_docker_swarm_service_name="${student_number}_web"})/1024/1024`,
//	var response = await fetch(`http://192.168.0.3:9090/api/v1/query?query=container_fs_inodes_free`,
		{
			method: 'GET',
//			body: JSON.stringify({
//				"query": `sum(container_memory_usage_bytes{container_label_com_docker_swarm_service_name="${student_number}_web"}) / 1024 / 1024 / 1024"`
//			}),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + encode('admin:admin')
			}
	}).then(res => res.json()).then(json => { return json })

	var responseCPU = await fetch(`http://192.168.0.3:9090/api/v1/query?query=sum(rate(container_cpu_usage_seconds_total{container_label_com_docker_swarm_service_name="${student_number}_web"}[5m])) * 100`,
//	var response = await fetch(`http://192.168.0.3:9090/api/v1/query?query=container_fs_inodes_free`,
		{
			method: 'GET',
//			body: JSON.stringify({
//				"query": `sum(container_memory_usage_bytes{container_label_com_docker_swarm_service_name="${student_number}_web"}) / 1024 / 1024 / 1024"`
//			}),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + encode('admin:admin')
			}
	}).then(res => res.json()).then(json => { return json })

	if (responseRAM['data']['result'][0] && responseCPU['data']['result'][0]) {
		return [responseRAM['data']['result'][0]['value'][1], responseCPU['data']['result'][0]['value'][1]]
	} else {
		return [0, 0]
	}



//	return responseRAM;
//	var body = response.body.data;
//	console.log(response.body);
//	return await response;

};

module.exports = {
	docker: docker,
	nginx: nginx,
	files: files,
	dataLength: dataLength,
	copyFiles: copyFiles,
	removeWordpressData: removeWordpressData,
	instanceStats: instanceStats
};
