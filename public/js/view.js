var app = angular.module('ftform',['ngSanitize']);

app.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.filter('breakFilter', function () {
  return function (text) {
    if (text !== undefined)
      return text.replace(/\n/g, '<br />');
  };
});

app.controller('MyCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
  $http.get('api/view/' + $location.search().id).then(function(response) {
    $scope.response = response.data;
    $scope.friendlyName = 'Field Trip to ' + $scope.response.destination + ' on ' +
                          moment($scope.response.departure).format('L');
    $scope.total = $scope.response.pupils + $scope.response.teachers + $scope.response.chaperones;
  });
}]);
