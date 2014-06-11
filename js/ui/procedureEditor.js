(function() {

	// Extend the standard ui plugin
	hyryx.editor.ProcedureEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	hyryx.editor.ProcedureEditor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		render : function(callback) {
			var self = this;
			$.get('templates/procedureEditor.mst', function(template) {
				var rendered = $(Mustache.render(template, {
					width_storedProcedureList: 3,
					width_editor: 9
				}));

				self.storedProcedureList = new hyryx.editor.StoredProcedureList(rendered.find('#frame_storedProcedureList'));
				self.jsEditor = new hyryx.editor.JSEditor(rendered.find('#frame_editor'));

				self.registerEvents();

				callback(rendered);
			});
		},

		registerEvents : function (rendered) {
			this.storedProcedureList.on("procedureLoaded", this.jsEditor.showContent.bind(this.jsEditor));

		},

		init : function() {},

		handleEvent : function(event) {}
	});
})();
