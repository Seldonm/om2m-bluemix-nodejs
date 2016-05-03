angular
    .module('app', [
        'ui.router',
        'ngResource',
        'angularUtils.directives.uiBreadcrumbs',
        'lbServices',
        'ngMaterial',
        'ngMdIcons',
        'highcharts-ng',
        'md.data.table',
        'angular.filter'
    ])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
        $urlRouterProvider, dbService) {
        $stateProvider
            .state('dashboard', {
                url: '/',
                resolve: {
                    MoteList: ['dbService', '$stateParams', function(dbService, $stateParams) {
                        return dbService.getMoteList();
                    }]
                },

                views: {
                    'sidenav': {
                        templateUrl: 'views/sidenav.html',
                        controller: 'Nav'
                    },
                    'toolbar': {
                        templateUrl: 'views/toolbar.html',
                        controller: 'Nav'
                    },
                    'content': {
                        templateUrl: 'views/home.html'
                    }


                },
                data: {
                    displayName: 'Home'
                }
            })
            .state('mote', {
                url: 'mote/:moteId',
                abstract: true,
                parent: 'dashboard',
                resolve: {
                    MoteApp: ['dbService', '$stateParams', function(dbService, $stateParams) {
                        return dbService.getMoteApplications($stateParams.moteId);
                    }],

                    AppData: ['dbService', '$stateParams', function(dbService, $stateParams) {
                        return dbService.getApplicationContent($stateParams.moteId);
                    }]
                },
                data: {
                    breadcrumbProxy: 'display'
                },

                views: {
                    'content@': {
                        templateUrl: 'views/content.html'
                    }
                }
            })

        .state('display', {
            url: '',
            parent: 'mote',
            views: {
                'info': {
                    controller: 'MoteController',
                    templateUrl: 'views/info.html'
                }
            },
            data: {
                displayName: '{{moteId}}'
            },
            resolve: {
                moteId: function($stateParams) {
                    return $stateParams.moteId;
                }
            }
        });
        $urlRouterProvider.otherwise('/');
    }])
    .config(function($mdThemingProvider, $mdIconProvider) {

        var logoBlueMap = $mdThemingProvider.extendPalette('blue', {
            '500': '428bca'
        });

        $mdThemingProvider.definePalette('logoBlue', logoBlueMap);
        $mdThemingProvider.theme('default')
            .backgroundPalette('grey', {
                'hue-1': '200', 
                'hue-2': '600', 
                'hue-3': 'A100' 
            })

        .primaryPalette('logoBlue')
            .accentPalette('blue');
    })
    .factory('dbService', ['Mote', 'Application', '$filter', '$q', function(Mote, Application, $filter, $q) {
        return {

            getMoteList: function() {
                return Mote.find()
                    .$promise
                    .then(function(res) {
                        var data = [];
                        angular.forEach(res, function(mote) {
                            data.push(Application.find({
                                    filter: {
                                        where: {
                                            moteId: mote.id
                                        },
                                        limit: 1
                                    }
                                })
                                .$promise
                                .then(function(res) {

                                    return res;

                                })

                                .catch(function(err) {
                                    console.log("Error:" + err);
                                }));
                        });

                        return $q.all(data).then(function(res) {
                 
                            return res;
                        });



                    });
            },

            getMoteApplications: function(moteId) {

                return Mote.applications({
                        id: moteId
                    })
                    .$promise
                    .then(function(res) {
  
                        return res;
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            },

            getApplicationContent: function(moteId) {
                return Mote.applications({
                        id: moteId
                    })
                    .$promise
                    .then(function(results) {

                        var data = [];
                        angular.forEach(results, function(app) {
                            data.push(
                                Application.content({
                                    id: app.id,
                                    filter: {
                                        fields: {
                                            creationTime: true,
                                            name: true,
                                            value: true
                                        },
                                        order: 'creationTime DESC',
                                        limit: 30
                                    }
                                })
                                .$promise
                                .then(function(results) {
                                    results.forEach(function(res) {
                            
                                        switch(res.name){

                                            case 'H': 
                                                res.value = $filter('number')(res.value);
                                            break;

                                            case 'L':
                                                res.value = $filter('limitTo')(res.value,1)+'.'+$filter('limitTo')(res.value,null,2);
                                            
                                            break;

                                            case 'X,Y,Z': 
                                                res.name = "A";
                                                var split = res.value.split(',');
                                                res.value = $filter('shortFmt')(parseInt(split[0]),1)+','+
                                                            $filter('shortFmt')(parseInt(split[1]),1)+','+
                                                            $filter('shortFmt')(parseInt(split[2]),1);
                                            break;

                                        }
                                    });
                                    return results;
                                })
                                .catch(function(err) {
                                    console.log("Error:" + err);
                                }));
                        });


                        return $q.all(data).then(function(res) {
                            return res;
                        });                       
                    });
            }

        }
    }])
.run(['$rootScope', '$state', '$stateParams',
    function($rootScope, $state, $stateParams) {}
]);
























// .controller('abstractController', ['$scope',
//     function($scope) {}
// ])
// .run(['$rootScope', '$state', '$stateParams',
//     function($rootScope, $state, $stateParams) {
//         $rootScope.$state = $state;
//         $rootScope.$stateParams = $stateParams;
//     }
// ]);
