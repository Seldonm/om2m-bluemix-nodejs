module.exports = function(Mote) {

    var Promise = require('bluebird');
    //var util = require('util');

    function getMoteList(res) {

        var motelist = [];
        res.applicationCollection.namedReference.forEach(function(ref) {
            motelist.push(ref.substring(ref.length - 2));
        });

        var uniqueArray = motelist.filter(function(elem, pos) {
            return motelist.indexOf(elem) === pos;
        });

        return uniqueArray;
    }

    function upsertMotes(mote) {

        return Mote.upsert({
            id: mote

        });
    }


    Mote.getMotes = function() {

        var Controller = Mote.app.models.Controller;
        return Controller.getdata("gscl/applications")
            .then(function(results) {

                var JSONres = Mote.app.models.Controller.parseXMLtoJSON(results);

                var moteList = getMoteList(JSONres);
                Promise.map(moteList, function(mote) {
                    return Promise.resolve(upsertMotes(mote)).reflect();
                }).each(function(inspection) {
                    if (inspection.isFulfilled()) {
                        console.log("Mote upserted with ID: ", inspection.value());
                    } else {
                        console.error("Mote upsertion error: ", inspection.reason());
                    }
                })

            });

    };

    Mote.remoteMethod(
        'getMotes', {
            returns: {
                arg: 'moteList',
                type: 'string'
            },

            http: {
                verb: 'get'
            }

        });
};
