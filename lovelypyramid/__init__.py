from pyramid.config import Configurator

from lovelypyramid.route import map_routes

from lovepotion.dal.connectionmanager import ConnectionManager

from bottomless.configuration import GenericConfig
from bottomless.lib.genericlogger import GenericLogger

from pyramid.session import UnencryptedCookieSessionFactoryConfig

logger =  GenericLogger('lovely')
config = GenericConfig()

def main(global_config, **settings):
	""" This function returns a Pyramid WSGI application.
	"""
	session_factory = UnencryptedCookieSessionFactoryConfig('skeetskeetskeetskeetskeetskeetskeet')

	c = Configurator(settings=settings, session_factory=session_factory)

	#setup db
	ConnectionManager.Configure_Engine(settings)

	#sync config
	config.Sync_Dict(settings)
	#print config for log
	logger.info(config)

	#templating
	c.include('pyramid_jinja2')
	c = map_routes(c)
	c.scan()
	return c.make_wsgi_app()
