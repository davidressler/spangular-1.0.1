from datetime import datetime

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.types import Integer, DateTime, Boolean, Float, String

from bottomless.util.util import Util
from spot.model import meta

class Search(meta.Base):
	__tablename__ = "tblusersearch"
	# __table_args__ = {"schema":"spot"}

	Baths = Column("baths", ARRAY(Float), nullable=True)
	Beds = Column("beds", ARRAY(Integer), nullable=True)
	CatsAllowed = Column("catsallowed", Boolean, nullable=False)
	CenterLat = Column("centerlat", Float, nullable=True)
	CenterLon = Column("centerlon", Float, nullable=True)
	Cities = Column("cities", ARRAY(Integer), nullable=True)
	CreateDate = Column("createdate", DateTime, nullable=False)
	DogsAllowed = Column("dogsallowed", Boolean, nullable=False)
	Id = Column("id", Integer, primary_key=True, index=True, nullable=False)
	Keywords = Column("keywords", String(2048), index=False, nullable=True)
	MaxPrice = Column("maxprice", Integer, nullable=True)
	MinPrice = Column("minprice", Integer, nullable=True)
	Neighborhoods = Column("neighborhoods", ARRAY(Integer), nullable=True)
	Regions = Column("regions", ARRAY(Integer), nullable=True)
	RequirePhotos = Column("requirephotos", Boolean, nullable=False)
	ShowDeleted = Column("showdeleted", Boolean, nullable=False)
	ShowUnmappables = Column("showunmappables", Boolean, nullable=False)
	UserId = Column("userid", Integer, ForeignKey('spot.tbluser.id'), index=True, nullable=False)
	ZoomLevel = Column("zoomlevel", Integer, nullable=True)

	def __init__(self):
		self.RequirePhotos = True
		self.CreateDate = datetime.now()
		self.ShowUnmappables = False
		self.DogsAllowed = False
		self.CatsAllowed = False
		self.ShowDeleted = False
		self.Id = 1

	def __repr__(self):
		return "Search (%s)" % self.Id

	@property
	def HasLocations(self):
		return False