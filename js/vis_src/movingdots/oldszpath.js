var width =800,
	height=265,
	labels,
	paths;

var DCmap = function() {
	this.example = 'constructing a data map';
	this.step = 0;
	this.cGroups = false;
	this.placeDots = animate;
	this.reset = reset;
};

var colors = [[150,51,31],
			  [254,220,128],
			  [10,124,122],
			  [159,224,61],
			  [148,199,226],
              [61,179,224],
              [240,219,62],
              [231,230,222],
              [160,28,158],
              [151,150,120],
              [1,177,181],
              [130,135,137]];


var line = d3.svg.line()
		.x(function(d) {
			return d[0];
		})
		.y(function(d){
			return d[1];
		})
		.interpolate("linear");

var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("position","relative");

var group = svg.append("g")
		.attr({
			transform: "translate("+[60,50]+")"
		});

d3.json("sz_hc_l.json", function(error, data) {
        labels = data;
});
console.log(labels);

d3.json("szhc_p.json", function(error, data) {
    paths = data;
paths.forEach(function(d, i) {
	var group = svg.append("g").attr({
		class:"apath",
		transform: "translate("+[60,5]+")"
});
	var path = group.append("path")
			.attr({
				id:i,
				d:line(d),
				fill:"none",
				stroke: "none"
			});
	path.attr({
		len: path.node().getTotalLength()
	});
	var offset = 0;
	group.append("circle")
		.style("fill", d3.rgb(0, 0, 0))
		.style("stroke", function(d) { return d3.rgb(0,0,0); })
        .style("stroke-width", 0.5)
		.attr({
			r:2.5,
			transform: function() {
      			var p = path.node().getPointAtLength(0);
				return "translate("+[p.x,p.y]+")";
			}
		})
        .on("mouseover", function() {
            d3.select(this)
                .attr("r", function (d) { return 10; })
                .style("fill-opacity", 0.8); })
        .on("mouseout", function() {
            d3.select(this)
                .attr("r", function (d) { return 3; })
                .style("fill-opacity", 1.0); });
	path.attr({
		"stroke-dasharray":path.attr("len")+" "+path.attr("len"),
		"stroke-dashoffset":offset
	});
});
});

var reset = function() {
    svg.selectAll("g")
		.select("circle")
        .attr("transform",function(d,i){
			var pth = window.document.getElementById(i-1);
            var p = pth.getPointAtLength(0);
			return "translate("+[p.x,p.y]+")";
			});
};

var takestep = function(j) {
    svg.selectAll("g")
		.select("circle")
        .attr("transform",function(d,i){
			var pth = window.document.getElementById(i-1);
            var p = pth.getPointAtLength(j);
			return "translate("+[p.x,p.y]+")";
			});
};

var animate = function() {
    var dur = 5000;
    svg.selectAll("g")
		.select("circle")
		.transition()
        .duration(dur)
        .ease("bounce")
        .attrTween("transform",function(d,i){
			var pth = window.document.getElementById(i-1);
			return function(t){
                var p = pth.getPointAtLength(
                    pth.getTotalLength()*t);
				return "translate("+[p.x,p.y]+")";
			};
        });
};


var gui = new dat.GUI();
var controls = new DCmap();
gui.add(controls, 'example');
var controller = gui.add(controls, 'step', 0, 1000);

controller.onChange(function(value) {
	takestep(value);
  // Fires on every change, drag, keypress, etc.
});

controller.onFinishChange(function(value) {
  // Fires when a controller loses focus.
});

var c_color = gui.add(controls, 'cGroups', false).name('use color');
c_color.onChange(function(value) {
	if (value){
		console.log(value);
		svg.selectAll("circle")
			.style("fill",
				   function (d, i){
					   return d3.rgb(colors[labels[i]][0],
									 colors[labels[i]][1],
									 colors[labels[i]][2]);});
	}else{
		svg.selectAll("g").select("circle")
			.style("fill", function (d,i){
				return d3.rgb(0,0,0);
			});
	}
});

window.onload = function() {
  gui.add(controls, 'placeDots').name('run analysis');
  gui.add(controls, 'reset');
};

console.log(controls.colorGroups);


//svg.on("click", animate);

