module.exports = function(Application) {
    var Promise = require('bluebird');

    function upsertApplication(uri, propr) {

        return Application.upsert({
            id: uri.substring(uri.length - 3),
            moteId: uri.substring(uri.length - 2),
            type: propr.str[0].$.val,
            location: propr.str[1].$.val,
            lastC: propr.op[0].$.href,
            directC: propr.op[1].$.href

        });
    }

    function addPath(uri, path) {

        return Application.upsert({

            id: uri.substring(uri.length - 3),
            path: path

        });
    }

    Application.pollSensor = function(url) {

        var Controller = Application.app.models.Controller;
        return Controller.getdata(url)
            .then(function(res) {
                var JSONres = Controller.collectiontoJSON(res);
                console.log(res);
                return JSONres;
            })
            .catch(function(err) {
                 console.log(err);
                 return err;
            });



    };

    Application.getApplications = function() {

        var Controller = Application.app.models.Controller;
        return Controller.getdata("gscl/applications")
            .then(function(results) {
                var applist = Controller.parseXMLtoJSON(results);
                Promise.map(applist.applicationCollection.namedReference, function(app) {

                        return Controller.getdata(app + '/containers/d/contentInstances')
                            .then(function(res) {
                                console.log("appProperties fetched for app with ID " + app);
                                var JSONres = Controller.parseXMLtoJSON(res);
                                return Promise.resolve(upsertApplication(
                                        app,
                                        Controller.base64toJSON(JSONres.contentInstanceCollection.contentInstance.content)))
                                    .reflect();
                            });
                    })
                    .each(function(inspection) {
                        if (inspection.isFulfilled()) {
                            console.log("App upserted with ID: ", inspection.value().id);
                        } else {
                            console.error("Error upserting application: ", inspection.reason());
                        }
                    });

                Promise.map(applist.applicationCollection.namedReference, function(appl) {

                        return Controller.getdata(appl)
                            .then(function(res) {
                                var JSONres = Controller.parseXMLtoJSON(res);

                                var path = JSONres.aPoCPaths.aPoCPath.path;

                                var subpath = path.substring(path.lastIndexOf("[") + 1, path.lastIndexOf("]"));

                                return Promise.resolve(addPath(
                                        appl, subpath))
                                    .reflect();
                            });
                    })
                    .each(function(inspection) {
                        if (inspection.isFulfilled()) {
                            console.log("Add path CoAP", inspection.value().id);
                        } else {
                            console.error("Error upserting application: ", inspection.reason());
                        }
                    });

            });

    };

    Application.remoteMethod(
        'getApplications', {
            returns: {
                arg: 'appList',
                type: 'string'
            },

            http: {
                verb: 'get'
            }

        });

    Application.remoteMethod(
        'pollSensor', {
            accepts: {
                arg: 'url',
                type: 'string',
                required: true
            },
            returns: {
                arg: 'response',
                type: 'string'
            },

            http: {
                verb: 'get', 
                status: 200,
                errorStatus: 503
            }

        });

};
