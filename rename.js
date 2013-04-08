var ID3File = require('id3');
var fs = require('fs');
var _ = require('lodash');

var DIRECTORY = 'C:/Users/Public/Music/Sample Music';
var OUT_DIRECTORY = '_new';

var Renamer = {
	dir : null,
	init : function(){
		var that = this;

		//Add trailing slash if doesnt exist
		if('/' !== DIRECTORY.substr(DIRECTORY.length-1, 1))
			DIRECTORY = DIRECTORY+'/';

		try {
			var stats = fs.statSync(DIRECTORY+OUT_DIRECTORY);
			if(!stats.isDirectory()){
				throw {code:'ENOTDIR'};
			}
		} catch(err) {
			switch(err.code){
				//Does not exist
				case('ENOENT'):
				fs.mkdirSync(DIRECTORY+OUT_DIRECTORY);
				break;
				//File exists already and is not a directory.
				case('ENOTDIR'):
				console.log('File: ' + DIRECTORY+OUT_DIRECTORY+' exists already. Please delete to continue.');
				break;
			}
			
		}

		that.parseDirectory(DIRECTORY);
		
	},
	parseDirectory : function(dir){
		var that = this;

		fs.readdir(dir, function(err, files){

			//Loop through all files in directory
			_.each(files, function(file){
				var path = dir+file;

				//Check if file is directory
				fs.stat(path, function(err, stat){
					if(stat.isDirectory()) {

						//Check if dir is outDir
						if(path !== dir+OUT_DIRECTORY && dir+path !== '.' && dir+path !== '..'){
							that.parseDirectory(path+'/');
						}
					} else {
						var mp3 = new ID3File(fs.readFileSync(path));
						that.outputFile(file, mp3);
					}
				});
			});
		});
	},
	outputFile : function(name, file){

		var that = this;
		var version = file.getID3Version();
		var tags = file.getTags(version);

		if(tags['TIT2']) {
			var title = tags['TIT2'].data;
			var artist = tags['TPE1'].data.replace('/',' and ');
			var track = tags['TRCK'].data;
			var album = tags['TALB'].data;

			var ext = name.substr(-4);
			var out = track+' - '+title+ext;
			var dir = DIRECTORY+'/'+OUT_DIRECTORY+'/'+artist+' - '+album;

			fs.exists(dir, function(exists){
				if(exists){
					fs.writeFile(dir+'/'+out, file.buffer);
				} else {
					fs.mkdir(dir, function(){
						fs.writeFile(dir+'/'+out, file.buffer);
					});
				}
			});

		}
	}
}

Renamer.init();