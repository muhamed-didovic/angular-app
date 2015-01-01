var ngContextMenu = angular.module('contextMenu', []);

ngContextMenu.directive('context', [ function() {
    return {
        restrict    : 'A',
        scope       : '@&',
        //scope       : {},
        compile: function(tElement, tAttrs, transclude) {
            return {
                post : function (scope, iElement, iAttrs) {//postLink

                    var $ul = iElement.find('.' + iAttrs.context),
                        last = null, hide = false;
                    //console.log("scope", scope,  iAttrs.menuid,  iElement.html());
                    $ul.css({ 'display' : 'none'});



                    $('.box-content', iElement).on('click',function(event) {

                        if ($ul.hasClass('prevent') || iElement.find('.' + iAttrs.context).length < 1) {
                            $ul.removeClass('prevent')
                            return;
                        }

                        event.preventDefault();
                        console.log('iElement', $ul.attr('class'), iElement.find('.' + iAttrs.context).length);
                        $ul.css({
                            position: "fixed",
                            display: "block",
                            left: event.clientX + 'px',
                            top:  event.clientY + 'px'
                        });
                        //elem = $(event.target);
                        last = event.timeStamp;

                    });

                    $(document).on('click', function(event) {

                        var target = $(event.target);

                        if(!target.is(".box-content")) {
                            if(last === event.timeStamp){
                                return;
                            }
                            $ul.css({
                                'display' : 'none'
                            });
                        }

                    });
                }
            };
        }
    };
}]);
