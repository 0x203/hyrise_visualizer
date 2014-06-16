(function() {
	hyryx.debug.Stencils = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	};

	hyryx.debug.Stencils.prototype = extend(hyryx.screen.AbstractUIPlugin, {

		render : function() {
			return this.createStencilsMarkup();
		},

		init : function() {
			this.load();
		},

		createStencilsMarkup : function() {
			// create container for stencils
			this.id = hyryx.utils.getID('Stencils');
			var frame = $('<div class="area_frame"></div>').appendTo(this.targetEl);
			var $stencils = $('<div class="stencils" id="'+this.id+'"><h3>Operations</h3></div>').appendTo(frame);
			$stencils.append('<div class="list">');

			return $stencils;
		},

		load : function() {
			var me = this;

			// load available stencils
			$.getJSON('operations.json', function(data) {
				$.each(data, function(k, v) {
					var i=0;
					for (var op in v) { ++i; }

					if (i > 0) {
						hyryx.stencils[k] = v;
					}
				});

				me.updateOpList();
			});
		},

		updateOpList : function() {

			var me = this;

			$('.stencils .list').html('');

			// var header = 'Operations';
			var panel = ['<div class="item-list">', '<div class="list-group">'];

			$.each(hyryx.stencils, function(key, value) {

				var $buttonMarkup = me.getStencilButtonMarkup(value);

				panel.push($buttonMarkup);
			});

			panel.push('</div></div>');
			$(panel.join('')).appendTo('.stencils .list');

			$('.stencils .list .collapse.panel-collapse:first').addClass('in');

			this.emit("initDragDrop");
		},

		getStencilButtonMarkup : function(config) {
			return ['<a class="list-group-item" data-key="'+config.type+'" data-type="'+config.type+'" draggable="true">',
						config.type,
					'</a>'].join('');
		},
	});
})();
