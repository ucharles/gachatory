from datetime import datetime
from mongoengine import (
    DynamicDocument,
    StringField,
    IntField,
    ListField,
    DateTimeField,
)


# Define a model
class CapsuleToy(DynamicDocument):
    brand = StringField(required=True)
    name = StringField(required=True)
    price = IntField(required=True)
    date = ListField(StringField(required=True))
    img = StringField(required=True)
    detail_url = StringField(required=True)
    detail_img = ListField(StringField())
    header = StringField()
    lng = StringField()
    description = StringField()
    localization = ListField(StringField())
    createdAt = DateTimeField()
    updatedAt = DateTimeField()

    meta = {"collection": "capsule-toy"}
