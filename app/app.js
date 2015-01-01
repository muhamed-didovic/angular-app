'use strict';

// Declare app level module which depends on views, and components
/*angular.module('myApp', [
 'ngRoute',
 'myApp.view1',
 'myApp.view2',
 'myApp.version'
 ]).
 config(['$routeProvider', function($routeProvider) {
 $routeProvider.otherwise({redirectTo: '/view1'});
 }]);*/
/*$(function() {

    $('#open-all').click(function() {
        $('.has-tooltip').trigger('open');
    });

    $('#close-all').click(function() {
        $('.has-tooltip').trigger('close');
    });

    $('.has-tooltip').on('mouseover', function() {
        console.log("#33");
        $('.has-tooltip').not(this).trigger('close');
        $(this).trigger('open');
    });


});*/
var myApp = angular.module('myApp', ['ngRoute', 'ez.gridster', 'mgcrea.ngStrap', 'angularCharts', 'contextMenu', 'ngSanitize']);//'ui.bootstrap'
myApp.config(function($routeProvider) {

    $routeProvider
        .when('/', {
            controller:'AppCtrl',
            templateUrl:'home.html'
        })
        .when('/:job/:type', {
            controller:'ShowCtrl',
            templateUrl:'templates/MessageDetails.html'
        })
        .otherwise({
            redirectTo:'/'
        });
});

myApp.filter('timefilter', function($filter){
    return function(input)
    {
        if(input == null){ return ""; }

        var _date = $filter('date')(new Date(input), 'HH:mm:ss');

        return _date.toUpperCase();

    };
});

myApp.filter('datefilter', function($filter){
    return function(input)
    {
        if(input == null){ return ""; }

        var _date = $filter('date')(new Date(input), 'yyyy/MM/dd');

        return _date.toUpperCase();

    };
});


myApp.factory('Data', function ($filter) {

    var getPerformanceData = performanceSummaryDao(),
        getPerformance = getPerformanceData.getProcessorIdleSummary(),
        getProcessors = getPerformanceData.getProcessorPerformance(),
        getETLjobs = getPerformanceData.getETLJobMessages(),
        getMessages = getPerformanceData.getMemoryProcessorMessages(),
        getEvents = getPerformanceData.getEventsMessages();

    var processorMessages = getMessages.PROCESSOR.EVENTS;
    var memoryMessages = getMessages.MEMORY.EVENTS;
    //console.log(processorMessages.concat(memoryMessages));
    /*var ETLJobs = [], ETLJobsArrayLenght = getETLjobs.length;
    for (var i =0; i < ETLJobsArrayLenght; i++){
        console.log(getETLjobs[i]);
        //if(i != 'NAME'){
            ETLJobs.push(i);
        //}
    }*/


    var dates = [];

    var processObjects = function(dataContainer, firstValue, secondValue, filter){
        var containerLength = dataContainer.length,
            filter = filter || 'datefilter',
            memObj = {},
            tempObj,
            memArray = [];
        //console.log(firstValue, secondValue);
        for (var i=0; i< containerLength; i++) {
            //console.log(obj[t[i].X], t[i].X);
            dataContainer[i][firstValue] = $filter(filter)( dataContainer[i][firstValue] );
            if(!memObj[ dataContainer[i][firstValue] ]){
                memObj[ dataContainer[i][firstValue] ] = [];

            }
            memObj[dataContainer[i][firstValue]].push(dataContainer[i][secondValue]);

            var exist = $.grep(memArray, function(memObj) {
                return memObj[firstValue] === dataContainer[i][firstValue];
            });

            if(exist.length === 0){

                if ( $.inArray(dataContainer[i][firstValue], dates) === -1 ) {
                    dates.push(dataContainer[i][firstValue]);
                }
                tempObj = {};
                tempObj[firstValue] = dataContainer[i][firstValue];
                tempObj[secondValue] = memObj[ dataContainer[i][firstValue] ];
                memArray.push(tempObj);
            }
        }

        return memArray;
    };

    var memoryList = processObjects(memoryMessages, 'TIMESTAMP', 'TYPE');
    var processList = processObjects(processorMessages, 'TIMESTAMP', 'TYPE')
    var eventsList = processObjects(getEvents, 'TIMESTAMP', 'TYPE');


    //console.log(eventsList);
    var jobsList = [];
    for (var i=0; i< getETLjobs.length; i++) {
        var obj = {};
        obj.name =  getETLjobs[i].NAME;
        obj.values =  processObjects(getETLjobs[i].EVENTS, 'TIMESTAMP', 'TYPE');
        jobsList.push(obj);
    }

    /******************************Performance idle summary***************************/
    var processorList = [];
    for (var i in getProcessors){
        if(i != 'DATE_RUN'){
            processorList.push(i);
        }
    }

    var t = [];
    for(var i=0; i < processorList.length; i++){
        t = t.concat(getPerformanceData.getProcessorPerformance()[processorList[i]].TIME_SERIES.slice(0,4));
    }
    //console.log(t);

    var obj = {};
    var arr = [];
    //console.log(t);
    for (var i=0; i< t.length; i++) {
        //console.log(obj[t[i].X], t[i].X);
        t[i].X = $filter('timefilter')( t[i].X );
        if(!obj[t[i].X]){
            obj[t[i].X] = [];

        }
        obj[t[i].X].push(t[i].Y);

        var exist=$.grep(arr, function(obj) {
            return obj.x === t[i].X;
        });

        if(exist.length===0){
            arr.push({
                x : t[i].X,
                y : obj[t[i].X]
            });
        }
    }
    //console.log(arr);
    //var ss = getPerformanceData.getProcessorPerformance().PROCESSOR1.TIME_SERIES;
    var performanceData = {};

    performanceData.performanceIdleSummary = {

        data: [{
            x: "Idle time",
            y: [parseInt(getPerformance.IDLE_TIME)]//,
            //tooltip: "this is tooltip"
        }, {
            x: "ETL jobs",
            y: [parseInt(getPerformance.JOBS)]
        }, {
            x: "Other",
            y: [parseInt(getPerformance.OTHER)]
        }]
    };

    performanceData.processorPerformance = {

        series: ['PROC 1', 'PROC 2', 'PROC 3', 'PROC 4'],
        data :  arr

    };

    return {
        config : '',
        bar: {
            title : 'Processor performance',
            data : performanceData.processorPerformance
        },
        doughnut:{
            title : 'Processor idle summary',
            data : performanceData.performanceIdleSummary
        },
        total : {
            title : '',
            jobsList : jobsList,
            memoryMessages : memoryList,//memoryMessages,
            processorMessages :processList,// processorMessages,
            dates : dates,
            eventsList: eventsList
        },

        events: getEvents,
        processors : processorMessages,
        memories : memoryMessages,
        jobs : getETLjobs

    }

});

