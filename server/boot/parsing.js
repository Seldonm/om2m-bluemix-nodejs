module.exports = function(app) {

    var Controller = app.models.Controller;
    var Application = app.models.Application;
    var Mote = app.models.Mote;
    var parseString = require('xml2js').parseString;

    console.log("[1] Add Parsing XML->JSON to Remote Methods");

    function parseXMLtoJSON(string) {

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
};
