import os
import uuid
import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, CHAR, Boolean, create_engine

Base = declarative_base()

class Config(Base):
    __tablename__ = 'config'
    ConfigID = Column(CHAR(32), primary_key=True, default=str(uuid.uuid4()))
    Serial = Column(String(255), nullable=False, default='')
    AppVersion = Column(String(255), nullable=False, default='')
    ReferenceUnitA = Column(Integer, nullable=False, default=1)
    OffsetA = Column(Integer, nullable=False, default=1)
    CalibrateOnStartup = Column(Boolean, nullable=False, default=False)
    CreatedDateUTC = Column(Integer, default=int(datetime.datetime.now().timestamp() * 1000))
    UpdatedDateUTC = Column(Integer, default=int(datetime.datetime.now().timestamp() * 1000), onupdate=int(datetime.datetime.now().timestamp() * 1000))
    DeletedDateUTC = Column(Integer, nullable=False, default=0)
    ServerDateUTC = Column(Integer, nullable=False, default=0)


dir_name = os.path.join(os.path.dirname(os.path.realpath(__file__)), "config.db")
engine = create_engine("sqlite:///"+dir_name)
# Create tables if they don't exist
Config.__table__.create(bind=engine, checkfirst=True)