myApp.controller('AppCtrl', ['$scope', 'Data', function ($scope, Data) {


    $scope.widgets = [
        {
            //id:1,
            col: "1",
            row: "1",
            sizey: "1",
            sizex: "1",
            name: "Add new...",
            isChartActive: 0,
            isTableActive: 0,
            chartType : 'doughnut',
            data : '',
            title : '',
            config : Data.config
        }/*,
        {
            //id:1,
            col: "1",
            row: "1",
            sizey: "1",
            sizex: "1",
            name: "Add new...",
            isChartActive: 0,
            isTableActive: 0,
            chartType : 'doughnut',
            data : '',
            title : '',
            config : Data.config
        }*/
    ]


    $scope.customOptions = {
        widget_base_dimensions: [550, 550],
        draggable: {
            handle: '.box-header'
        }
    };

    $scope.clear = function () {
        $scope.gridster.remove_all_widgets();
    };

    $scope.addWidget = function () {
        var newWidget = {

            sizey: "1",
            sizex: "1",
            name: "Add new...",
            isChartActive: 0,
            isTableActive :0,
            chartType : 'doughnut',
            data : '',
            title : '',
            config : Data.config
        };
        $scope.gridster.addWidget(newWidget);
    };

    /*$scope.$watch('selectedDashboardId', function(newVal, oldVal) {
     if (newVal !== oldVal) {
     $scope.gridster.setWidgets($scope.dashboards[newVal].widgets);
     }
     });*/

    // init dashboard
    $scope.selectedDashboardId = '1';
    $scope.gridster = false;

    $scope.$watch('gridster', function (newVal) {
        if (newVal) {
            $scope.gridster.setWidgets($scope.widgets);
        }
    });
    //$scope.gridster.setWidgets($scope.widgets);
}]);

