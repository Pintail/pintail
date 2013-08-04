/* App Global Functions */

function isLink(value) {
    var urlregex = new RegExp("^(http:\/\/|https:\/\/|http:\/\/www.|https:\/\/www.|ftp:\/\/www.|www.){1}([0-9A-Za-z]+.)");
    if (urlregex.test(value.toLowerCase())) {
        return true;
    } else {
        return false;
    }
}

function isImage(value) {
    var urlregex = /([a-z-0-9\/\:.]*.(jpg|jpeg|png|gif))/i;
    if (urlregex.test(value)) {
        return true;
    } else {
        return false;
    }
}

function isDocument(value) {
    var urlregex = /([a-z-0-9\/\:.].(docx|doc|rtf|txt|xls|xlsx|ppt|pptx|pdf))/i;
    if (urlregex.test(value)) {
        return true;
    } else {
        return false;
    }
}

function isVideo(value) {
    var urlregex = /([a-z-_0-9\/\:.].(mp4|ogv|webm|wmv|flv))/i;
    if (urlregex.test(value)) {
        return true;
    } else {
        return false;
    }
}

function isYoutubeVideo(value) {
    var p = /^(?:https?:\/\/)?(?:www.)?(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (value.match(p)) ? RegExp.$1 : false;
}

function isVimeoVideo(value) {
    var m = value.match(/^.+vimeo.com\/(.*\/)?([^#\?]*)/);
    return m ? m[2] || m[1] : false;
}

			// See - http://ctrlq.org/code/19452-embed-youtube-with-javascript
			function embedYoutube() {
				
				// Find all the YouTube video embedded on a page
				var videos = document.getElementsByClassName("youtube"); 
				 
				for (var i=0; i<videos.length; i++) {
				  
				  var youtube = videos[i];
				  
				  if (youtube.children.length == 0) {
					  // Based on the YouTube ID, we can easily find the thumbnail image
					  var img = document.createElement("img");
					  img.setAttribute("src", "http://i.ytimg.com/vi/" 
					                          + youtube.id + "/hqdefault.jpg");
					  img.setAttribute("class", "thumb");
					  
					 
					  // Overlay the Play icon to make it look like a video player
					  var circle = document.createElement("div");
					  circle.setAttribute("class","circle");  
					  
					  youtube.appendChild(img);
					  youtube.appendChild(circle);
					  
					  // Attach an onclick event to the YouTube Thumbnail
					  youtube.onclick = function() {
					 
					    // Create an iFrame with autoplay set to true
					    var iframe = document.createElement("iframe");
					    iframe.setAttribute("src",
					          "https://www.youtube.com/embed/" + this.id 
					        + "?autoplay=1&autohide=1&border=0&wmode=opaque&enablejsapi=1"); 
					    iframe.setAttribute("frameBorder", "0");
					    
					    // The height and width of the iFrame should be the same as parent
					    iframe.style.width  = youtube.offsetWidth + 'px';
					    iframe.style.height = youtube.offsetHeight + 'px';
					    					       
					    // Replace the YouTube thumbnail with YouTube HTML5 Player
					    this.parentNode.replaceChild(iframe, this);
					 
					  }; 				  	
				  }

				}				
				
			}	

function getApiKey() {
	if (apiKey == '' && getCookie('apiKey') != undefined) {
		apiKey = getCookie('apiKey');		
	}	
	return apiKey;	
}

/* App Module */

var currItem = null;
var root = '/temp';	

// home
// home/tags/:tags

// public
// public/tags/:tags
// public/channels/:show		(if 'me' then show channel form at top of list. Support add/edit)
// public/channel/:id

// account
// signin/:apiKey
// signout

var myApp = angular.module('pintail', ['ngResource', 'ngCookies', 'ngSanitize', 'infinite-scroll']).config(['$routeProvider',
function($routeProvider) {
    $routeProvider.when('/home', {
    	title: 'Home',
		templateUrl : 'home.html',
		controller : HomeController
	}).when('/home/tags/:tags', {
    	title: 'Home',
		templateUrl : 'home.html',
		controller : HomeController
	}).when('/public', {
    	title: 'Public',
		templateUrl : 'public.html',
		controller : PublicController
	}).when('/public/channel/:id', {
    	title: 'Public',
		templateUrl : 'public.html',
		controller : PublicController
	}).when('/public/channels/:show', {
    	title: 'Public channels',
		templateUrl : 'publicChannels.html',
		controller : PublicChannelsController
	}).when('/public/channels/:show/:id', {
    	title: 'Edit channel',
		templateUrl : 'publicChannels.html',
		controller : PublicChannelsController
	}).when('/public/tags/:tags', {
    	title: 'Public',
		templateUrl : 'public.html',
		controller : PublicController
	}).when('/signin/:apikey', {
		title: 'Signing in...',
		templateUrl : 'signin.html',
		controller : SignInController
	}).when('/signout', {
		title: 'Signing out...',
		templateUrl : 'signout.html',
		controller : SignOutController
	}).when('/account', {
		title: 'My Account',
		templateUrl : 'account.html',
		controller : AccountController
	}).when('/welcome', {
		title: 'Welcome to Pintail',
		templateUrl : 'welcome.html',
		controller : WelcomeController
	}).otherwise({
		redirectTo : '/home'
	});
}]);
myApp.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    	if (current.$$route != undefined)
        	$rootScope.title = current.$$route.title;
    });
}]);

