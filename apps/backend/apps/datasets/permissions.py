from rest_framework.permissions import SAFE_METHODS, BasePermission


class DatasetWritePermission(BasePermission):
    """Metadata is readable by everyone. Only Mission Planner and staff can change it."""

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_staff or user.role == "mission_planner"
