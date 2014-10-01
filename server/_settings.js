
// ENVIRONMENT variables

// set default smtp server for emails sent using meteor's SMTP methods
// on local development machines the messages will be outputed to the console

var smtp = Settings['smtp'];

if (!smtp || !smtp.username || !smtp.password)
  console.log(500, "No smptp server configured");

var smtp_url = "smtp://"+smtp.username+":"+smtp.password+"@"+smtp.server+":"+smtp.port;

if (Settings['environment'] !== 'local')
  process.env["MAIL_URL"] = smtp_url;