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

		if('/' !== OUT_DIRECTORY.substr(OUT_DIRECTORY.length-1, 1))
			OUT_DIRECTORY = OUT_DIRECTORY+'/';

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
						that.outputFile(path, mp3);
					}
				});
			});
		});
	},
	outputFile : function(path, file){
		var that = this;

		var version = file.getID3Version(),
			 tags = file.getTags(version),
			 TITLE = null,
			 ARTIST = null,
			 TRACK = null,
			 ALBUM = null,
			 EXT = path.split('.')[1];

		switch(version){
			case('id3v2'):
				TITLE = tags['TIT2'].data;
				ARTIST = tags['TPE1'].data.replace('/', ' and ');
				TRACK = tags['TRCK'].data;
				ALBUM = tags['TALB'].data;
				APIC = tags['APIC'];
				break;
			default:
			case('2.3'):
				return;
				break;

		}

		if(TRACK && TITLE && EXT)
		{
			//The new file name
			var OUT = TRACK + ' - ' + TITLE + '.' + EXT;
			//The name of the directory we are outputting to
			var OUT_DIR = DIRECTORY + OUT_DIRECTORY + ARTIST + ' - ' + ALBUM + '/';

			//Check if the directory exists for this album
			try {
				var stats = fs.statSync(OUT_DIR);
			} catch(err) {
				switch(err.code){
					//Does not exist
					case('ENOENT'):
					fs.mkdirSync(OUT_DIR);
					break;
				}
			}

			//Write the file to the proper directory
			fs.writeFile(OUT_DIR+OUT, file.buffer);

		}

	}
}

Renamer.init();