myApp.factory('dataService', function($http, $q) {
    var dataService = {
		serviceUrl : '/',
		authenticate : function(apiKey) {
			var deferred = $q.defer();
			$http.get('/authenticate/' + apiKey + noCache('?')).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;			
		},
    	searchItems : function(scope, tags, keyword, filter, channelId, page) {
			var deferred = $q.defer();
			$http.get('/items?apikey=' + apiKey + 
						    '&page=' + page.toString() + 
						    '&scope=' + scope.toString() + 
						    '&tags=' + tags + 
						    '&keyword=' + keyword + 
						    '&channel=' + channelId + 
						    '&type=' + filter.type + 
						    '&starred=' + filter.isStarred + 
						    '&pinned=' + filter.isPinned + 
						    noCache('&')).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;
		},
		save : function(item) {
			var deferred = $q.defer();
			$http.post('/items?apikey=' + apiKey, item).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;
		},
		update : function(item) {
			var deferred = $q.defer();
			$http.post('/item/' + item._id + '?apikey=' + apiKey, item).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;
		},
		remove : function(item) {
			var deferred = $q.defer();
			$http.delete('/item/' + item._id + '?apikey=' + apiKey).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;
		},
		star : function(item) {
			var deferred = $q.defer();
			$http.get('/item/' + item._id + '/star?apikey=' + apiKey).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;
		},
		pin : function(item, tags) {
			var deferred = $q.defer();
			$http.get('/item/' + item._id + '/pin/private?apikey=' + apiKey + '&tags=' + tags).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;
		},		
		updateProfile : function(user) {
			var deferred = $q.defer();
			$http.post('/user?apikey=' + apiKey, user).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;
		},
		searchChannels : function(scope, view, tags, page) {
			var deferred = $q.defer();		
			$http.get(dataService.serviceUrl + 'channels/?apikey=' + getApiKey() + 
						    '&page=' + page.toString() + 
						    '&scope=' + scope.toString() + 
						    '&view=' + view + 
						    '&tags=' + tags + 
						    noCache('&')).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;				
		},
		getChannel : function(id) {
			var deferred = $q.defer();	
			$http.get('/channel/' + id + '?apikey=' + getApiKey()).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;			
		},
		saveChannel : function(channel) {
			var deferred = $q.defer();
			$http.post('/channel?apikey=' + apiKey, channel).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;			
		},
		updateChannel : function(channel) {
			var deferred = $q.defer();
			$http.post('/channel/' + channel._id + '?apikey=' + apiKey, channel).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;			
		},
		follow : function(channel) {
			var deferred = $q.defer();
			$http.get('/channel/' + channel._id + '/follow?apikey=' + apiKey, channel).then(function(response) {
				deferred.resolve(response.data);
			});
			return deferred.promise;			
		}       
    };
    return dataService;
});

/* Controllers */

function WelcomeController($scope, $routeParams, $cookieStore, $location, dataService) {
	setTimeout(function(){resize()}, 20);
	$('#scopeIcon').attr('class', 'icon-user');
}

function HomeController($scope, $routeParams, $cookieStore, $location, dataService) {
	setTimeout(function(){resize()}, 20);
	$('#scopeIcon').attr('class', 'icon-user');
	$('.menu-teams').attr('href', '#/home');
	var $rootScope = getAngular();
    $rootScope.$broadcast('changeScope', 1);		
}

