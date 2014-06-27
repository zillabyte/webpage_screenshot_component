var casper = require("casper").create();

function setHttp(link) {
    if (link.search(/^http[s]?\:\/\//) == -1) {
        link = 'http://' + link;
    }
    return link;
}

var screenshotUrl = 'http://google.com/',
    screenshotNow = new Date(),
    screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds()),
    viewports = [
      {
        'name': 'desktop-standard',
        'viewport': {width: 1280, height: 1024}
      }
    ];

 
if (casper.cli.args.length < 1) {
  casper
    .echo("Usage: $ casperjs screenshot.js MATCH_ID URL")
    .exit(1)
  ;
} else {

  matchId = casper.cli.args[0];
  screenshotUrl = setHttp(casper.cli.args[1]);
}
 
casper.start(screenshotUrl, function() {
  this.echo('Current location is ' + this.getCurrentUrl(), 'info');
});
 
casper.each(viewports, function(casper, viewport) {
  this.then(function() {
    this.viewport(viewport.viewport.width, viewport.viewport.height);
  });
  this.thenOpen(screenshotUrl, function() {
    this.wait(1);
  });
  this.then(function(){
    this.echo('Screenshot for ' + viewport.name + ' (' + viewport.viewport.width + 'x' + viewport.viewport.height + ')', 'info');
    this.capture('match_' + matchId + '.png', { // Title is generic because I immediately delete the file after moving to s3.
        top: 0,
        left: 0,
        width: viewport.viewport.width,
        height: viewport.viewport.height
    });
  });
});
 
casper.run();
 
function pad(number) {
  var r = String(number);
  if ( r.length === 1 ) {
    r = '0' + r;
  }
  return r;
}
