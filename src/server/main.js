



// ***
// Configure external logins
// ***

Accounts.loginServiceConfiguration.remove({
  service: "facebook"
});
Accounts.loginServiceConfiguration.insert({
  service: "facebook",
  appId: "609216679124014",
  secret: "fd5a223e32c042aeeddb98c115b3e6a3"
});