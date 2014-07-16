/* global describe, it */

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var pkg = require('./../package.json');
var dirs = pkg['h5bp-configs'].directories;
var expectedFiles = [

  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.htaccess',
  '404.html',
  'apple-touch-icon-precomposed.png',
  'browserconfig.xml',
  'crossdomain.xml',

  'css/',
    'css/main.css',
    'css/normalize.css',

  'doc/',
    'doc/TOC.md',
    'doc/css.md',
    'doc/extend.md',
    'doc/faq.md',
    'doc/html.md',
    'doc/js.md',
    'doc/misc.md',
    'doc/usage.md',

  'favicon.ico',
  'humans.txt',

  'img/',
    'img/.gitignore',

  'index.html',

  'js/',
    'js/main.js',
    'js/plugins.js',
      'js/vendor/',
      'js/vendor/jquery-' + pkg.devDependencies.jquery + '.min.js',
      'js/vendor/modernizr-2.8.0.min.js',

  'robots.txt',
  'tile-wide.png',
  'tile.png'

];

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// TODO : refactor
function checkFiles(dir, expectedFiles) {

  var files = require('glob').sync('**/*', {
    'cwd': dir,
    'dot': true,
    'mark': true
  });

  console.log(files);

  expectedFiles.forEach(function (file) {
    it('"' + file + '" should be present in the "' + dir + '" directory', function () {
      assert.notEqual(-1, files.indexOf(file));
    });
  });

  (files.filter( function (file) {
    return expectedFiles.indexOf(file) === -1;
  })).forEach( function (file) {
    it('"' + file + '" should NOT be present in the "' + dir + '" directory', function () {
      assert.equal(1, 0);
    });
  });

}

function checkString(file, string, done) {

  var matchFound = false;
  var matchPositions = 0;
  var readStream = fs.createReadStream(file, {'encoding': 'utf8'});

  readStream.on('close', done);
  readStream.on('error', done);
  readStream.on('readable', function () {

    var chunk = '';

    while ( matchFound !== true &&
      ( chunk = readStream.read(1) ) !== null ) {

        if ( chunk === string.charAt(matchPositions) ) {
          matchPositions += 1;
        } else {
          matchPositions = 0;
        }

        if ( matchPositions === string.length ) {
          matchFound = true;
        }
      }

    assert.equal(true, matchFound);
    this.close();

  });

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function runTests() {

  describe('Test if all the expected files are present, and only them', function () {
    checkFiles(dirs.dist, expectedFiles);
  });

  describe('Test if files have the expected content', function () {

    it('".htaccess" should have the "ErrorDocument..." line uncommented', function (done) {
      var string = '\n\nErrorDocument 404 /404.html\n\n';
      checkString(path.resolve('./', dirs.dist, '.htaccess'), string, done);
    });

    it('"main.css" should contain a custom banner', function (done) {
      var string = '/*! HTML5 Boilerplate v' + pkg.version +
                      ' | ' + pkg.license.type + ' License' +
                      ' | ' + pkg.homepage + ' */\n\n';
      checkString(path.resolve('./', dirs.dist, 'css/main.css'), string, done);
    });

    it('"index.html" should contain the correct jQuery version', function (done) {
      var string = pkg.devDependencies.jquery + '/jquery.min.js"></script>\n' +
                   '    <script>window.jQuery || document.write(\'<script ' +
                   'src="js/vendor/jquery-' + pkg.devDependencies.jquery + '.min.js';
      checkString(path.resolve('./', dirs.dist, 'index.html'), string, done);
    });

  });

}

runTests();
