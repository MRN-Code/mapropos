var width =300,
	height=156,
	zoomf=1.8;

var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("position","relative")
		.on("mouseenter", function() {return animate();})
		.on("mouseleave", function() {return reset();});

var ids = ['motto', 'map', 'ropo', 'apropos','s'];

d3.json("mapropos.json", function(error, paths) {
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
					d:d['track'],
					fill:"none",
					stroke:"none"
				});
		group.append("path")
			.attr({
				class:"movable",
				id:ids[i],
				d:d['image'],
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
});

var reset = function() {
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
}

var animate = function() {
    var dur = 800;
	var pth = window.document.getElementById("apropos");
	pth.setAttribute("fill",d3.rgb(0,0,0));
	window.document.getElementById("ropo")
		.setAttribute("fill","none");
    svg.selectAll("g")
		.select(".movable")
		.transition()
        .duration(dur)
        .ease("cubic")
        .attrTween("transform", function(d,i){
			var pth = this.parentNode.childNodes[0];
			switch(this.id){
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
