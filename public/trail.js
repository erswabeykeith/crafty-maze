(function (Crafty) {
    "use strict";
    var timeout = 0;
    Crafty.c("Trail", {
        init: function () {
            this.requires("2D, Canvas, Color");
        },
        connectNodes: function (start, end) {
            var centerX = start.x + (start.radius / 2),
                centerY = start.y + (start.radius / 2),
                width = 3,
                height = 3;
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
            timeout += 25;
            var t = setTimeout(function () {
                this.color('rgb(255,0,0)')
                    .attr({x: centerX, y: centerY, w: width, h: height})
                    .bind('DFSStarted', function () {
                        this.destroy();
                        timeout = 0;
                    });
            }.bind(this), timeout);
            this.bind('DFSStarted', function () {
                clearTimeout(t);
                timeout = 0;
            });
        }
    });
}(Crafty));