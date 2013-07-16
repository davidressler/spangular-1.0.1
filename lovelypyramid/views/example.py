

def example_json(request):

	return {'success': True}

def example_html(request):

	c = dict()
	c['Name'] = 'Butt'
	c['UserId'] = 69

	return {'c': c}

def spangular(request):

	c = dict()
	return {'c': c}