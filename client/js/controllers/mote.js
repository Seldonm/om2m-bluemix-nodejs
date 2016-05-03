angular
    .module('app')
    .controller('MoteController', [
        '$scope',
        'Application',
        'MoteApp',
        'MoteList',
        'AppData',
        '$stateParams',
        '$timeout',
        '$filter',
        '$interval',

        function(
            $scope,
            Application,
            MoteApp,
            MoteList,
            AppData,
            $stateParams,
            $timeout,
            $filter,
            $interval) {

            $scope.apps = MoteApp;
            $scope.dataCharts = [];
            $scope.charts = [];
            $scope.sDirect = {};
            $scope.pollBar = {};
            $scope.appStatus = {};
            $scope.motePath = '';
            $scope.moteLocation = '';
            $scope.moteId = $stateParams.moteId;

            angular.forEach(MoteList, function(mote) {

                if (mote[0].moteId == $scope.moteId)
                    $scope.motePath = mote[0].path;
                $scope.moteLocation = mote[0].location;
            });

            $scope.dataTable = [];
            angular.forEach(AppData, function(data) {
                $scope.dataTable = $scope.dataTable.concat(data);
            });

            
            $scope.filterResults = function() {

                angular.forEach($scope.dataTable, function(d) {
                    d.creationTime = $filter('date')(d.creationTime, 'yyyy-MM-dd');
                });
                return $filter('groupBy')($filter('orderBy')($scope.dataTable, '-creationTime'), 'creationTime');
            };

            angular.forEach(AppData, function(data) {
                $scope.dataCharts = $scope.dataCharts.concat(data);
            });

            angular.forEach($scope.apps, function(app){

                $scope.sDirect[app.id] = app.directC;
                $scope.pollBar[app.id] = [];
                $scope.appStatus[app.id] = '';
            });

            $scope.getDirect = function(appId){
                $scope.pollBar[appId] = "indeterminate";
                $scope.appStatus[appId] = 'Polling sensor..';
                console.log($scope.sDirect[appId]);
                Application.pollSensor({
                    url: $scope.sDirect[appId]
                })
                .$promise
                .then(function(res){
                    console.log("Polling sensor " + appId + " Success!");
                    console.log(res.response.$.val);
                    $scope.pollBar[appId] = "";
                    $scope.appStatus[appId] = res.response.$.val;
                })
                .catch(function(err){
                    console.log("Polling sensor " + appId + " Error");
                    console.log(err.status);
                    $scope.pollBar[appId] = "";
                    $scope.appStatus[appId] = 'Offline';
                });


            }

            angular.forEach($scope.apps, function(app) {
                var forType = $filter('limitTo')($filter('filter')($scope.dataCharts, {
                    name: app.id.substr(0, 1)
                }), 10);
                forType.reverse();

                var title = app.type;
                var nameC = '';
                var points = [];
                var pointsX = [];
                var pointsY = [];
                var pointsZ = [];
                var config = {};
                var serie = [];
                angular.forEach(forType, function(obj) {

                    var x = Date.parse(obj.creationTime);

                    if (obj.name == "A") {

                        var split = obj.value.split(",");
                        pointsX = pointsX.concat([
                            [x, parseFloat(split[0])]
                        ]);
                        pointsY = pointsY.concat([
                            [x, parseFloat(split[1])]
                        ]);
                        pointsZ = pointsZ.concat([
                            [x, parseFloat(split[2])]
                        ]);


                    } else {
                        var y = parseFloat(obj.value);
   
                        points = points.concat([
                            [x, y]
                        ]);
                    }
                });

                   config = {
                    options: {
                        chart: {
                            type: 'areaspline',
                            zoomType: 'x'
                        },
                        plotOptions: {
                            series: {
                                stacking: ""
                            }
                        }
                    },
                    title: {
                        text: title
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            millisecond: '%H:%M:%S.%L',
                            second: '%H:%M:%S',
                            minute: '%H:%M',
                            hour: '%H:%M',
                            day: '%e. %b',
                            week: '%e. %b',
                            month: '%b \'%y',
                            year: '%Y'
                        }
                    },
                    series: [],

      func: function(chart) {
                $timeout(function() {
                    chart.reflow();
                }, 0);
            },
                    loading: false
                };



                if (app.id.substr(0, 1) === "A") {
                    config.series.push({

                        id: "xAxis",
                        name : "X Axis",
                        data: pointsX

                    }, {
                        id: "yAxis",
                        name : "Y Axis",
                        data: pointsY
                    }, {

                        id: "zAxis",
                        name : "Z Axis",
                        data: pointsZ

                    });

                } else {

                    switch(app.id.substr(0, 1)){

                        case 'T': nameC = 'Temperature (°C)';
                        break;

                        case 'H': nameC = 'Relative Humidity (%)';
                        break;

                        case 'L': nameC = 'Light (lux)';
                        break;



                    };
                    config.series.push({
                        name : nameC,
                        id: app.id,
                        data: points
                    });
                }

                $scope.charts.push(config);
            });

        }
    ])
    .filter('hasType', function() {
        return function(input, app) {
            var prop = app.substr(0, 1);
            return input.hasOwnProperty(prop) ? input[prop][0].value : "Empty";
        };
    })
    .filter('printLabel', function() {
        return function(input) {
            switch (input) {
                case 'A':
                    return "Accelerometer X-Y-Z (mg)";
                case 'H':
                    return "Relative Humidity(%)";
                case 'L':
                    return "Light(lux)";
                case 'T':
                    return "Temperature(°C)";
                default:

            }
        };
    });
