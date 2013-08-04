// Code goes here

var apiKey = '';

function getAngular() {
    var $doc = angular.element(document);
	return $doc.scope();
}

function getAngularService(service) {
	// See: http://stackoverflow.com/questions/13613288/angularjs-i-need-to-update-a-service-from-outside-of-angular
	var $doc = angular.element(document);
	var $injector = $doc.injector();
	return $injector.get(service);
}

function resize() {
    $('#form-url').width($('#form-url').parent().width()-14);
    $('#form-subject').width($('#form-subject').parent().width()-14);
    $('#form-search').width($('#form-search').parent().width()-14);
    $('#form-search input').width($('#form-search').parent().width()-14);
    $('#form-comments').width($('#form-comments').parent().width()-24);    
    
    $('#form-user-displayName').width($('#form-user-btn').width()+14);
    $('#form-user-username').width($('#form-user-btn').width()+14);
    
    $('#form-public-channel-title').width($('#form-public-channel-btn').width()+14);
    $('#form-public-channel-description').width($('#form-public-channel-btn').width()+14);
}

$(function() {	  
    $(".tagsinput").css('margin', '0 auto');
    $(".tagsinput").css('margin-bottom', '10px');
    $('#form-sub').slideUp('fast');   
    $("#form-comments").expandable({ maxRows: 16, by: 1 });
    
    $(window).resize(function(){
        resize();
    });    
    resize();    
    $.scrollUp({ scrollText: '^' });
    
    $('#form-url').focus(function() {
        $('#form-sub').slideDown('fast', function() { resize(); });
    });    
    $('#form-url').blur(function() {
        if ($('#form-url').val() == '')
            $('#form-sub').slideUp('fast');
    });       

    $('#showTags, .menu-tags').on("click", function(e){   
        $('#filter-tags').slideToggle('fast');
        return false;
    });
    $('.menu-teams').on("click", function(e){   
        $('.horiz-group').fadeToggle('fast');
        //return false;
    });    
});


