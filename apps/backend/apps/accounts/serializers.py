from rest_framework import serializers

from apps.accounts.models import Profile, User


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ("id", "affiliation", "biography", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "profile")
        read_only_fields = ("id", "username", "email", "role")

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)
        instance = super().update(instance, validated_data)
        if profile_data is not None:
            for key, value in profile_data.items():
                setattr(instance.profile, key, value)
            instance.profile.save()
        return instance
