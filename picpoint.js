function div(val, by) {
    return (val - val % by) / by;
}

function PicPointDot(radOrbit) {
    this.space = true;
    this.x = 0;
    this.y = 0;
    this.cx = 0;
    this.cy = 0;
    this.color = '#1f1f9c';
    this.point_orbitX = Math.floor(Math.random() * radOrbit.X) + radOrbit.Z;
    this.point_orbitY = Math.floor(Math.random() * radOrbit.Y) + radOrbit.Z;
    this.point_speed = Math.random() * 0.14;
    this.point_pos_angle = Math.random() * 0.30;
}

function PicPoint(param = {}) {
    this.init(param);
    this.run();
}

PicPoint.prototype = {

    createNodes: function(param) {
        this.id = param.id;
        this.canvas = document.createElement("canvas");
        this.canvasContext = this.canvas.getContext("2d");
        this.operCanvas = document.createElement('canvas');

        container = document.getElementById(param.id);
        container.appendChild(this.canvas);

        let img = container.getElementsByTagName('img')[0];
        img.style.display = 'none';
        this.operCanvas.width = img.width;
        this.operCanvas.height = img.height;
        let ctx = this.operCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        let imageData = ctx.getImageData(0, 0, this.operCanvas.width, this.operCanvas.height);

        this.pointsData = imageData.data;
        this.dotsCountY = img.height;
        this.dotsCountX = img.width;
    },

    initializePrimaryFields: function (param) {
        this.dotMargin = 7;
        this.dotSize = param.dotSize || 5;
        this.dotsMap = [];
        this.mousePos = {x: 0, y: 0};
        this.easing = { def:0.2, fly: 0.05 };
        this.radOrbit = param.radOrbit || { X: 210, Y: 100, Z: 100, Access: 80 };
        this.FPS = 35;
    },

    createMap: function () {
        z = 0;
        for (y = 1; y <= this.dotsCountY; y++) {
            this.dotsMap[y] = [];
            for (x = 1; x <= this.dotsCountX; x++) {
                new_dot = new PicPointDot(this.radOrbit);
                color = this.pointsData[z] + ',' + this.pointsData[z+1] + ',' + this.pointsData[z+2];
                if (color === '255,255,255')
                    new_dot.space = false;
                else
                    new_dot.color = color;

                this.dotsMap[y][x] = new_dot;
                z+=4;
            }
        }
    },

    loadCoords: function () {
        this.dotX = div(this.canvas.width - (this.dotMargin * this.dotsCountX), this.dotsCountX);
        this.dotY = div(this.canvas.height - (this.dotMargin * this.dotsCountY), this.dotsCountY);

        bufY = this.dotMargin;
        for (y = 1; y <= this.dotsCountY; y++) {
            bufX = this.dotMargin;
            for (x = 1; x <= this.dotsCountX; x++) {
                this.dotsMap[y][x].cx = bufX;
                this.dotsMap[y][x].cy = bufY;
                this.dotsMap[y][x].x = bufX;
                this.dotsMap[y][x].y = bufY;

                bufX += this.dotX + this.dotMargin;
            }
            bufY += this.dotY + this.dotMargin;
        }
    },

    update: function () {
        for (y = 1; y <= this.dotsCountY; y++) {
            for (x = 1; x <= this.dotsCountX; x++) {
                if (Math.pow(this.dotsMap[y][x].cx - this.mousePos.x + 4 + (this.dotX / 2), 2) + Math.pow(this.dotsMap[y][x].cy - this.mousePos.y, 2) <= Math.pow(this.radOrbit.Access, 2)) {

                    this.dotsMap[y][x].point_pos_angle += this.dotsMap[y][x].point_speed;
                    K = this.dotsMap[y][x].point_pos_angle;

                    targetX = Math.sin(K) * this.dotsMap[y][x].point_orbitX + this.mousePos.x;
                    dx = targetX - this.dotsMap[y][x].x;
                    this.dotsMap[y][x].x += dx * this.easing.fly;

                    targetY = Math.cos(K) * this.dotsMap[y][x].point_orbitY + this.mousePos.y;
                    dy = targetY - this.dotsMap[y][x].y;
                    this.dotsMap[y][x].y += dy * this.easing.fly;

                } else {
                    targetX = this.dotsMap[y][x].cx;
                    dx = targetX - this.dotsMap[y][x].x;
                    this.dotsMap[y][x].x += dx * this.easing.def;

                    targetY = this.dotsMap[y][x].cy;
                    dy = targetY - this.dotsMap[y][x].y;
                    this.dotsMap[y][x].y += dy * this.easing.def;
                }
            }
        }
    },

    draw: function () {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (y = 1; y <= this.dotsCountY; y++) {
            for (x = 1; x <= this.dotsCountX; x++) {
                if (this.dotsMap[y][x].space) {
                    this.canvasContext.beginPath();
                    this.canvasContext.arc(this.dotsMap[y][x].x, this.dotsMap[y][x].y, this.dotSize, 0, 360, false);
                    this.canvasContext.fillStyle = 'rgb('+this.dotsMap[y][x].color + ")";
                    this.canvasContext.fill();
                }
            }
        }
    },

    mousemove: function() {
        let thisobj = this;
        thisobj.canvas.addEventListener('mousemove', function (evt) {
            rect = thisobj.canvas.getBoundingClientRect();
            thisobj.mousePos = {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }, false);
    },

    resizeCanvas: function(id) {
        dx = this.dotsCountY / this.dotsCountX;
        this.canvas.width = document.getElementById(this.id).offsetWidth;
        //this.canvas.width = this.canvas.width + (this.dotMargin * this.canvas.width);
        this.canvas.height = document.getElementById(this.id).offsetWidth * dx;
        //this.canvas.height = this.canvas.height + (this.dotMargin * this.canvas.height);
    },

    init: function (param) {
        this.createNodes(param);
        this.initializePrimaryFields(param);
        this.resizeCanvas();
        this.createMap();
        this.loadCoords();
    },

    run: function () {
        this.mousemove();
        setInterval(
            () => { this.update(); this.draw() },
            1000 / this.FPS
        );
    }

};