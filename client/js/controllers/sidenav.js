angular
    .module('app')
    .controller('Nav', [
        '$scope',
        '$mdSidenav',
        'MoteList',
        'Mote',
        'Application',
        '$filter',

        function(
            $scope,
            $mdSidenav,
            MoteList,
            Mote,
            Application,
            $filter) {
            $scope.motes = [];
            angular.forEach(MoteList, function(data) {
                $scope.motes = $scope.motes.concat(data);
            });

            $scope.updateMoteList = function() {

                Mote.getMotes();

                Mote
                    .find()
                    .$promise
                    .then(function(results) {
                        $scope.motes = results;
                    });
            };

            $scope.toggleSidenav = function(menuId) {
                $mdSidenav(menuId).toggle();
            };

            $scope.closeSidenav = function(menuId) {
                $mdSidenav(menuId).close();
            };

        }
    ])
    .filter('capitalize', function() {
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    });

    





