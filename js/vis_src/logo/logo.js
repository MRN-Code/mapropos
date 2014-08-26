/* jshint -W040, -W083, unused:false */
(function loadLogo (window, Promise, undefined) {
    "use strict";
    var domTarget = "body",
        id = "logo",
        height=156,
        pth,
        ids = ['motto', 'map', 'ropo', 'apropos','s'],
        timeouts = [],
        width =300,
        zoomf=1.8,
        addBefore,
        cb,
        svg;

    window.onerror = function (message, filename, lineno, colno, error) {
        console.error(arguments);
        if (error !== undefined && error.hasOwnProperty( "name" ) && error.name == "Magic"){
            alert("some uncaught magic caused: "  + message +" - in "+filename +"("+lineno+")" );
            return true;
        }
    };

    if (!window) throw new Error("Attepted to load hdp into invalid environment");

    function Logo (config) {
        var jsonInputs = {
            "js/vis_src/logo/mapropos.json": this._loaded
        },
            loadedPs = [],
            _this = this,
            configValue;

        // Build array of async fetch promises for all JSON
        for (var dataFile in jsonInputs) {
            if (jsonInputs.hasOwnProperty(dataFile)) {
                loadedPs.push(new Promise(function fetchJSON (resolve, reject) {
                    var df = dataFile;
                    d3.json(df, function handleJSON (err, data) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve([jsonInputs[df], data]); // resolves to [function, dataInputToFunction]
                    });
                }));
            }
        }

        // User initialization
        for (var prop in config) {
            if (config.hasOwnProperty(prop)) {
                configValue = config[prop];
                switch(prop) {
                    case 'cb':
                        cb = configValue;
                        break;
                    case 'id':
                        id = configValue;
                        break;
                    case 'target':
                        domTarget = configValue;
                        if (domTarget.indexOf('#') !== 0) {
                            throw new Error("# style selector required");
                        }
                        break;
                    default:
                        throw new Error("Invalid configuration parameter passed (" +
                            prop + ")");
                }
            }
        }

        _this._init();
        Promise.all(loadedPs)
            .then(function _execLoadHanders(r){_this._execJSONhandlers(r);})
            .then(function initPostLoadGlobals () {
                timeouts[0] = setTimeout(function autoAni () {
                    timeouts[2] = true;
                    _this.animate(true);
                    timeouts[2] = false;
                }, 3000);
                timeouts[1] = setTimeout(_this.reset, 8000);
                setTimeout(function(){timeouts=null;}, 8001);
                pth = window.document.getElementById("apropos");
                if (cb) cb();
            });
    }


    /**
     * Returns the DOM object of the target
     * @return {Object} DOM node
     */
    function getTargetNode () {
        if (domTarget === 'body') return window.document.body;
        return window.document.getElementById(domTarget.substring(1));
    }



    /**
     * Animates the logo text
     * @param  {Boolean} ani indicates that the request is an animation request
     */
    Logo.prototype.animate = function (ani) {
        var dur = 800;
        if (timeouts && !ani) {
            if (timeouts[2]) { // mouseover during animation
                return;
            } else { // mouseover before animation
                clearTimeout(timeouts[0]);
                clearTimeout(timeouts[1]);
                timeouts = null;
            }
        }

        pth.setAttribute("fill",d3.rgb(0,0,0));
        window.document.getElementById("ropo").setAttribute("fill","none");
        svg.selectAll("g")
            .select(".movable")
            .transition()
            .duration(dur)
            .ease("cubic")
            .attrTween("transform", function tween (d,i){
                var pth = this.parentNode.childNodes[0],
                    _this = this;
                switch (this.id){
                    case "apropos":
                        return function(t){
                            var p = pth.getPointAtLength(pth.getTotalLength()*t);
                            return "translate("+[p.x,p.y]+")scale("+(1-0.5*t)+")";
                        };
                    default:
                        return function(t){
                            var p = pth.getPointAtLength(pth.getTotalLength()*t);
                            return "translate("+[p.x,p.y]+")";
                        };
                    }
            });
    };



    /**
     * Executes callbacks once all data has been fetched
     * @param  {Array} execReqs array containing arrays of [callback function, data for callback]
     */
    Logo.prototype._execJSONhandlers = function (execReqs) {
        if (!execReqs) throw new Error("No functions/data provided to execute");
        if (!execReqs.length) return;
        execReqs.forEach(function execHandler (fd) {
            fd[0](fd[1]); // fd[0] is a the cb function, fd[1] is the fetched JSON
        });
    };



    Logo.prototype._init = function () {
        var _this = this;
        svg = d3.select(domTarget).append("svg");
        svg.attr({
                "width": width,
                "height": height,
                "id": id
            });
        svg.style({
                "position": "absolute",
                "top": "0px",
                "left": "75px",
                "z-index": 1000
            })
            .on("mouseenter", function() {return _this.animate();})
            .on("mouseleave", function() {return _this.reset();});
    };



    Logo.prototype._loaded = function (paths) {
        paths.forEach(function (d,i){
            var group=svg.append("g").attr({
                class: "trajectory",
                transform: function() {
                    return "scale("+zoomf+")translate("+[10,52]+")";
                }
            });
            group.append("path")
                    .attr({
                        id:"track_"+i,
                        d:d.track,
                        fill:"none",
                        stroke:"none"
                    });
            group.append("path")
                .attr({
                    class:"movable",
                    id:ids[i],
                    d:d.image,
                    fill:function() {
                        switch(ids[i]){
                        case "apropos":
                            return "none";
                        default:
                            return d3.rgb(0, 0, 0);
                        }
                    },
                    stroke: "none",
                    transform: function() {
                        var pth = this.parentNode.childNodes[0];
                        var p = pth.getPointAtLength(0);
                        return "translate("+[p.x,p.y]+")";
                    }
                });
        });
    };

    Logo.prototype.reset = function () {
        svg.selectAll("g")
            .select(".movable")
            .transition()
            .duration(300)
            .ease("bounce")
            .attr({
                fill:function(d,i) {
                    switch(ids[i]){
                    case "apropos":
                        return "none";
                    default:
                        return d3.rgb(0, 0, 0);
                    }
                },
                transform: function() {
                    var pth = this.parentNode.childNodes[0];
                    var p = pth.getPointAtLength(0);
                    return "translate("+[p.x,p.y]+")";
                }
            });
    };

    if (typeof module !== "undefined" && typeof require !== "undefined") {
        module.exports = Logo;
    } else if (window.Logo) {
        throw new Error("Logo exists on the window.  Overwriting not permitted.");
    } else {
        window.Logo = Logo;
    }
})(window, window.Promise);