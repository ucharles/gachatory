from datetime import datetime
from mongoengine import (
    DynamicDocument,
    StringField,
    IntField,
    ListField,
    DateTimeField,
    ObjectIdField,
    ReferenceField,
    BooleanField,
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
    dateISO = ListField(DateTimeField())
    gpt_tagged = BooleanField()
    createdAt = DateTimeField()
    updatedAt = DateTimeField()
    releaseUpdateDate = (
        DateTimeField()
    )  # 새로운 발매일이 추가될 때마다 업데이트, 생성시에는 createdAt과 같음, date가 업데이트 될 때마다 업데이트

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
