	window.onclick = function(event) {
		if (event.target == document.getElementById('modalUpload')) {
			fetch(window.location.href + 'filesUploaded');
			setTimeout(function(){ location.reload()}, 2000);
		}
	}
	console.log(<%= info.tmp_instance_type %>)
        if ('<%= info.tmp_instance_type %>') {
		document.getElementById('webserver').value = '<%= info.tmp_instance_type %>';
        }
	document.getElementById('database').value = '<%= info.tmp_database %>';

        if(document.getElementById('webserver').value === 'Wordpress') {
            document.getElementById('database').disabled = true;
        }

        function checkOption() {
            var instanceOption = document.getElementById('webserver');
            var databaseOption = document.getElementById('database');

            if (instanceOption.value == 'Wordpress') {
                databaseOption.disabled = true;
            }
            else {
                databaseOption.disabled = false;
            }
        }

        var countDownTime = new Date('<%= info.valid_until %>').getTime();

        var x = setInterval(function() {
            var now = new Date().getTime();

            var diff = countDownTime - now;

            var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 *60));
            var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('timer').innerHTML = hours + "h " + minutes + "m " + seconds + "s ";
            console.log(diff);
            if (diff < 1800000) {
                document.getElementById('timer').style.color = "red";
            }

            if (diff < 0) {
                clearInterval(x);
                document.getElementById('timer').innerHTML = "INSTANCE EXPIRED";
            }

	    if ('<%= info.valid_until %>' == '') {
		document.getElementById('timer').innerHTML = "";
	    }
        }, 1000);