myApp.controller('CustomWidgetCtrl', ['$scope', '$modal', 'Data', '$sce', function ($scope, $modal, Data, $sce) {

    $scope.dropList = [
        {
            id: 1,
            name: 'Proc summary',
            firstOption: 'doughnut',
            secondOption: 'pie'

        },
        {
            id: 2,
            name: 'Proc perfomance',
            firstOption: 'bar',
            secondOption: 'line'
        },
        {
            id: 3,
            name: 'Total summary',
            firstOption: 'total',
            secondOption: ''
        }
    ];

    $scope.openSettings = function (e, widget, index) {
        $modal.open({
            scope: $scope,
            templateUrl: 'widget_settings.html',
            controller: 'WidgetSettingsCtrl',
            resolve: {
                $widget: function () {
                    return $(e.currentTarget).parents('.gs-w');
                },
                widget: function () {
                    return widget;
                },
                index: function () {
                    return index;
                }
            }
        });
    };

    $scope.addWidget = function () {
        var newWidget = {

            sizey: "1",
            sizex: "1",
            name: "Add new...",
            isChartActive: 0,
            isTableActive : 0,
            chartType : 'doughnut',
            data : '',
            title : '',
            config : Data.config
        };
        $scope.gridster.addWidget(newWidget);
    };

    $scope.removeWidget = function (e) {
        $scope.gridster.remove_widget($(e.currentTarget).parents('.gs-w'));
    };

    $scope.haveDate = function(purposeObjects, purposeName, date){
        //return "OK";
        var item;
        var exist = $.grep(purposeObjects, function(item){

            if (item[purposeName] == date) {
                return item;
            }

        });

        if(exist.length > 0){
            item = exist[0];
            return item.TYPE.join(" ");
        }

    };

    $scope.countErrors = function(typeOfJob, purposeObjects, purposeName, date, jobName){
        jobName = jobName || '';
        var exist = $.grep(purposeObjects, function(item){
            if (item[purposeName] == date) {
                return item;
            }
        });

        if(exist.length){
            var item = exist[0];
            var result = {};
            var length = item['TYPE'].length;
            for (var i = 0; i < length; ++i) {
                if (!result[item.TYPE[i]])
                    result[item.TYPE[i]] = 0;
                ++result[item.TYPE[i]];
            }
            //console.log(result);
            var html = generateHtml(typeOfJob, result, date, jobName);

            return html;
        }
    };

    var generateHtml = function(typeOfJob, messages, date, jobName){
        var html = '';
        for(var type in messages) {
            //console.log(type, messages);
            html += '<a href="#/'+ typeOfJob + '/' + type.toLowerCase() + '/?date=' + date + '&jobname=' + jobName + '">' + type + ':' + messages[type]+ '</a><br />';

        }
        return html;
    };

    $scope.SkipValidation = function(value) {
        return $sce.trustAsHtml(value);
    };

    //$scope.jobsList = Data.total.jobsList;
    /*$scope.memoryMessages = Data.memoryMessages;
    $scope.processorMessages = Data.processorMessages;
    $scope.dates = Data.dates;
    $scope.eventsList = Data.eventsList;*/

    $scope.showChart = function ($event, widget, item, index) {
        $event.preventDefault();

        var chartType = item.firstOption || 'doughnut';
        widget.config = {
            title: 'Chart',
            tooltips: true,
            labels: false,
            innerRadius: 100,
            mouseover: function () {
                //console.log("mouseover", widget);
            },
            mouseout: function () {
                //console.log("mouseout", widget);
            },
            click: function () {
                console.log("mouseclick", widget, this, chartType);
            },
            legend: {
                display: true,
                //could be 'left, right'
                position: 'right'
            }
        };

        var $dropDown = $(event.target).parents('.box-content').find('.dropdown-menu li'),
            dropDownLength = $dropDown.length;
        var secondOption = '';
        if (dropDownLength > 1) {
            secondOption = item.secondOption;
            item.secondOption = item.firstOption;
            item.firstOption = secondOption;

            $(event.target).parents('.box-content').find('p').remove();
            $(event.target).parents('.box-content').find('.dropdown-menu').addClass('prevent');

            $(event.target).parents('.box-content').find('.dropdown-menu li').each(function(i, ite){
                if (i != index) $(ite).remove();
                else $(ite).find('a').text(item.firstOption);
            });


            if (chartType == 'total') {
                $(event.target).parents('.box-content').find('.dropdown-menu').remove();
                widget.jobsList = Data[chartType].jobsList;
                widget.memoryMessages = Data[chartType].memoryMessages;
                widget.processorMessages = Data[chartType].processorMessages;
                widget.dates = Data[chartType].dates;
                widget.eventsList = Data[chartType].eventsList;
                widget.config.title = Data[chartType].title;
                widget.isTableActive = 1
            } else {

                widget.data = Data[chartType].data;
                widget.config.title = Data[chartType].title;

                if (chartType == 'doughnut') chartType = 'pie';

                widget.chartType = chartType;
                widget.isChartActive = 1;
            }

            $scope.addWidget();
        } else {
            console.log("important", chartType, item.firstOption);

            $(event.target).parents('.box-content').find('.dropdown-menu').addClass('prevent');

            widget.chartType = chartType;

            if (chartType == 'pie') {
                widget.chartType = 'pie';
                widget.config.innerRadius = 0;
            }
            if (chartType == 'doughnut') {
                widget.chartType = 'pie';
                widget.config.innerRadius = 100;
            }

            secondOption = item.secondOption;
            item.secondOption = item.firstOption;
            item.firstOption = secondOption;
            $(event.target).parents('.box-content').find('.dropdown-menu li a').text(item.firstOption);
        }
        //console.log("item", $(event.target), index, $(event.target).parents('.box-content').find('.dropdown-menu li'));


    };


}]);
myApp.controller('ShowCtrl', ['$scope', '$location', '$routeParams', '$filter', 'Data', function ($scope, $location, $routeParams, $filter, Data) {
    var list = Data[$routeParams.job];
    console.log($routeParams);
    var getEvents = function(purposeObjects, purposeName, obj){

        if (obj.jobname){

            purposeObjects = $.grep(purposeObjects, function(item){
                if (item['NAME'] == obj.jobname) {
                    return item;
                }
            });
            purposeObjects = purposeObjects[0].EVENTS;
        }

        var exist = $.grep(purposeObjects, function(item){
            //console.log($filter('datefilter')(item[purposeName]),  item['TYPE'], "-", obj.date, obj.type);
            if ($filter('datefilter')(item[purposeName]) == obj.date && item['TYPE'].toLowerCase() == obj.type) {
                return item;
            }
        });

        if(exist.length){
            return exist;
        }
    };
    $scope.eventList = getEvents(list, 'TIMESTAMP', $routeParams);
}]);

