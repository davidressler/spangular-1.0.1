def map_routes(config):
	#routes
	config.add_static_view('static', 'static', cache_max_age=3600)

	#example routes
	config.add_route('example_json', '/json', view='lovelypyramid.views.example.example_json', renderer='json')
	config.add_route('example_html', '/html', view='lovelypyramid.views.example.example_html', renderer='templates/example.jinja2')
	config.add_route('spangular', '/', view='lovelypyramid.views.example.spangular', renderer='templates/index.jinja2')
	config.add_route('spangular1', '/{tab}', view='lovelypyramid.views.example.spangular', renderer='templates/index.jinja2')
	config.add_route('spangular2', '/{tab}/{view}', view='lovelypyramid.views.example.spangular', renderer='templates/index.jinja2')
	config.add_route('spangular3', '/{tab}/{view}/{id}', view='lovelypyramid.views.example.spangular', renderer='templates/index.jinja2')

	return config