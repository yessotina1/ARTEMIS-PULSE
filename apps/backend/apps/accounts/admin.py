from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import Profile, User


@admin.register(User)
class ArtemisUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + ((None, {"fields": ("role",)}),)
    list_display = ("username", "email", "role", "is_staff")
    list_filter = ("role", "is_staff")


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "affiliation")
