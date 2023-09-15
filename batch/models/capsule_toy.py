from datetime import datetime
from mongoengine import (
    DynamicDocument,
    StringField,
    IntField,
    ListField,
    DateTimeField,
    ObjectIdField,
    ReferenceField,
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
    tagId = ListField(ReferenceField("CapsuleTag"))
    createdAt = DateTimeField()
    updatedAt = DateTimeField()

    meta = {"collection": "capsule-toy"}


class CapsuleTag(DynamicDocument):
    ja = ListField(StringField(required=True))
    ko = ListField(StringField(required=True))
    en = ListField(StringField(required=True))
    property = StringField(required=True)
    linkCount = IntField()
    createdAt = DateTimeField()
    updatedAt = DateTimeField()

    meta = {"collection": "capsule-tag"}
