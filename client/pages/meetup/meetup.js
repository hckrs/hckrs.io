MeetupController = DefaultController.extend({
    template: 'meetup',
    data: {
        topics: ["hardware", "drone", "diy", "quadcopter"],
        going: _.times(9, function () { return {imageSrc: "https://avatars.githubusercontent.com/u/163737?v=2&size=64"} }),
        maybe: _.times(3, function () { return {imageSrc: "https://avatars.githubusercontent.com/u/163737?v=2&size=64"} }),
        invited: _.times(20, function () { return {imageSrc: "https://avatars.githubusercontent.com/u/163737?v=2&size=64"} }),
    }
});