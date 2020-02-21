module.exports = function() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var p = Math.random()*1000; // pause time
    while(p+d >= new Date().getTime()){}
    var d2 = new Date().getTime();
    return 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
