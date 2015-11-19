
// ENVIRONMENT variables

// set default smtp server for emails sent using meteor's SMTP methods
// on local development machines the messages will be outputed to the console

var smtp = Settings['smtp'];

if (!smtp || !smtp.username || !smtp.password)
  console.log(500, "No smtp server configured");
else
  process.env["MAIL_URL"] = "smtp://"+smtp.username+":"+smtp.password+"@"+smtp.server+":"+smtp.port;

// GRAPHENEDB SERVER URL

process.env["NEO4J_URL"] = "http://Interestrelations:0NKzYBRfnnpWQ7f2dSID@interestrelations.sb04.stations.graphenedb.com:24789"
process.env["NEO4J_AUTH"] = "Interestrelations:0NKzYBRfnnpWQ7f2dSID"

process.env["GRAPHENEDB_URL"] = "http://Interestrelations:0NKzYBRfnnpWQ7f2dSID@interestrelations.sb04.stations.graphenedb.com:24789"
