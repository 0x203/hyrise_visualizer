(function() {
	// Extend the standard ui plugin
	hyryx.editor.Editor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	hyryx.editor.Editor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		id: hyryx.utils.getID('Editor'),

		/** Create a container for a SVG canvas and a container for the text editor */
		render: function(callback) {
			var self = this;
			$.get('templates/editor.mst', function(template) {
				var rendered = Mustache.render(template, {
					id: self.id,
					submitbutton: true
				});
				callback(rendered);
			});
		},

		/** Instantiate the Canvas and add the editor for the JSON representation */
		init: function() {
			this.registerEditor();
			this.registerEvents();
		},

		/** Make certain functions accessible for other plugins */
		handleEvent: function(event) {
			if (event.type === "show") {
				this.showContent(event.options.data);
			} else if (event.type === "save") {
				event.options.callback(
					this.getCurrentSource(event.options.generation)
				);
			}
		},

		getCurrentSource: function(generation) {
			// returns current content of the editor
			// if generation is given:
			//	- checks if content changed since then and return false if not
			//  - otherwise change generation and return new one
			var result = {};

			if (generation !== undefined) {
				if (this.editor.isClean(generation)) {
					return false;
				} else {
					result.generation = this.editor.changeGeneration();
				}
			}
			result.source = this.editor.getValue();
			return result;
		},

		execute: function() {
			console.log("Execute stored procedure...");
			var current = this.getCurrentSource(this.generation);
			if (current) {
				this.generation = current.generation;
				hyryx.ProcedureStore.executeSource(current.source).done(function(data) {
					if (data.error) {
						console.error("Error executing procedure:" + data.error);
					} else {
						console.log(data);

						hyryx.editor.dispatch({
							type : 'procedureResults.show',
							options : {
								data : data
							}
						});
					}
				}).fail(function(jqXHR, textStatus, errorThrown) {
					console.log("Couldn't post/execute jsprocedure: " + textStatus + errorThrown);
				});
			} else {
				console.log("Nothing changed - nothing to do");
			}
		},

		registerEditor: function() {
			this.editor = CodeMirror(document.getElementById(this.id), {
				value: '',
				mode: {
					name: 'javascript'
				},
				theme: 'custom',
				lint: true,
				gutters: ['CodeMirror-lint-markers'],
				lineNumbers: true,
				minHeight: 500
			});
			this.generation = 0;
			this.editor.setSize(null, 500);
		},

		registerEvents: function() {
			this.targetEl.on(
				'click', 'button.button-execute', this.execute.bind(this)
			);
		},

		showContent: function(content) {
			this.editor.setValue(content);
		}
	});
})();
