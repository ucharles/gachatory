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
    DictField,
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
    localization = ListField(ObjectIdField())
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


class Localization(DynamicDocument):
    lng: StringField(required=True)
    capsuleId: ObjectIdField(required=True)
    brand: StringField(required=True)
    name: StringField(required=True)
    header: StringField()
    description: StringField()
    createdAt = DateTimeField(default=datetime.utcnow().isoformat())
    updatedAt = DateTimeField()

    meta = {"collection": "localization"}


class SubscriptionTag(DynamicDocument):
    userId = ObjectIdField(required=True)
    tagId = ReferenceField("CapsuleTag", required=True)
    state = BooleanField(required=True)
    createdAt = DateTimeField(default=datetime.utcnow().isoformat())
    updatedAt = DateTimeField()

    meta = {"collection": "subscription-tag"}


class Notification(DynamicDocument):
    userId = ObjectIdField(required=True)
    capsuleId = ObjectIdField(required=True)
    tagId = ObjectIdField(required=True)
    notificationId = ObjectIdField(required=True)
    capsule_name = DictField(required=True)
    tag_name = DictField(required=True)
    brand_name = DictField(required=True)
    release_date = StringField(required=True)
    detail_url = StringField(required=True)
    img = StringField(required=True)
    confirmed = BooleanField(default=False)
    confirmedAt = DateTimeField()
    createdAt = DateTimeField(default=datetime.utcnow().isoformat())
    updatedAt = DateTimeField()

    meta = {"collection": "notification"}
