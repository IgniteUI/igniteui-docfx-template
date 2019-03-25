document.addEventListener('lazyloaded', function(e){
    $(e.target).parent().removeClass("loading");
});