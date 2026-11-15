from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.accounts.models import AuthSession, Profile, User


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "id",
            "affiliation",
            "biography",
            "language",
            "preferences",
            "notification_preferences",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_preferences(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Les préférences doivent être un objet JSON.")
        return value

    def validate_notification_preferences(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Les préférences de notification doivent être un objet JSON.")
        return value


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_email_verified",
            "profile",
        )
        read_only_fields = ("id", "username", "email", "role", "is_email_verified")

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)
        instance = super().update(instance, validated_data)
        if profile_data is not None:
            profile = instance.profile
            for key, value in profile_data.items():
                setattr(profile, key, value)
            profile.save()
        return instance


class AdminUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        read_only_fields = ("id", "username", "email", "is_email_verified")


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True, default="")
    last_name = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        role = self.initial_data.get("role")
        if role not in (None, "", User.Role.PUBLIC):
            raise serializers.ValidationError(
                {"role": "Le rôle est attribué par un administrateur."}
            )
        if User.objects.filter(email__iexact=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Cette adresse est déjà utilisée."})
        if User.objects.filter(username__iexact=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "Ce nom d'utilisateur est déjà utilisé."})
        candidate = User(
            username=attrs["username"],
            email=attrs["email"],
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
        )
        validate_password(attrs["password"], candidate)
        return attrs


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class TokenSerializer(serializers.Serializer):
    token = serializers.CharField()


class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class RefreshBodySerializer(serializers.Serializer):
    refresh = serializers.CharField()


class LoginResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class InvitationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=User.Role.choices)


class NotificationPreferencesSerializer(serializers.Serializer):
    email_enabled = serializers.BooleanField(required=False)
    categories = serializers.DictField(child=serializers.BooleanField(), required=False)


class RoleSerializer(serializers.Serializer):
    code = serializers.CharField()
    label = serializers.CharField()


class PermissionRowSerializer(serializers.Serializer):
    role = serializers.CharField()
    permissions = serializers.ListField(child=serializers.CharField())


class AuthSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthSession
        fields = ("id", "user_agent", "ip_address", "created_at", "revoked_at")
        read_only_fields = fields
