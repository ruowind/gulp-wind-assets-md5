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
        .pipe(windmd5('./dest/', 8))
        .pipe(gulp.dest('./dest/'));
});
```