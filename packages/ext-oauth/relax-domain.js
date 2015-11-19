

  // Hacking into meteor.js to override endOfPopupResponseTemplate template
// to include "document.domain" property for relaxing subdomain access.
var domain = Url.root();
var script = '\n<script type="text/javascript">'
           + '\n  document.domain = "' + domain + '";'
           + '\n</script>';
OAuth._endOfPopupResponseTemplate = OAuth._endOfPopupResponseTemplate.replace("<head>", "<head>"+script)

