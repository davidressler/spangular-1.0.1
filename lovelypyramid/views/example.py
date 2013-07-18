from chafe.mill.listing import ListingMill

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

def listings(request):
	listings = []
	for num in range(0, 10):
		offset = num * 10
		listings += ListingMill.Get_By_Pinterest_Search(1, None, None, None, None, offset, 'CA')

	listingList = []
	for listing in listings:
		listingInfo = {}
		listingInfo['Address'] = listing.LocationTitle
		listingInfo['Beds'] = listing.Beds
		listingInfo['Baths'] = listing.Baths
		listingInfo['Latitude'] = listing.Latitude
		listingInfo['Longitude'] = listing.Longitude
		listingInfo['Price'] = listing.Price
		listingInfo['Photos'] = listing.Photos
		listingInfo['Abstract'] = listing.Abstract
		listingInfo['id'] = listing.Id
		listingList.append(listingInfo)

	return listingList

def saveSearch(request):
	return {'success': True}

def testing(request):
	c = dict()
	return {'c': c}