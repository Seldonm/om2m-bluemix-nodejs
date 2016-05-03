module.exports = function(app, cb) {

    var Mote = app.models.Mote;
    var Application = app.models.Application;
    var Content = app.models.Content;

    Mote.getMotes()
        .then(function() {
            Application.getApplications()
                .then(function() {
                    Content.getContents();
                });
        });
};
