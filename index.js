'use strict';

// File I/O is provided by simple wrappers around standard POSIX functions.
// @see https://nodejs.org/api/fs.html
var fs = require('fs');

// This module contains utilities for handling and transforming file paths.
// @see https://nodejs.org/api/path.html
var path = require('path');

// A little globber
// @see https://www.npmjs.com/package/glob
var glob = require('glob');

// Synchronous version of `fs.readFile`. Returns the contents of the file and parse to JSON.
// @see https://nodejs.org/api/fs.html#fs_fs_readfilesync_file_options
function readJSON(filepath){
  var buffer = {};
  try{
    buffer = JSON.parse(fs.readFileSync(filepath, { encoding:'utf8' }));
  } catch(error){}
  return buffer;
}

// Define a task using [Orchestrator](https://github.com/robrich/orchestrator).
// @see https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulptaskname--deps--fn
function iteraction(gulp, options, taskFile){
  var cmds = [];
  var extension = path.extname(taskFile);
  var filename = path.basename(taskFile, extension);
  var task = require(taskFile)(gulp, options.data, loadGulpConfig.utils, filename);
  if(typeof task === 'function'){
    gulp.task(filename, task.bind(gulp, filename));
  }else if(task === Object(task)){
    Object.keys(task).forEach(function(cmd){
      if(typeof task[cmd] === 'function'){
        var alias = [filename, ':', cmd].join('');
        gulp.task(alias, task[cmd].bind(gulp, filename));
        cmds.push(alias);
      }
    });
    gulp.task(filename, cmds);
  }
}

// Load multiple gulp tasks using globbing patterns.
function loadGulpConfig(gulp, options){
  options = Object.assign({ data:{} }, options);
  options.configPath = typeof options.configPath === 'string'? options.configPath : 'tasks';
  glob.sync(options.configPath, { realpath:true }).forEach(iteraction.bind(this, gulp, options));
}

// Externalize dependencies.
loadGulpConfig.utils = {
  fs:fs,
  path:path,
  glob:glob,
  readJSON:readJSON
};

// Externalize `load-gulp-config` module.
module.exports = loadGulpConfig;
