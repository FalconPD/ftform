//inject directives and services.
var app = angular.module('ftform', ['ngFileUpload', 'moment-picker']);

app.controller('MyCtrl', ['$scope', '$http', 'Upload', function ($scope, $http, Upload) {

  $scope.formData = {}
  $scope.formData.emails = [];
  $scope.formData.grades = [];
  $scope.formData.vehicles = [];

  $scope.directions = { status: '', files: []};
  $scope.rosters = { status: '', files: []};
  $scope.chaperoneList = [];
  $scope.vehicles = [];
  $scope.grades = [];
  $scope.notesRequired = false;

  $scope.gradesAvailable = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  $scope.vehiclesAvailable = [{name: 'Food Truck', notesRequired: false},
                              {name: 'Equipment Trailer', notesRequired: false},
                              {name:'Other (see notes)', notesRequired: true}];

  //submit our draft
  $scope.submit = function() {
    $http.post('/api/create', $scope.formData);
  }

  //upload on file select or drop
  $scope.upload = function (file, update, validate) {
    if (file) {

      Upload.upload({
        url: '/api/upload',
        data: {file: file}
      }).then(function (resp) {
        update.files.push(resp.data);
        update.status = '';
      }, function (resp) {
        update.status = resp.data.error;
      }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        update.status = 'Uploading... ' + progressPercentage + '%';
      });
    }
  };

  //remove a file from the server and the list
  $scope.remove = function (index, update, validate) {
    $http.delete(update.files[index].url);
    update.status = '';
    update.files.splice(index, 1);
  };

  //Keep an eye on our file lists and change the file button validity accordingly
  $scope.$watch('rosters', function (rosters) {
    $scope.formData.rosters = rosters.files;
    $scope.myForm.rostersName.$setValidity('rosters', rosters.files.length > 0);
  }, true);
  $scope.$watch('directions', function (directions) {
    $scope.formData.directions = directions.files;
    $scope.myForm.directionsName.$setValidity('directions', directions.files.length > 0);
  }, true);

  //As the building changes, change the grades available
  $scope.$watch('formData.building', function (building) {
    if (building == 'Applegarth')
      $scope.gradesAvailable = [ '4', '5' ];
    else if (building == 'Barclay Brook')
      $scope.gradesAvailable = [ 'K', '1', '2', '3' ];
    else if (building == 'Brookside')
      $scope.gradesAvailable = [ '3', '4', '5' ];
    else if (building == 'High School')
      $scope.gradesAvailable = [ '9', '10', '11', '12' ];
    else if (building == 'Middle School')
      $scope.gradesAvailable = [ '6', '7', '8' ];
    else if (building == 'Mill Lake')
      $scope.gradesAvailable = [ 'K', '1', '2', '3' ];
    else if (building == 'Oak Tree')
      $scope.gradesAvailable = [ 'K', '1', '2', '3' ];
    else if (building == 'Woodland')
      $scope.gradesAvailable = [ '4', '5' ];
    $scope.grades = [];
  }, false);

  //Keep an eye on the grades selected and change the surrounding div accordingly
  //Also transfers the grades selected into the formData grades array
  $scope.$watch('grades', function (grades) {

    var valid = false;

    $scope.formData.grades = [];
    for (var i = 0; i < grades.length; i++) {
      if (grades[i]) {
        $scope.formData.grades.push($scope.gradesAvailable[i]);
        valid = true;
      }      
    }

    $scope.myForm.gradesError.$setValidity('grades', valid);

  }, true);

  //Keep an eye on the dates selected and change the divs accordingly
  $scope.$watch('formData.departure', function (departure) {
    $scope.myForm.departureDiv.$setValidity('departure', departure != undefined);
  }, false);
  $scope.$watch('formData.return', function (value) {
    $scope.myForm.returnDiv.$setValidity('return', value != undefined);
  }, false);

  //Keep an eye on the additional vehicles selected and update the vehicle list accordingly
  //also change the required attribute of the transportation notes section accordingly
  $scope.$watch('vehicles', function (vehicles) {

    var notesRequired = false;
    $scope.formData.vehicles = [];

    for (var i = 0; i < vehicles.length; i++) {
      if (vehicles[i]) {
        $scope.formData.vehicles.push($scope.vehiclesAvailable[i].name);
        if ($scope.vehiclesAvailable[i].notesRequired) {
          notesRequired = true;
        }
      }
    }
    $scope.notesRequired = notesRequired;

  }, true);

  //utility function used to dynamically add chaperones
  $scope.createRange = function (num) {
    if (num == undefined)
      return [];
    else
      return new Array(num);
  };

}]);

app.directive('emailList', function(){
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ngModel) {

      ngModel.$parsers.unshift(function(value) {

        var errorMsg = '';
        var valid = true;

        if (value === '') {
          valid = false;
        } else {
          /* Remove whitespace or commas from the front and back of the text,
             remove whitespace around commas, and replace multiple
             commas with a single comma */
          emails = value.replace(/^[\s,]*/, '').replace(/[\s,]*$/, '').replace(/\s*,\s*/g, ',').replace(/,+/g, ',').split(',');
          for (var i = 0; i < emails.length; i++) {
            if (! emails[i].match(/^\S+@monroe.k12.nj.us/i)) {
              errorMsg = emails[i] + ' is not a valid district email address.';
              valid = false;
              break;
            }
          }
        }
        if (valid) {
          scope[attr.emailList] = '';
          scope.formData.emails = emails;
          return emails;
        } else {
          scope[attr.emailList] = errorMsg;
          return undefined;
        }
      });
    }
  };
});

app.directive('appDatetime', function ($window) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {

      var moment = $window.moment;

      ngModel.$parsers.unshift(function(value) {
        ngModel.$setValidity('datetime', moment(value).isValid());
        return value;
      });

    }
  };
});

app.config(['momentPickerProvider', function (momentPickerProvider) {
  momentPickerProvider.options({
    format: 'LLLL',
    minView: 'year',
    hoursFormat: 'ha'
  });
}]);
