module.exports = function() {
	var nodemailer = require('nodemailer');
	var transport = nodemailer.createTransport(
        {
            debug: true,
            service: 'gmail',
            auth: {
                user: 'anandha.kumar@pickzy.com',
                pass: 'ARRVPUEM'
            }});

	function sendEmail(options) {
		from = NAME_FROM + ' <' + EMAIL_FROM + '>';

		if (!options.from) {
			options.from = from;
		}
        console.log("nodemailer"+from);
		transport.sendMail(options);
	};

	return {
		sendEmail: sendEmail
	};
}();