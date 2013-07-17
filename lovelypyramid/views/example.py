from spot.model.user.usersearch import UserSearch

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

def spangular1(request):

	c = dict()
	return {'c': c}

def spangular2(request):

	c = dict()
	return {'c': c}

def spangular3(request):

	c = dict()
	return {'c': c}

def search(request):

	print 'making request'

	result = {}
	result['beds'] = 2
	result['lat'] = 33
	result['lon'] = -127
	result['zoom'] = 15
	#result['failed'] = True

	return result

def saveSearch(request):
	return {'success': True}

def testing(request):
	c = dict()
	return {'c': c}