var http = require("http");
var fs = require('fs');
var url = require("url");
var path = require('path');

var mimeTypes = {
	'.js' : 'text/javascript',
	'.html' : 'text/html',
	'.css' : 'text/css' ,
	'.jpg' : 'image/jpeg',
	'.gif' : 'image/gif'
};

http.createServer(function onRequest(request, response) {
	var postData = "";
	var pathname = url.parse(request.url).path;
	if(pathname == '/')
		pathname = '/index.html';
	var extname = path.extname(pathname);
	var mimeType = mimeTypes[extname];
	//чтобы убрать начальный слэш
	pathname = pathname.substring(1, pathname.length);
	
	if( (extname == ".gif") || (extname==".jpg") ) {
		var img = fs.readFileSync('./' + pathname);
		response.writeHead(200, {'Content-Type': mimeType});
		response.end(img, 'binary');
	} else {
		fs.readFile(pathname, 'utf8', function (err, data){
			if (err) {
				console.log('Could not find or open file '+ 
				pathname + ' for reading\n');
			} else {
				response.writeHead(200, {'Content-Type': mimeType});
				response.end(data);
			}
		});
	}
}).listen(8080);