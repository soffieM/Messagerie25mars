const gulp = require('gulp');
const ts = require('gulp-typescript');
var spawn = require('child_process').spawn;
const tsProject = ts.createProject('tsconfig.json');

var node;

gulp.task('scripts', () => {
  const tsResult = tsProject.src().pipe(tsProject());
  return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('run', ['scripts'], () => {
  if (node) node.kill();
  node = spawn('node', ['dist/index.js'], {stdio: 'inherit'});
});

gulp.task('watch', ['run'], () => {
  gulp.watch('src/**/*.ts', ['run']);
});

gulp.task('default', ['watch']);
