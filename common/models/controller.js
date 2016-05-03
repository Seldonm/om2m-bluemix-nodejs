module.exports = function(Controller) {

    var parseString = require('xml2js').parseString;

    Controller.parseXMLtoJSON = function(string) {

        var JSONres = {};
        parseString(string, {
            explicitArray: false,
            ignoreAttrs: true,
            explicitRoot: false
        }, function(err, json) {
            var obj = JSON.stringify(json);
            var new_jsonstr = obj.replace(/om2m:/g, "");
            JSONres = JSON.parse(new_jsonstr);
        });
        return JSONres;
    }

    Controller.base64toJSON = function(hash) {

        var JSONres = {};
        var hashB = new Buffer(hash, 'base64');
        var hashS = hashB.toString();
        parseString(hashS, {
            explicitArray: true,
            explicitRoot: false,
        }, function(err, json) {

            JSONres = json;

        });
        return JSONres;
    }

    Controller.collectiontoJSON = function(string) {

        var JSONres = {};
        parseString(string, {
            explicitArray: false,
            explicitRoot: false
        }, function(err, json) {
            var obj = JSON.stringify(json);
            var new_jsonstr = obj.replace(/om2m:/g, "");
            JSONres = JSON.parse(new_jsonstr);
        });
        return JSONres;
    }

};