// Public stream, display specific public channel
function PublicController($scope, $routeParams, $cookieStore, $location, dataService) {
	setTimeout(function(){resize()}, 20);
	$('#scopeIcon').attr('class', 'icon-globe');
	$('.menu-teams').attr('href', '#/public');
	var $rootScope = getAngular();
    $rootScope.$broadcast('changeScope', 2);
    	
    $scope.title = "Public bookmarks";
	$scope.user = null;
	$scope.channel = null;
	$scope.permissions = {isAuthor: false, isOwner: false, isFollower: false };

    if ($routeParams.id != undefined) {
    	$scope.title = "Loading...";
    	dataService.getChannel($routeParams.id).then(function(data) {
    		$scope.title = data.title;
    		$scope.channel = data;
    		
    		if (getCookie('apiKey') != undefined) {
    			dataService.authenticate(getCookie('apiKey')).then(function(data) {
    				$scope.user = data.user;
    				$scope.bindPermissions();   
    			});
    		}
    		
            //if ($scope.user != null)
            //	$scope.bindPermissions();      		
    	});
    }
    
    $scope.$on('authenticated', function(event, user) {
    	$scope.user = user;            
    });     
    
    $scope.bindPermissions = function() {
    	// Are you a follower?
    	if ($scope.channel.followers.indexOf($scope.user._id) != -1) {
    		$scope.permissions.isFollower = true;
    	}    	
    	
   		// Are you an owner? Show edit/delete buttons -
    	if ($scope.channel.owners.indexOf($scope.user._id) != -1) {
    		$scope.permissions.isOwner = true;
    	}
    		
    	// Are you an author?
    	if ($scope.channel.authors.findByKey('_id', $scope.user._id) != null) {
    		$scope.permissions.author = true;
    		$("#form-tags").importTags($scope.channel.tags.toString()); 
    	} else {
    		$('#form').hide();
    	}   	
    }
    
    $scope.follow = function(channel, $event) {
    	dataService.follow(channel).then(function(data) {
			 if ($scope.permissions.isFollower) {
			 	$scope.permissions.isFollower = false;
			 	showAlert('You are no longer following this channel.', 'success');
			 } else {
			 	$scope.permissions.isFollower = true;
			 	showAlert('You are now following this channel!', 'success');
			 }
    	});    	
    	$scope.stopEvent($event);
    }
    
    $scope.parseAuthors = function(channel) {
    	if (channel != null) {
	    	var authors = '';
	    	for (var i = 0; i < channel.authors.length; i++)
	    		authors += channel.authors[i].displayName + ', ';
	    		
	    	return authors;    		
    	}
    }
    
    $scope.parseDescription = function(channel) {
    	if (channel != undefined) {
    		return channel.description;
    	} else if ($routeParams.id != undefined) {
    		return "";
    	} else {
    		if ($scope.user == null)
    			return 'Following <a href="#/public/channels/following" class="titleBtn">0</a> channels. <a href="#/public/channels/all" class="titleBtn">Discover</a> more, or <a href="#/public/channels/me" class="titleBtn">add one</a>.';
    		else
    			return 'Following <a href="#/public/channels/following" class="titleBtn">' + $scope.user.following + '</a> channels. <a href="#/public/channels/all" class="titleBtn">Discover</a> more, or <a href="#/public/channels/me" class="titleBtn">add one</a>.';
    	}
    }
    
    $scope.stopEvent = function($event) {
		if ($event.stopPropagation) $event.stopPropagation();
	    if ($event.preventDefault) $event.preventDefault();
	    $event.cancelBubble = true;
	    $event.returnValue = false;	    	
    }      
}

