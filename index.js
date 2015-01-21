//By http://hapijs.com/
var Hapi = require('hapi');

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8000
});

// Add the route
server.route({
    method: 'GET',
    path:'/hello', 
    handler: function (request, reply) {
       reply('hello world');
    }
});

server.views({
	engines: {html:require('hapi-dust')},
	path: __dirname + "/dust_templates"
});

/*server.route({
    method: 'GET',
    path:'/flickr', 
    handler: function (request, reply) {
		//reference: https://www.npmjs.com/package/request
		var request = require('request');
		request('http://www.google.com', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//console.log(body); // Print the google web page. You can see it in command prompt
				reply(body);
			}
		})

		//reply('Goal is return Flickr JSON');
		//TODO: inclass currently the google home page HTML is outputted in the command window. Change this to output in the browser window!
    }
});*/

/** Conditions
* As a user, I want to see photos tagged with Vancouver. (bonus)
* As a dev, I want my server to 
 (1)emit a thin and light response from the Flickr API 
 (2)which includes the fully resolved JPG hyperlinks of photos
 (3)photos tagged with Vancouver
 (4)Bonus will have jQuery AJAX consume the light response and display HTML images. (I don't take this since I use template)
*/

server.route({
    method: 'GET',
    path:'/flickr', 
    handler: function (request, reply) {
    	//get credentials
    	var credentials = require('./credentials.js'),
		flickrQueryString = {
    	    		"method": 'flickr.photos.search',
    	    		"api_key": credentials.flickr.api_key,
    	    		"tags": 'vancouver',	//(3)photos tagged with Vancouver
    	    		"format": 'json',
    	    		"nojsoncallback": 1
    	    	},
		httpRequest = require('request');

    	//request to flickr
		httpRequest({
			method: 'GET',
			url: 'https://api.flickr.com/services/rest/',
			qs: flickrQueryString,
			json: "true"
		}, 

    	//get response by frickr
		function (error, incomingMessage, response) {
			if (!error && incomingMessage.statusCode == 200) {
				var photos = response.photos.photo,
				uriArray = [],
				uri;

				photos.forEach(function(photo, idx){
					//(2)includes the fully resolved JPG hyperlinks of photos
					uri = "https://farm"+photo.farm+".staticflickr.com/"+photo.server+"/"+photo.id+"_"+photo.secret+".jpg";
					uriArray.push({"uri": uri});					
				});
				
				//(1)emit a thin and light response from the Flickr API
				//Using template
				reply.view('./flickrAssignment.html',{"photos" : uriArray});
			}
		})
    }
});

// Start the server
server.start(function(){
	console.log("Server running at "+server.info.uri);
});