var app = angular.module('ftform', []);

app.controller('MyCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
  $scope.tableData = [];
  $scope.sortType = 'submitted';
  $scope.sortReverse = false;

  $http.get('api/list').then(function(response) {

    for (var i = 0 ; i < response.data.length; i++) {

      fieldTrip = response.data[i];
     
      friendlyName = 'Field Trip to ' + fieldTrip.destination + ' on ' +
                     $filter('date')(fieldTrip.departure, 'M/dd/yy');
      $scope.tableData.push({
        'submitted'   : fieldTrip.submitted,
        'departure'   : fieldTrip.departure,
        'building'    : fieldTrip.building,
        'destination' : fieldTrip.destination,
        'attendees'   : fieldTrip.pupils + fieldTrip.teachers + fieldTrip.chaperones,
        'emails'      : fieldTrip.emails,
        'status'      : fieldTrip.status,
        'friendlyName': friendlyName,
        'emailAllUrl' : 'mailto:' + fieldTrip.emails.join('; ') + '?subject=' + friendlyName,
        'viewUrl': 'view.html?id=' + fieldTrip._id 
      });
    }
  });
}]);
