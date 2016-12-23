var app = angular.module('ftform', []);

app.controller('MyCtrl', ['$scope', '$http', function ($scope, $http) {
  var tableData = [];

  $http.get('api/list').then(function(response) {

    for (var i = 0 ; i < response.data.length; i++) {

      fieldTrip = response.data[i];
     
      friendlyName = 'Field Trip to ' + fieldTrip.destination + ' on ' +
                     moment(fieldTrip.departure).format('L'); 
      tableData.push({
        'submitted': fieldTrip.submitted ? fieldTrip.submitted : 'UNDEFINED',
        'status'   : fieldTrip.status ? fieldTrip.status : 'UNDEFINED',
        'building' : fieldTrip.building,
        'attendees': fieldTrip.attendees,
        'departure': fieldTrip.departure,
        'friendlyDeparture': moment(fieldTrip.departure).format('LLLL'),
        'emails'   : fieldTrip.emails,
        'nurse'    : fieldTrip.nurse,
        'buses'    : fieldTrip.buses,
        'friendlyName': friendlyName,
        'total'    : fieldTrip.pupils + fieldTrip.teachers +
                     fieldTrip.chaperones,
        'emailAllUrl': 'mailto:' + fieldTrip.emails.join('; ') + '?subject=' + friendlyName 
      });
    }

    $scope.tableData = tableData;
  });
}]);
