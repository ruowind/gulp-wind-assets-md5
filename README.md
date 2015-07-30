# gulp-wind-assets-md5

> version the static files in html and css
 
## Installation

Install package with NPM:

`npm install gulp-wind-assets-md5`

## Usage

```javascript
var windmd5 = require('gulp-wind-assets-md5');

gulp.task('windmd5', function () {
    gulp.src('./test/**/*')
        .pipe(windmd5({
            md5Type: 'query',
            md5Size: 8
        }))
        .pipe(gulp.dest('./dest/'));
});
```

## Options

- `md5Size`
    the length of md5 sting,default is `8`.

- `md5Type`
    the type to prevent cache.default is `query`
    
    - `query`
        add query to link like.
        ```
        <script src="js/jquery.js?v=7f38dcbf"></script>
        ```
    - `file`
        append md5 string to file name like.
        ```
        <script src="js/jquery_7f38dcbf.js"></script>
        ```