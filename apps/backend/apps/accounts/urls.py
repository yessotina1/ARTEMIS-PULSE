from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    ForgotPasswordView,
    LoginView,
    LogoutView,
    MeView,
    NotificationPreferencesView,
    PermissionListView,
    RefreshView,
    RegisterView,
    ResendVerificationView,
    ResetPasswordView,
    RoleListView,
    SessionDetailView,
    SessionListView,
    UserViewSet,
    VerifyEmailView,
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/verify-email/", VerifyEmailView.as_view(), name="auth-verify-email"),
    path("auth/verification/resend/", ResendVerificationView.as_view(), name="auth-verification-resend"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/token/refresh/", RefreshView.as_view(), name="auth-token-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/password/forgot/", ForgotPasswordView.as_view(), name="auth-password-forgot"),
    path("auth/password/reset/", ResetPasswordView.as_view(), name="auth-password-reset"),
    path("auth/sessions/", SessionListView.as_view(), name="auth-sessions"),
    path("auth/sessions/<uuid:session_id>/", SessionDetailView.as_view(), name="auth-session-detail"),
    path("roles/", RoleListView.as_view(), name="roles"),
    path("permissions/", PermissionListView.as_view(), name="permissions"),
    path(
        "preferences/notifications/",
        NotificationPreferencesView.as_view(),
        name="notification-preferences",
    ),
    *router.urls,
]
