
(function() {

    // Extend the standard ui plugin
    hyryx.editor.Sunburst = function() {
      hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
      // Dimensions of sunburst.
      this.width = 750;
      this.height = 600;
      this.radius = Math.min(this.width, this.height) / 2;
      this.viz = null;
      this.data = null;
    };

    hyryx.editor.Sunburst.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
        render: function(callback) {
            var self = this;
            $.get('templates/sunburst.mst', function(template) {
                var rendered = $(Mustache.render(template));
                callback(rendered);
            });
        },

        init: function() {
            var self = this;
            this.viz = this.createSunburst();
            $('#sunburst-value').selectpicker();
            $('#sunburst-value').change(function() {
                if ($(this).val() === 'CPU cycles') {
                    self.update(self.data);
                } else {
                    self.update(self.data, function(d) {
                        return 1;
                    });
                }
            })
        },

        update: function(data, f_value) {
            var self = this;

            this.data = data;

            if (f_value === undefined) {
                f_value = function(d) { return d.duration; };
                $('#sunburst-value').val('CPU cycles');
                $('#sunburst-value').selectpicker('render');
            }

            // Stash the old values for transition.
            function stash(d) {
              d.x0 = d.x;
              d.dx0 = d.dx;
            };

            // Interpolate the arcs in data space.
            function arcTween(a) {
              var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
              var arc = d3.svg.arc()
                .startAngle(function(d) { return d.x; })
                .endAngle(function(d) { return d.x + d.dx; })
                .innerRadius(function(d) { return Math.sqrt(d.y); })
                .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });
              return function(t) {
                var b = i(t);
                a.x0 = b.x;
                a.dx0 = b.dx;
                return arc(b);
              };
            };

            // Fade all but the current sequence, and show it in the breadcrumb trail.
            function mouseover(d) {
                // Given a node in a partition layout, return an array of all of its ancestor
                // nodes, highest first, but excluding the root.
                function getAncestors(node) {
                    var path = [];
                    var current = node;
                    while (current.parent) {
                        path.unshift(current);
                        current = current.parent;
                    }
                    return path;
                };

                d3.select("#chart-title").text(d.name);
                d3.select("#chart-duration").text(d.duration);
                d3.select("#explanation").style("visibility", "");

                var sequenceArray = getAncestors(d);

                // Fade all the segments.
                d3.selectAll("path").style("opacity", 0.3);

                // Then highlight only those that are an ancestor of the current segment.
                self.viz.selectAll("path").filter(function(node) {
                    return (sequenceArray.indexOf(node) >= 0);
                }).style("opacity", 1);
            };

            // Restore everything to full opacity when moving off the visualization.
            function mouseleave(d) {
                // Deactivate all segments during transition.
                d3.selectAll("path").on("mouseover", null);

                // Transition each segment to full opacity and then reactivate it.
                d3.selectAll("path")
                    .transition()
                    .duration(1000)
                    .style("opacity", 1)
                    .each("end", function() {
                        d3.select(this).on("mouseover", mouseover);
                    });

                d3.select("#explanation")
                    .transition()
                    .duration(1000)
                    .style("visibility", "hidden");
            };

            // var arc = d3.svg.arc()
            //     .startAngle(function(d) { return d.x; })
            //     .endAngle(function(d) { return d.x + d.dx; })
            //     .innerRadius(function(d) { return Math.sqrt(d.y); })
            //     .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

            var json = this.buildHierarchy(data);

            var partition = d3.layout.partition()
                .size([2 * Math.PI, this.radius * this.radius])
                .value(f_value);

            var nodes = partition.nodes(json)
                .filter(function(d) {
                    return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
                });

            var paths = this.viz.data([json]).selectAll("path").data(nodes);

            paths.enter()
                .append("svg:path")
                .attr("display", function(d) { return d.depth ? null : "none"; })
                // .attr("d", arc)
                .attr("fill-rule", "evenodd")
                .style("fill", function(d) { return "#2a5e8c"; })
                .style("stroke", "white")
                .style("stroke-width", 2)
                .style("opacity", 1)
                .on("mouseover", mouseover);

            paths.transition()
                .duration(5500)
                // .attr("d", arc)
                .attrTween("d", arcTween)
                .each(stash);

            paths.exit().remove();

            d3.select("#container").on("mouseleave", mouseleave);
        },

        createSunburst: function() {
            // Total size of all segments; we set this later, after loading the data.
            var viz = d3.select("#chart").append("svg:svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .append("svg:g")
                .attr("id", "container")
                .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

            viz.append("svg:circle")
                .attr("r", this.radius)
                .style("opacity", 0);

            return viz;
        },

        buildHierarchy: function(data) {
            var root = {name: "root", children: []};

            if (!data) {
                return root;
            }

            _.each(data.performanceData, function(perf) {
                _.each(perf.subQueryPerformanceData, function(value, key, list) {
                    var duration = _.reduce(value, function(a, b) {
                        return a + b.duration;
                    }, 0);
                    var node = {name: 'Line ' + key, duration: duration, children: []};
                    root.children.push(node);
                    _.each(value, function(d) {
                        node.children.push({name: d.name, duration: d.duration});
                    });
                });
            });
            return root;
        }
    });
})();

