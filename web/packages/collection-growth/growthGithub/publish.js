// Publish the fits that are global and attached to the current city.



// publish GrowthGithub
Meteor.publish("growthGithub", function (city) {
  var user = Users.findOne(this.userId);

  if(!user || !Users.isAdmin(user) || !city)
    return [];  

  return GrowthGithub.find({city: city,
                          $and: [ {email: {$exists: true}}
                                , {email: {$ne: null}}
                                , {email: {$ne: ""}}
                                , {$or: [ { signupAt: {$exists: false} }
                                        , { signupAt: {$exists: true}, invitedAt: {$exists: true}} 
                                        ]}
                                ]
                         });
});
