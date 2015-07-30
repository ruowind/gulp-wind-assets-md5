'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    crypto = require('crypto-md5');

function calMd5(file, size) {
    var md5 = String(crypto(file, 'hex'));
    return size > 0 ? md5.slice(0, size) : md5;
}

module.exports = function (config) {
    config = config || {};
    var md5Length = config.md5Size || 8,
        verType = config.md5Type || 'query',
        srcReg = /\ssrc="([^"?]*)"/g,
        hrefReg = /<link.*\shref="([^"?]*)"/g,
        urlReg = /url\("?([^\?)"]*)"?\)/g,
        htmlFiles = [],
        cssFiles = [],
        assetPath,
        reg,
        md5Version,
        md5Path,
        md5Obj = {},
        endStream;

    function verPath(filePath, version) {
        var dirname = path.dirname(filePath);
        var extName = path.extname(filePath);
        var baseName = path.basename(filePath, extName);
        if (verType === 'file') {
            return dirname + '/' + baseName + '_' + version + extName;
        } else {
            return filePath + '?v=' + version;
        }
    }

    function verFile(txtFile) {
        var fileSrc = String(txtFile.contents),
            regArr,
            assets = {};

        // 'js' 'img' and 'src' link tag.
        while (regArr = srcReg.exec(fileSrc) || hrefReg.exec(fileSrc) || urlReg.exec(fileSrc)) {
            assetPath = regArr[1];
            if (assetPath && assetPath.indexOf('//') < 0) {
                assets[assetPath] = assetPath;
            }
        }

        for (var item in assets) {
            reg = new RegExp(item, 'g');
            md5Path = path.resolve(path.dirname(txtFile.path), item);
            fileSrc = fileSrc.replace(reg, verPath(item, md5Obj[md5Path]));
        }

        txtFile.contents = new Buffer(fileSrc);

        // cache mad5.
        md5Version = calMd5(txtFile.contents, md5Length);
        md5Obj[txtFile.path] = md5Version;

        if (verType === 'file' && path.extname(txtFile.path) === '.css') {
            txtFile.path = verPath(txtFile.path, md5Version);
        }

        endStream.push(txtFile);
    }

    // copy and cache file's md5 which are not css and html files
    function step1(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-wind-assets-md5', 'Streaming not supported'));
            return cb();
        }
        if (!file.contents) {
            return cb();
        }
        var assets = {};

        switch (path.extname(file.path)) {
            case '.html':
                htmlFiles.push(file);
                cb();
                break;
            case '.css':
                cssFiles.push(file);
                cb();
                break;
            default :
                // cache mad5.
                md5Version = calMd5(file.contents, md5Length);
                md5Obj[file.path] = md5Version;
                // copy others files such as 'js,jpg,png,svg,json...'
                if (verType === 'file') {
                    file.path = verPath(file.path, md5Version);
                }
                cb(null, file);
        }
    }

    // operate css and html files
    function step2(cb) {
        endStream = this;
        // generate css files
        cssFiles.forEach(verFile);
        // generate html files(html must be the last)
        htmlFiles.forEach(verFile);
        cb();
    }

    return through.obj(step1, step2);
};