// Lists channels, create/edit a channel
function PublicChannelsController($scope, $routeParams, $cookieStore, $location, dataService) {
	setTimeout(function(){ resize(); }, 20);
	$('#scopeIcon').attr('class', 'icon-globe');
	$('.menu-teams').attr('href', '#/public');
	var $rootScope = getAngular();
    $rootScope.$broadcast('changeScope', 2);

	$scope.show = $routeParams.show;
	$scope.title = "";
	$scope.tags = [];

	if (getCookie('apiKey') == undefined) {
	  	// Unauthenticated:
	   	window.location = root + '#/welcome';
    } else {
		dataService.authenticate(getCookie('apiKey')).then(function(data) {
			if (data.status == true) {
				$scope.apiKey = getCookie('apiKey');
				apiKey = $scope.apiKey;
				$scope.user = data.user;
				
			    $("#filter-channel-taglist").tagsInput({ 
			    	defaultText: 'Filter by tag...',
			    	placeholderColor : '#ccc',
			        autocomplete_url: '/tags?apikey=' + apiKey + '&scope=1',
			        onAddTag: function(tag) { 
			            var $rootScope = getAngular();
					    $rootScope.$broadcast('addChannelTag', tag);
			        },
			        onRemoveTag: function(tag) { 
			            var $rootScope = getAngular();
			    	    $rootScope.$broadcast('removeChannelTag', tag);
			        }
			    });  

				if ($scope.show != 'edit') 
					$scope.searchChannels();

				if ($scope.show == 'me' || $scope.show == 'edit') {
					$(".form-public-channel-tags").tagsInput({ 
						defaultText: 'Add a tag...',
						placeholderColor : '#ccc',
						autocomplete_url: '/tags?apikey=' + apiKey + '&scope=1'
					});	
					$(".form-public-channel-authors").tagsInput({ 
						defaultText: 'Add username...',
						placeholderColor : '#ccc'
					});						
				}
				if ($scope.show == 'me') {
					$scope.title = "My Channels";
					$scope.channel = { scope: 2, scopeKey: '', title: '', description: '', avatarUrl: $scope.user.avatarUrl, tags: [], authors: [], followers: [] };

				    $('#form-public-channel-title').focus(function() {
				        $('#form-sub-channel').slideDown('fast', function() { resize(); });
				    });    
				    $('#form-public-channel-title').blur(function() {
				        if ($('#form-public-channel-title').val() == '')
				            $('#form-sub-channel').slideUp('fast');
				    }); 
					
					$(".form-public-channel-authors").importTags($scope.user.username);				
				} else if ($scope.show == 'edit') {
					$scope.title = "Edit Channel";
					$('#form-sub-channel').show();
					
					dataService.getChannel($routeParams.id).then(function(data) {
						$scope.channel = data;
	    				var authors = [];
	    				
	    				for (var i = 0; i < $scope.channel.authors.length; i++)
	    					authors.push($scope.channel.authors[i].username);
	    					
						$(".form-public-channel-tags").importTags($scope.channel.tags.toString());	
						$(".form-public-channel-authors").importTags(authors.toString());	
					});				
				} else if ($scope.show == 'following') {
					$scope.title = "Following Channels";	
				} else if ($scope.show == 'all') {
					$scope.title = "Discover new Channels";					
				}								
			} else {
				// Unauthenticated:
				$cookieStore.remove('apiKey');				
				window.location = root + '#/welcome';
			}		
		});
	}	
	
	$scope.searchChannels = function (paging) {
    	var go = true;
    	if (!paging) {
    		$scope.items = [];
    		$scope.page = 0;
    		$scope.pageRes = -1;
    		$scope.busy = false;
    	} else if ($scope.pageRes == 0) {
    		go = false;
    	}
    	
    	if (!$scope.busy && go) {
	    	$scope.busy = true;
	        dataService.searchChannels(2, $scope.show, $scope.tags, $scope.page).then(function(data) { 	
	        	$scope.channels = data;
	    		//$scope.bindItems();

	    		$scope.pageRes = data.length;
	    		if (data.length > 0)
	    			$scope.page = $scope.page + 1;
	      		$scope.busy = false;	        	
	        });
		}	
	}
	
	$scope.save = function () {
		var tags = $('.form-public-channel-tags').val().split(',');
		for (var i = 0; i < tags.length; i++)
			tags[i] = tags[i].toLowerCase();		
		var usernames = $('.form-public-channel-authors').val().split(',');
		for (var i = 0; i < usernames.length; i++)
			usernames[i] = usernames[i].toLowerCase();	

		var channel = {
			scope: 2,
			title: $scope.channel.title,
			description: $scope.channel.description,
			avatarUrl: $scope.channel.avatarUrl,
			tags: tags,
			authors: usernames
		};
		
		if ($scope.channel._id != undefined) {
			channel._id = $scope.channel._id;
			dataService.updateChannel(channel).then(function(data) {
				// showAlert('Your channel has been updated successfully.', 'success');
				window.location = '#/public/channel/' + data._id;
			});					
		} else {
			dataService.saveChannel(channel).then(function(data) {
				// showAlert('Your channel has been saved successfully.', 'success');
				window.location = '#/public/channel/' + data._id;
			});			
		}			
	}	
	
	$scope.addChannelTag = function(tag, $event) {
        if ($scope.tags.indexOf(tag) == -1) {
        	$("#filter-channel-taglist").addTag(tag);
	    	$scope.tags.push(tag);
	        $scope.searchChannels();    
		}  		
		$scope.stopEvent($event);
	}
    $scope.$on('addChannelTag', function(event, tag) {
        $scope.$apply(function() {
        	if ($scope.tags.indexOf(tag) == -1) {
	            $scope.tags.push(tag);
	            $scope.searchChannels();    
            }  
        });
    });   
    $scope.$on('removeChannelTag', function(event, tag) {
        $scope.$apply(function() {
            $scope.tags.remove(tag);
            $scope.searchChannels();              
        });
    });  
    
    $scope.stopEvent = function($event) {
		if ($event.stopPropagation) $event.stopPropagation();
	    if ($event.preventDefault) $event.preventDefault();
	    $event.cancelBubble = true;
	    $event.returnValue = false;	    	
    }    	
	
    $('#list-public-channels').on("click", ".email-subject, .email-avatar", function(e) {    
    	var ele = $(this).closest('.email-item'); 
        window.location = "#/public/channel/" + ele.attr('data-id'); 
    });  	
}

