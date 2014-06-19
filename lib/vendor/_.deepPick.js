/**
 * Require _.deep.js from https://gist.github.com/furf/3208381
 */

_.mixin({

    deepPick: function (obj) {
        var ArrayProto = Array.prototype;
        var copy = {};
        var keys = ArrayProto.concat.apply(ArrayProto, ArrayProto.slice.call(arguments, 1));
        _.each(keys, function(key) {
            var val = _.deep(obj, key);
            if (val) _.deep(copy, key, val);
        });
        return copy;

    }

});

//Usage:
//    var obj = {
//        a : {
//            b : 'b',
//            c:'c'
//        },
//        x:{
//            y:'y',
//            z:'z'
//        }
//    };
//
//_.deepPick(z, 'a.b','x.z');
//
// result:
// {
//     a: {
//         b:'b'
//     },
//     x: {
//         z:'z'
//     }
//}