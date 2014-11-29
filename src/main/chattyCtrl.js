angular.module('chatty')
    .controller('chattyCtrl', function($scope, chattyService) {
        $scope.threads = [];
        $scope.eventId = 0;
        $scope.error = null;

        chattyService.fullLoad().then(function(threads) {
            $scope.threads = threads;
        });
    });