function SignInController($scope, $routeParams, $cookieStore, $location, dataService) {
	var future = new Date();
	future.setDate(future.getDate() + 30);	
	
	//alert($routeParams.apikey);

	var expires = "; expires=" + future.toGMTString();
    document.cookie = 'apiKey' + "=" + $routeParams.apikey + expires + "; path=/";

	window.location = root;
}

function SignOutController($scope, $routeParams, $cookieStore, $location, dataService) {
	//$cookieStore.remove('apiKey');
	deleteCookie('apiKey');

	window.location = root + '#/welcome';
}

function AccountController($scope, $routeParams, $cookieStore, $location, dataService) {
	setTimeout(function(){resize()}, 20);
	$('#scopeIcon').attr('class', 'icon-user');
	
    if (getCookie('apiKey') == undefined) {
    	// Unauthenticated:
    	window.location = root + '#/welcome';
    } else {
		dataService.authenticate(getCookie('apiKey')).then(function(data) {
			if (data.status == true) {
				$scope.apiKey = getCookie('apiKey');
				apiKey = $scope.apiKey;
								
				$scope.user = data.user;
				$scope.userDisplayName = data.user.displayName;
				$(".form-user-tags").tagsInput({ 
					defaultText: 'Add a tag...',
					placeholderColor : '#ccc',
					autocomplete_url: '/tags?apikey=' + apiKey + '&scope=1'
				});	
				$(".form-user-tags").importTags($scope.user.tags.toString());
			} else {
				// Unauthenticated:
				$cookieStore.remove('apiKey');				
				window.location = root + '#/welcome';
			}		
		});
	}
	
	$scope.save = function () {
		var tags = $('.form-user-tags').val().split(',');
		for (var i = 0; i < tags.length; i++)
			tags[i] = tags[i].toLowerCase();
		var user = {
			displayName: $scope.user.displayName,
			username: $scope.user.username,
			tags: tags
		};
		dataService.updateProfile(user).then(function(data) {
			var $rootScope = getAngular();
			$rootScope.$broadcast('updateUser', user);				
			$scope.userDisplayName = user.displayName;		
			
			showAlert('Your profile has been updated successfully.', 'success');
		});
	}
}

