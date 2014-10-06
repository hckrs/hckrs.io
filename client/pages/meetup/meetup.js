MeetupController = DefaultController.extend({
    template: 'meetup',
    data: {
        topics: ["hardware", "drone", "diy", "quadcopter"],
        presence:
            [{ status  : "going"
             , users : _.times(9, function () { return {imageSrc: "https://avatars.githubusercontent.com/u/163737?v=2&size=64"}})
             },
             { status  : "maybe"
             , users : _.times(3, function () { return {imageSrc: "https://avatars.githubusercontent.com/u/163737?v=2&size=64"}})
             },
             { status  : "invited"
             , users : _.times(3, function () { return {imageSrc: "https://avatars.githubusercontent.com/u/163737?v=2&size=64"}})
             }
            ],
        time: "4 october at 19pm",
        location: "Ninkasi Guillotière",
    }
});