myApp.directive('hoverablePopover', function ($rootScope,  $templateCache, $timeout, $popover, $parse, $sce) {
    /*var getTemplate = function (contentType) {
        return $templateCache.get('templates/popover.html');
    };*/
    return {
        restrict: "A",
        link: function (scope, element, attrs) {

            element.bind('mouseenter', function (e) {
                $timeout(function () {
                    if (!scope.insidePopover) {
                        var i = $parse(attrs.content);
                        var apply = scope.$apply(i);

                        if(apply == undefined) return;

                        scope.popover.$scope.content = apply;
                        scope.popover.show();
                        scope.attachEventsToPopoverContent();
                    }
                }, 200);
            });

            element.bind('mouseout', function (e) {
                $timeout(function () {
                    if (!scope.insidePopover) {

                        scope.popover.hide();
                    }
                }, 400);
            });

        },
        controller: function ($scope, $element, $attrs) {
            //The $attrs will server as the options to the $popover.
            //We also need to pass the scope so that scope expressions are supported in the  popover attributes
            //like title and content.
            $attrs.scope = $scope;

            var popover = $popover($element, $attrs);
            $scope.popover = popover;
            $scope.insidePopover = false;
            //console.log("sdss", popover, $attrs);
            $scope.attachEventsToPopoverContent = function () {

                $($scope.popover.$element).on('mouseenter', function () {
                    //console.log("mouse entter", $attrs,content, $attrs.content);
                    $scope.insidePopover = true;

                });
                $($scope.popover.$element).on('mouseleave', function () {

                    $scope.insidePopover = false;
                    $scope.popover.hide();

                });
            };
        }
    };
});
/*$(document).ready(function() {

    $("[data-toggle=popover]").popover({
        trigger: 'manual',
        animate: false,
        html: true,
        placement: 'left',
        template: '<div class="popover" onmouseover="$(this).mouseleave(function() {$(this).hide(); });"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'

    }).click(function(e) {
        e.preventDefault() ;
    }).mouseenter(function(e) {
        $(this).popover('show');
    });

});*/