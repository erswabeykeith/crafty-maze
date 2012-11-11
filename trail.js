(function (Crafty) {
    "use strict";
    var timeout = 0;
    Crafty.c("Trail", {
        slow: true,
        trailColor: 'rgb(255,0,0)',
        init: function () {
            this.requires("2D, Canvas, Color");
        },
        connectNodes: function (start, end) {
            var centerX = start.x + (start.radius / 2),
                centerY = start.y + (start.radius / 2),
                width = 3,
                height = 3,
                t;
            if (start.x > end.x) {
                width = start.radius;
                centerX = centerX - start.radius;
            }
            if (start.x < end.x) {
                width = start.radius;
            }
            if (start.y > end.y) {
                height = start.radius;
                centerY = centerY - start.radius;
            }
            if (start.y < end.y) {
                height = start.radius;
            }
            if (this.slow) {
                timeout += 25;
            }
            t = setTimeout(function () {
                this.color(this.trailColor)
                    .attr({x: centerX, y: centerY, w: width, h: height})
                    .bind('DFSStarted', function () {
                        this.destroy();
                    });
            }.bind(this), timeout);
            this.bind('DFSStarted', function () {
                clearTimeout(t);
                timeout = 0;
            });
        }
    });
}(Crafty));