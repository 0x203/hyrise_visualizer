hyryx.debug = (function() {
    var eventHandlers;

    function setup() {
        $.get('templates/page_debug.mst', function(template) {
            var rendered = $(Mustache.render(template, {
                width_stencils: 3,
                width_canvas: 9,
                width_data: 12
            }));
            $('#visualizer #page-debug').append(rendered);

            eventHandlers = {
                'stencil': new hyryx.debug.Stencils(rendered.find('#frame_stencils')),
                'canvas': new hyryx.debug.Canvas(rendered.find('#frame_canvas')),
                'attributes': new hyryx.debug.Attributes(rendered.find('#frame_attributes')),
                'data': new hyryx.explorer.Data(rendered.find('#frame_data'))
            };
        });
    }

    function dispatch(event) {
        if ('string' === typeof event) {
            event = {
                type: event,
                options: {}
            };
        }
        var config = (event.type || '').split('.'),
            target = config[0],
            command = config[1];

        if (eventHandlers[target]) {
            eventHandlers[target].handleEvent({
                type: command,
                options: event.options
            });
        }
    }

    return {
        setup: setup,
        dispatch: dispatch
    };
})();
