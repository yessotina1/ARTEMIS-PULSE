from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import AuthSession, OneTimeToken, Profile, User


@admin.register(User)
class ArtemisUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("ARTEMIS PULSE", {"fields": ("role", "is_email_verified")}),
    )
    list_display = ("username", "email", "role", "is_email_verified", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_email_verified", "is_active")
    search_fields = ("username", "email")


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "affiliation", "language")
    search_fields = ("user__username", "user__email", "affiliation")


@admin.register(AuthSession)
class AuthSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "ip_address", "created_at", "revoked_at")
    search_fields = ("user__username", "refresh_jti")


@admin.register(OneTimeToken)
class OneTimeTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "purpose", "expires_at", "used_at")
    list_filter = ("purpose",)
    search_fields = ("user__email",)
