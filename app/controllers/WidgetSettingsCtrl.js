myApp.controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', '$widget', 'widget', 'index', function($scope, $timeout, $rootScope, $modalInstance, $widget, widget, index){

    $scope.widget = widget;

    $scope.form = {
        name: widget.name,
        sizex: widget.sizex,
        sizey: widget.sizey,
        col: widget.col,
        row: widget.row
    };

    $scope.sizeOptions = [{id: '1', name: '1'}, {id: '2', name: '2'}, {id: '3', name: '3'}, {id: '4', name: '4'}];

    $scope.dismiss = function() {
        $modalInstance.dismiss();
    };

    $scope.remove = function() {
        $scope.gridster.remove_widget($widget);
        $modalInstance.close();
    };

    $scope.submit = function(form) {
        console.log("submit");
        widget = $scope.form;
        $scope.gridster.remove_widget($widget);
        $timeout(function() {
            $scope.gridster.addWidget(widget);
        }, 300);
        $modalInstance.close(widget)
    };

}]);

// helper code
/*myApp.filter('object2Array', function() {
    return function(input) {
        var out = [];
        for(var i in input){
            out.push(input[i]);
        }
        return out;
    }
});*/

