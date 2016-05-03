module.exports = function(Content) {

    var Promise = require('bluebird');

    function upsertContent(uri, cid, content, t) {

        return Content.upsert({
            id: cid,
            applicationId: uri.substring(uri.length - 3),
            creationTime: t,
            name: content.$.name,
            value: content.$.val
        });
    }

    Content.getContents = function() {

        var Controller = Content.app.models.Controller;
        return Controller.getdata('gscl/applications')
            .then(function(res) {
                var JSONres = Controller.parseXMLtoJSON(res);
                Promise.map(JSONres.applicationCollection.namedReference, function(appUrl) {


                    Controller.getdata(appUrl + '/containers/D/contentInstances')
                        .then(function(results) {
                            var contentList = Controller.collectiontoJSON(results);
                            console.log("App :" + appUrl + " Number of instance: " + contentList.currentNrOfInstances);
                            Promise.map(contentList.contentInstanceCollection.contentInstance, function(instance) {

                                    var c = Controller.base64toJSON(instance.content._);
                                    var id = instance.$.id;
                                    var cTime = instance.creationTime;
                                    return Promise.resolve(upsertContent(appUrl, id, c, cTime))
                                        .reflect();
                                })
                                .each(function(inspection) {
                                    if (inspection.isFulfilled()) {
                                        console.log("Content upserted with ID: ", inspection.value().id);
                                    } else {
                                        console.error("Error upserting content: ", inspection.reason());
                                    }
                                })
                                .catch(function(err) {
                                    console.log(err)
                                });
                        });
                })

            });



        // Controller.getdata('gscl/applications/' + appId + '/containers/D/contentInstances')
        //     .then(function(results) {
        //         var contentList = Controller.collectiontoJSON(results);
        //         console.log("App :" + appId + " Number of instance: " + contentList.currentNrOfInstances);
        //         Promise.map(contentList.contentInstanceCollection.contentInstance, function(instance) {

        //                 var c = Controller.base64toJSON(instance.content._);
        //                 var id = instance.$.id;
        //                 var cTime = instance.creationTime;
        //                 return Promise.resolve(upsertContent(appId, id, c, cTime))
        //                     .reflect();
        //             })
        //             .each(function(inspection) {
        //                 if (inspection.isFulfilled()) {
        //                     console.log("Content upserted with ID: ", inspection.value().id);
        //                 } else {
        //                     console.error("Error upserting content: ", inspection.reason());
        //                 }
        //             })
        //             .catch(function(err) {
        //                 console.log(err)
        //             });
        //     });


    };

    Content.remoteMethod(
        'getContents', {
            accepts: {
                arg: 'appId',
                type: 'string',
                required: true
            },
            returns: {
                arg: 'contentList',
                type: 'string'
            },

            http: {
                verb: 'get'
            }

        });
}
