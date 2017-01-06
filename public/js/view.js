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

app.controller('MyCtrl', ['$scope', '$http', '$location', '$filter', function ($scope, $http, $location, $filter) {

  $scope.submitSignature = {};

  $scope.id = $location.search().id;
  $scope.role = $location.search().role;
  $scope.submitSignature.role = $scope.role;
  $scope.submitSignature.email = $location.search().email;
  $scope.submitSignature.key = $location.search().key;
  
  $scope.sign = function() {
    $http.post('/api/sign/' + $scope.id, $scope.submitSignature);
  }

  $http.get('api/view/' + $scope.id).then(function(response) {
    $scope.response = response.data;
    $scope.friendlyName = 'Field Trip to ' + $scope.response.destination + ' on ' +
                          $filter('date')($scope.response.departure, 'M/dd/yy');
    $scope.total = $scope.response.pupils + $scope.response.teachers + $scope.response.chaperones;
    $scope.emailAllUrl = 'mailto:' + $scope.response.emails.join('; ') + '?subject=' + $scope.friendlyName;
  });
}]);
