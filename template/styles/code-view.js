(function($){
    $.widget("custom.test", {
        options: {
            id: ""
        },
        _create: function(){
            var $iframe  = $(this.element.find(iframe)),
                $codeView = $("<div>", { id: $iframe.attr('id')})
            this.element.wrap($codeView);
            $codeView = this.element.parent();
        }
    });
}(jQuery))