function Controller($scope, $rootScope, $routeParams, $filter, $cookieStore, dataService) {
	$scope.query = '';
    $scope.orderProp = 'idIndex';
	$scope.busy = true;
  	$scope.page = 0;  
  	$scope.pageRes = -1; 
    $scope.types = 'all';
    $scope.items = [];
    $scope.prefiltered = [];
    $scope.filter = { type: '', isStarred: false, isPinned: false };
    $scope.tags = [];
    $scope.apiKey = '';
    $scope.scope = 1;
    $scope.user = null;
    $scope.userDisplayName = '';
    $scope.item = { link: '', type: 'webpage', subject: '', tags: '', comment: '', isStarred: false, isImportant: false };
    
    $scope.dataView = { query: '', tags: [], filterOrder: '', filterType: '' };
    $scope.subjectLoaded = false;

	// Used in the views as well -
    $scope.showStream = function() {
		return (window.location.hash.toLowerCase().indexOf('#/home') === 0 || 
		        window.location.hash.toLowerCase() == '#/public' ||
		        window.location.hash.toLowerCase().indexOf('#/public/channel/') === 0);   	
    }
    
    if (getCookie('apiKey') == undefined) {
    	// Unauthenticated:
    	if (window.location.hash.toLowerCase().indexOf('#/signin') != 0 && 
    	    window.location.hash.toLowerCase().indexOf('#/public/channel/') != 0)
    	    
    		window.location = root + '#/welcome';
    } else {
		dataService.authenticate(getCookie('apiKey')).then(function(data) {
			if (data.status == true) {
				// Signed in:
				$scope.apiKey = getCookie('apiKey');
				$scope.user = data.user;
				$scope.userDisplayName = data.user.displayName;
				apiKey = $scope.apiKey;
				setTimeout(function(){resize()}, 20);
				
			    var $rootScope = getAngular();
			   	$rootScope.$broadcast('authenticated', $scope.user);					

			    // Tags Input
			    $("#form-tags").tagsInput({ 
			    	defaultText: 'Add a tag...',
			    	placeholderColor : '#ccc',
			        autocomplete_url: '/tags?apikey=' + apiKey + '&scope=1'
			    });	    
			    $("#filter-taglist").tagsInput({ 
			    	defaultText: 'Add a tag...',
			    	placeholderColor : '#ccc',
			        autocomplete_url: '/tags?apikey=' + apiKey + '&scope=1',
			        onAddTag: function(tag) { 
			            var $rootScope = getAngular();
					    $rootScope.$broadcast('addTag', tag);
			        },
			        onRemoveTag: function(tag) { 
			            var $rootScope = getAngular();
			    	    $rootScope.$broadcast('removeTag', tag);
			        }
			    });  
			    
			    if ($routeParams.tags != undefined) {
			    	$('#filter-tags').slideDown('fast');
            		$scope.tags = $routeParams.tags.split(",");
            		for (var i = 0; i < $scope.tags.length; i++) {
            			$scope.tags[i] = $scope.tags[i].toLowerCase();		
	    				$("#filter-taglist").addTag($scope.tags[i]);
            		}
			    }
			   
			   	$scope.busy = false;
			   	$scope.search();			
				
			} else {
				// Unauthenticated:
				$cookieStore.remove('apiKey');
				window.location = root + '#/welcome';
			}
		});    	
    }
    
    $scope.search = function (paging) {
    	var go = true;
    	if (!paging) {
    		$scope.items = [];
    		$scope.prefiltered = [];
    		$scope.page = 0;
    		$scope.pageRes = -1;
    		$scope.busy = false;
    	} else if ($scope.pageRes == 0) {
    		go = false;
    	}
    		
    	if (!$scope.busy && go) {
	    	$scope.busy = true;

	        $scope.dataView.tags =  $scope.tags;
	        $scope.dataView.query =  $scope.query;
	        var channelId = '';
	        
	        if (window.location.hash.toLowerCase().indexOf('#/public/channel/') === 0) {
	        	// Request a specific public channel - 
	        	channelId = window.location.hash.toLowerCase().replace("#/public/channel/","");
	        }
	        
	        dataService.searchItems($scope.scope, $scope.tags, $scope.query, $scope.filter, channelId, $scope.page).then(function(data) { 
	    		for (var i = 0; i < data.length; i++) {
	    			if (data[i].type == 'note' && data[i].tags.indexOf("tasks") > -1)
	    				data[i].type = "task";
	    			if ($scope.items.findByKey('_id', data[i]._id.toString()) == null) {	
	        			$scope.items.push(data[i]);
	        			$scope.prefiltered.push(data[i]);
	        		}
	      		}
	    		
	    		$scope.bindItems();

	    		$scope.pageRes = data.length;
	    		if (data.length > 0)
	    			$scope.page = $scope.page + 1;
	      		$scope.busy = false;
	    	});
    	}
    }
    
    $scope.bindItems = function () {
    	// Wait for DOM to be created -
    	setTimeout(function() { 
			$('.email-desc').expander({ 
				slicePoint:       180,
    			expandText:       'more',
    			userCollapseText: 'less'
    		});		
    		embedYoutube();
		}, 100);
    }
    
    $scope.save = function () {
    	if (!isLink($scope.item.link)) {
    		$scope.item.subject = $scope.item.link;
    		$scope.item.link = '';
    		$scope.item.type = 'note';
    	}
    	if (isImage($scope.item.link)) {
    		$scope.item.type = 'image';
    	}
    	if (isDocument($scope.item.link)) {
    		$scope.item.type = 'document';
    	}    
    	if (isVideo($scope.item.link)) {
    		$scope.item.type = 'media';
    	}     
    	if (isString(isYoutubeVideo($scope.item.link))) {
    		$scope.item.type = 'media';
    	}
    	if (isString(isVimeoVideo($scope.item.link))) {
    		$scope.item.type = 'media';
    	}       	 	
		
		var item = {
						link: $scope.item.link,		
					    subject: $scope.item.subject,          
					    comment: $scope.item.comment, 
					    type: $scope.item.type,
					    scope: $scope.scope,
					    tags: $('#form-tags').val().split(','),
					    isStarred: $scope.item.isStarred,
					    isImportant: $scope.item.isImportant
			    	};  	
		if ($scope.item._id != undefined) {
			item._id = $scope.item._id;
			dataService.update(item).then(function(data) {
				showAlert('Item updated successfully.', 'success');
				$scope.updateItemInList(data, 'update');	
				$scope.reset();				
			});					
		} else {
			dataService.save(item).then(function(data) {
				showAlert('Item saved successfully.', 'success');
				$scope.updateItemInList(data, 'create');	
				$scope.reset();				
			});				
		}	    					    	
    }
    
     $scope.remove = function (item) {
     	if (confirm('Are you sure you wish to remove this item?')) {
			dataService.remove(item).then(function(data) {
				showAlert('Item removed successfully.', 'success');		
				$scope.updateItemInList(item, 'delete');	
			});	 	
		}
    }  
    
    $scope.edit = function (item, $event) {
    	var clone = angular.copy(item);
    	if (clone.type == 'note' || clone.type == 'task') {
    		clone.link = clone.subject;
    		clone.subject = '';
    		$scope.subjectLoaded = false;
    	} else {
    		$scope.subjectLoaded = true;
    	}
		
		$scope.item = clone;
		setTimeout(function(){ $("#form-comments").trigger('update'); }, 20);
		$("#form-tags").importTags(clone.tags.toString());
		$('#form-url').focus();    
		
	    $scope.stopEvent($event);			
    }
    
     $scope.reset = function () {
		$scope.item = { link: '', type: 'webpage', subject: '', tags: $scope.tags, comment: '', isStarred: false, isImportant: false };
		delete $scope.item._id;
		$scope.subjectLoaded = false;
		$("#form-tags").importTags($scope.tags.toString());
		$('#form-url').focus();     	
     }
    
    $scope.star = function (item) {
		dataService.star(item).then(function(data) {
			if (data.isStarred)
				showAlert('Item has been starred.', 'success');
			else
				showAlert('Item has been un-starred.', 'success');
			
			$scope.updateItemInList(data, 'update');		
			//$scope.search(); 	
		});	     	
    }
    
    $scope.pin = function (item) {
    	if ($scope.tags.length == 0) {
    		showAlert('Filter by tag(s) first.', 'error');
    	} else {
			dataService.pin(item, $scope.tags).then(function(data) {
				if (data.isPinned)
					showAlert('Item has been pinned for these tags.', 'success');
				else
					showAlert('Item has been un-pinned for this tags.', 'success');
				
				$scope.updateItemInList(data, 'update');		
				//$scope.search(); 	
			});	     		
    	}    	
    }    
    
    $scope.filterBy = function (val) {
    	if (val == 'all') {
    		//$scope.items = $scope.prefiltered;	
    		$scope.dataView.filterOrder =  '';
    		$scope.dataView.filterType =  '';
    		$scope.filter = { type: '', isStarred: false, isPinned: false };
    	} else if (val == 'starred') {
    		$scope.filter = { type: '', isStarred: true, isPinned: false };
    		$scope.dataView.filterOrder =  'starred';
    	} else if (val == 'pinned') {
    		$scope.filter = { type: '', isStarred: false, isPinned: true };
    		$scope.dataView.filterOrder =  'pinned';
    	} else {
    		$scope.dataView.filterType =  val + "s";
    		$scope.filter = { type: val, isStarred: false, isPinned: false };
    	} 
    	
    	$scope.search();		
 
    }
    
    $scope.updateItemInList = function(item, action) {
    	if (action != 'create') {
			for (var i = 0; i < $scope.items.length; i++) {
				if ($scope.items[i]._id == item._id) {
					if (action == 'update') {
						angular.extend($scope.items[i], item);
						angular.extend($scope.prefiltered[i], item);
					} else if (action == 'delete') {
						$scope.items.splice(i, 1);
						$scope.prefiltered.splice(i, 1);
					}
					break;
				}
			}	
		} else {
			$scope.items.unshift(item);
			$scope.prefiltered.unshift(item);
		}		
		$scope.bindItems();    	
    }
    
    $scope.getDataView = function() {
    	var output = '';
    	var title = '';
    	if ($scope.dataView.query != '') {
    		output += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Keyword: <b>' + $scope.dataView.query + '</b>';
    		title += 'Keyword - ' + $scope.dataView.query;
    	}
    	if ($scope.dataView.tags.length > 0) {
    		output += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tags: <b>' + $scope.dataView.tags + '</b>';
    		title += 'Tags - ' + $scope.dataView.tags;
    	}
    	if ($scope.dataView.filterOrder != '') {
    		output += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Showing: <b>' + $scope.dataView.filterOrder + '</b>';    
    		title += 'Showing - ' + $scope.dataView.filterOrder;	
    	}	
    	if ($scope.dataView.filterType != '') {
    		output += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Showing: <b>' + $scope.dataView.filterType + '</b>';    
    		title += 'Showing - ' + $scope.dataView.filterType;		
    	}
    	
    	$rootScope.title = title;	    		
    	return output;
    }
    
    $scope.parseComment = function(item) {
    	var converter = new Showdown.converter();
		return converter.makeHtml(item.comment);
    }
    
    $scope.parseContent = function(item) {
    	if (isString(isYoutubeVideo(item.link))) {
    		return '<div class="youtube" id="' + isYoutubeVideo(item.link) + '"></div>';
    	} else if (isImage(item.link)) {
    		return '<img src="' + item.link  + '" class="embed-image" />';
    	} else {
    		return '';
    	}
    }
    
    $scope.stopEvent = function($event) {
		if ($event.stopPropagation) $event.stopPropagation();
	    if ($event.preventDefault) $event.preventDefault();
	    $event.cancelBubble = true;
	    $event.returnValue = false;	    	
    }
    
    $scope.getFlagClasses = function(item) {
    	var classes = '';
    	if (item.isStarred)
    		classes += 'email-item-starred ';
    	if (item.isPinned)
    		classes += 'email-item-pinned ';    		
    	return classes;
    }
    
    $scope.addTag = function (tag, $event) {
    	if ($scope.tags.indexOf(tag) == -1) {
    		$('#filter-tags').slideDown('fast');
	    	$("#filter-taglist").addTag(tag);
	    	$scope.tags.push(tag);
	        $scope.search();  	
       }
       $scope.stopEvent($event);
    }
    $scope.$on('addTag', function(event, tag) {
        $scope.$apply(function() {
        	if ($scope.tags.indexOf(tag) == -1) {
	            $scope.tags.push(tag);
	            $scope.search();    
            }  
        });
    });   
    $scope.$on('removeTag', function(event, tag) {
        $scope.$apply(function() {
            $scope.tags.remove(tag);
            $scope.search();              
        });
    });     
    
    $scope.$on('changeScope', function(event, scope) {
        //$scope.$apply(function() {
            $scope.scope = scope;     
            $scope.search();       
        //});
    });     
    
    $scope.$on('updateSubject', function(event, subject) {
        $scope.$apply(function() {
        	subject = subject.toString();
        	if (subject.substring(0, 1) == ',') { 
  				subject = subject.substring(1);
			}
            $scope.item.subject = subject;    
            $('#form-subject').width($('#form-subject').parent().width()-14);   
            $scope.subjectLoaded = true;      
        });    	
    }); 
    
    $scope.$on('updateUser', function(event, user) {
		$scope.userDisplayName = user.displayName;		
		$scope.user.tags = 	user.tags; 
    });
    
    $('#form-url').blur(function() {
    	var txt = $(this);
        $scope.$apply(function() {
            if (txt.val() != '' && $scope.item._id == undefined)   {
            	
            		if (isImage(txt.val()) || isDocument(txt.val()) || isVideo(txt.val())) {
						$scope.subjectLoaded = true;  
		            	$scope.item.subject = txt.val();	            			
            		} else {
			            	if (isLink(txt.val())) {
								// query: select * from html where url="http://some.url.com" and xpath='//title'
								var yql_url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodeURIComponent(txt.val()) + "%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Ftitle'&format=json&callback=?";
								 
								$.getJSON(yql_url, function(json) {
								  if (json && json.query && json.query.results && json.query.results.title) {
			            			var $rootScope = getAngular();
			    	    			$rootScope.$broadcast('updateSubject', json.query.results.title);				    
								  }
								});            		
			            	} else {								
		            			$scope.subjectLoaded = false;  
		            			$scope.item.subject = '';	
		            		}	            			
            		}
					
            }         
        });
	});
	   
	$('#list').on("click", ".email-content .toggle", function(e) {  
		var host = $(this).closest('.email-content');
		var content = host.find('.content');
		
		if ($(this).attr('data-state') == 'visible') {
			$(this).attr('data-state',  'hidden');
			$(this).html('<a href="#">Show ' + $(this).attr('data-type') + '</a>');
			host.find('.content').hide();
		} else {
			$(this).attr('data-state',  'visible');
			$(this).html('<a href="#">Hide ' + $(this).attr('data-type') + '</a>');
			host.find('.content').show();
		}
		
		return false;
	});   
	    
    $('#list').on("click", ".email-subject, .email-avatar", function(e) {    
    	var ele = $(this).closest('.email-item'); 
        if (currItem != null) {
            currItem.slideUp('fast');
            if (currItem.html() != ele.find('.ctrlbar').html()) {                    
                ele.find('.ctrlbar').slideDown('fast'); 
                currItem = ele.find('.ctrlbar'); 
            } else {
                 ele.find('.ctrlbar').slideUp('fast'); 
                 currItem = null;
            }
        } else {
            ele.find('.ctrlbar').slideDown('fast'); 
            currItem = ele.find('.ctrlbar'); 
        }  
    });      
}

/* Functions */

function noCache(c) {
    return c + '_=' + Math.random();
	//return '';
}