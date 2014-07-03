(function() {
	hyryx.editor.ProcedureResults = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
		this.id = hyryx.utils.getID('ProcedureResults');
		this.frame = null;
		this.template1 = null;
		this.template2 = null;
		this.sunburst = null
	};

	hyryx.editor.ProcedureResults.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		render: function(callback) {
			var self = this;
			$.get('templates/procedureResults.mst', function(template) {
				self.frame = $(Mustache.render(template));
				self.sunburst = new hyryx.editor.Sunburst(self.frame.find('.content3'));

				self.registerEvents();

				callback(self.frame);
			});
		},

		init: function() {
			var self = this;
			this.frame.hide();
			$.get('templates/procedureResults_content_a.mst', function(template) {
				self.template1 = template;
				Mustache.parse(self.template1);
			});
			$.get('templates/procedureResults_content_b.mst', function(template) {
				self.template2 = template;
				Mustache.parse(self.template2);
			});
		},

		registerEvents: function() {
			var self = this;
			this.sunburst.on('editorExecute', function(papi) {
				self.emit('editorExecute', papi);
			});
		},

		showResults: function(data, papi) {
			data.joinedRows = function () {
				return function (text, render) {
					return "<tr><td>" + render(text).split(",").join("</td><td>") + "</td></tr>";
				};
			};
			$.each(data.performanceData, function(idx, perfData) {
				perfData.index = idx;
			});
			this.frame.find('.content1').html(Mustache.render(this.template1, data));
			this.frame.find('.content2').html(Mustache.render(this.template2, data));
			this.sunburst.update(data, papi);
			this.frame.show();
		},

		clearResults: function() {
			this.frame.hide();
		}
	});
})();
