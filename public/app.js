import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';
import chrome from 'ui/chrome';
import { Notifier } from 'ui/notify/notifier';

import 'ui/autoload/styles';
import './less/main.less';
import template from './templates/index.html';

uiRoutes.enable();
uiRoutes
.when('/', {
  template,
  resolve: {
    catIndices($http) {
      return $http.get('../api/cold-zone-manager/indices').then(function (resp) {
        console.log(resp);
        if (resp.status >= 400) {
          notify.warning(`Cluster Responded: ${ notify.describeError(resp.statusText) }`);
        }
        return resp.data;
      });
    }
  }
});

const notify = new Notifier({
  location: 'Elasticsearch Response'
});

uiModules
.get('app/cold-zone-manager', [])
.controller('coldZoneManager', function ($scope, $route, $interval, $http) {

  $scope.options = chrome.getInjected('coldZoneManagerOptions');

  $scope.title = 'Cold Zone Manager';
  $scope.description = 'You know, for index archives';

  $scope.sortType     = 'name'; 
  $scope.sortReverse  = false; 
  $scope.searchFilter   = ''; 

  $scope.selectedItems = [];

  $scope.currentOpenIndices = 0;


  setIndices($route.current.locals.catIndices);

  $scope.reload = function() {
    $http.get('../api/cold-zone-manager/indices').then(function (resp) {
      if (resp.status >= 400) {
        notify.warning(`Cluster Responded: ${ notify.describeError(resp.statusText) }`);
      }
      setIndices(resp.data);
    });
  }

  if ($scope.options.reloadMs > 0) {
    var unsubscribe = $interval(function() { 
      $scope.reload();
    }, $scope.options.reloadMs);
  }

  function setIndices(data) {
    $scope.indices = data;
    $scope.currentOpenIndices = countStatus($scope.indices, 'open');
  }

  function countStatus(indices, whatStatus){
    return indices.filter(e => e.status == whatStatus).length;
  }

  function makeSelectedIndicesArray() {
    var selectedIndicesArray = [];
    $scope.selectedItems.forEach(e => selectedIndicesArray.push(e.index) );
    return selectedIndicesArray;
  }

  $scope.closeSelected = function() {
    if (confirm('Are you sure you want to close '+$scope.selectedItems.length+' indices?')) {
      $http.post('../api/cold-zone-manager/offline', { indices: makeSelectedIndicesArray() } ).then(function (resp) {
        if (resp.status >= 400) {
          notify.warning(`Cluster Responded: ${ notify.describeError(resp.statusText) }`);
        }
        $scope.reload();
      });
    } 
  }

  $scope.openSelected = function(index) {
    if (confirm('Are you sure you want to open '+$scope.selectedItems.length+' indices?')) {
      $http.post('../api/cold-zone-manager/online', { indices: makeSelectedIndicesArray() } ).then(function (resp) {
        if (resp.status >= 400) {
          notify.warning(`Cluster Responded: ${ notify.describeError(resp.statusText) }`);
        }
        $scope.reload();
      });
    } 
  }

  $scope.isSelectionAllClosed = function() {
    return countStatus($scope.selectedItems, 'close') == $scope.selectedItems.length && $scope.selectedItems.length > 0;
  }
  
  $scope.isSelectionAllOpen = function() {
    return countStatus($scope.selectedItems, 'open') == $scope.selectedItems.length && $scope.selectedItems.length > 0;
  }
  
  $scope.willOpeningSelectionExceedMax = function() {
    return $scope.options.maxOpenIndices < $scope.currentOpenIndices + $scope.selectedItems.length
  }

  $scope.niceIndexStatus = function(index) {
    switch(index.status) {
      case 'close':
          return "Closed";
          break;
      case 'open':
          return "Open";
          break;
      default:
          return index.status;
    }
  }
  

  $scope.$on('$destroy', function() {
      $interval.cancel(unsubscribe);
  });
  
});
