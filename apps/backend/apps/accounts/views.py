from datetime import timedelta

from django.contrib.auth.models import update_last_login
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import AuthSession, OneTimeToken, User
from apps.accounts.roles import ROLE_PERMISSIONS
from apps.accounts.serializers import (
    AdminUserSerializer,
    AuthSessionSerializer,
    EmailSerializer,
    InvitationSerializer,
    LoginResponseSerializer,
    LoginSerializer,
    NotificationPreferencesSerializer,
    PasswordResetSerializer,
    PermissionRowSerializer,
    RefreshBodySerializer,
    RegisterSerializer,
    RoleSerializer,
    TokenSerializer,
    UserSerializer,
)
from apps.accounts.services import (
    consume_token,
    find_token,
    invite_user,
    issue_token,
    open_session,
    revoke_all_sessions,
    revoke_session,
    send_token_email,
)
from common.audit import record_audit
from common.exceptions import Conflict
from common.permissions import IsAdminRole


class EmailNotVerified(PermissionDenied):
    default_detail = "L'adresse e-mail n'est pas vérifiée."
    default_code = "EMAIL_NOT_VERIFIED"


def _generic_email_response():
    return Response(
        {"message": "Si un compte correspond à cette adresse, un message a été envoyé."},
        status=status.HTTP_202_ACCEPTED,
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_register"
    serializer_class = RegisterSerializer

    @extend_schema(tags=["auth"], request=RegisterSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            role=User.Role.PUBLIC,
        )
        raw = issue_token(user, OneTimeToken.Purpose.EMAIL_VERIFY, timedelta(days=2))
        send_token_email(user=user, subject="ARTEMIS PULSE — vérification de l'adresse e-mail", raw=raw)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    serializer_class = TokenSerializer

    @extend_schema(tags=["auth"], request=TokenSerializer, responses={200: UserSerializer})
    def post(self, request):
        serializer = TokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = find_token(serializer.validated_data["token"], [OneTimeToken.Purpose.EMAIL_VERIFY])
        if token is None:
            raise PermissionDenied("Jeton de vérification invalide ou expiré.")
        consume_token(token)
        user = token.user
        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])
        return Response(UserSerializer(user).data)


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_email"
    serializer_class = EmailSerializer

    @extend_schema(tags=["auth"], request=EmailSerializer, responses={202: None})
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if user is not None and not user.is_email_verified:
            raw = issue_token(user, OneTimeToken.Purpose.EMAIL_VERIFY, timedelta(days=2))
            send_token_email(
                user=user,
                subject="ARTEMIS PULSE — vérification de l'adresse e-mail",
                raw=raw,
            )
        return _generic_email_response()


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_login"
    serializer_class = LoginSerializer

    @extend_schema(tags=["auth"], request=LoginSerializer, responses={200: LoginResponseSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ident = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        user = User.objects.filter(email__iexact=ident).first() or User.objects.filter(
            username__iexact=ident
        ).first()
        if user is None or not user.is_active or not user.check_password(password):
            raise AuthenticationFailed("Identifiants invalides.")
        if not user.is_email_verified:
            raise EmailNotVerified()
        access, refresh = open_session(user=user, request=request)
        update_last_login(None, user)
        return Response({"access": access, "refresh": refresh, "user": UserSerializer(user).data})


class RefreshView(APIView):
    permission_classes = [AllowAny]
    serializer_class = RefreshBodySerializer

    @extend_schema(tags=["auth"], request=RefreshBodySerializer)
    def post(self, request):
        body = RefreshBodySerializer(data=request.data)
        body.is_valid(raise_exception=True)
        raw = body.validated_data["refresh"]
        try:
            current = RefreshToken(raw)
        except TokenError as exc:
            raise AuthenticationFailed("Jeton invalide.") from exc
        session = AuthSession.objects.filter(
            refresh_jti=str(current["jti"]),
            revoked_at__isnull=True,
        ).first()
        if session is None:
            raise AuthenticationFailed("Session révoquée.")
        serializer = TokenRefreshSerializer(data={"refresh": raw})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as exc:
            raise AuthenticationFailed("Jeton invalide.") from exc
        rotated = serializer.validated_data.get("refresh")
        if rotated:
            session.refresh_jti = str(RefreshToken(rotated)["jti"])
            session.save(update_fields=["refresh_jti", "updated_at"])
        return Response(serializer.validated_data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RefreshBodySerializer

    @extend_schema(tags=["auth"], request=RefreshBodySerializer, responses={204: None})
    def post(self, request):
        body = RefreshBodySerializer(data=request.data)
        body.is_valid(raise_exception=True)
        try:
            token = RefreshToken(body.validated_data["refresh"])
        except TokenError as exc:
            raise AuthenticationFailed("Jeton invalide.") from exc
        session = AuthSession.objects.filter(
            user=request.user,
            refresh_jti=str(token["jti"]),
            revoked_at__isnull=True,
        ).first()
        if session is None:
            raise PermissionDenied("Session inconnue.")
        token.blacklist()
        revoke_session(session)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(tags=["auth"], responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    @extend_schema(tags=["auth"], request=UserSerializer, responses={200: UserSerializer})
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_email"
    serializer_class = EmailSerializer

    @extend_schema(tags=["auth"], request=EmailSerializer, responses={202: None})
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"], is_active=True).first()
        if user is not None:
            raw = issue_token(user, OneTimeToken.Purpose.PASSWORD_RESET, timedelta(hours=1))
            send_token_email(user=user, subject="ARTEMIS PULSE — réinitialisation du mot de passe", raw=raw)
        return _generic_email_response()


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetSerializer

    @extend_schema(tags=["auth"], request=PasswordResetSerializer, responses={200: None})
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = find_token(
            serializer.validated_data["token"],
            [OneTimeToken.Purpose.PASSWORD_RESET, OneTimeToken.Purpose.INVITATION],
        )
        if token is None:
            raise PermissionDenied("Jeton de réinitialisation invalide ou expiré.")
        user = token.user
        password = serializer.validated_data["password"]
        validate_password(password, user)
        consume_token(token)
        user.set_password(password)
        if token.purpose == OneTimeToken.Purpose.INVITATION:
            user.is_email_verified = True
        user.save()
        revoke_all_sessions(user)
        return Response({"message": "Mot de passe mis à jour."})


class SessionListView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuthSessionSerializer

    @extend_schema(tags=["auth"], responses={200: AuthSessionSerializer(many=True)})
    def get(self, request):
        sessions = request.user.auth_sessions.filter(revoked_at__isnull=True).order_by("-created_at")
        return Response(AuthSessionSerializer(sessions, many=True).data)


class SessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["auth"], responses={204: None})
    def delete(self, request, session_id):
        session = AuthSession.objects.filter(id=session_id, user=request.user).first()
        if session is None:
            raise PermissionDenied("Session inconnue.")
        if session.revoked_at is None:
            revoke_session(session)
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationPreferencesView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationPreferencesSerializer

    @extend_schema(tags=["auth"])
    def get(self, request):
        return Response(request.user.profile.notification_preferences)

    @extend_schema(tags=["auth"], request=NotificationPreferencesSerializer)
    def patch(self, request):
        serializer = NotificationPreferencesSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        profile = request.user.profile
        current = dict(profile.notification_preferences or {})
        if "email_enabled" in serializer.validated_data:
            current["email_enabled"] = serializer.validated_data["email_enabled"]
        if "categories" in serializer.validated_data:
            categories = dict(current.get("categories") or {})
            categories.update(serializer.validated_data["categories"])
            current["categories"] = categories
        profile.notification_preferences = current
        profile.save(update_fields=["notification_preferences", "updated_at"])
        return Response(current)


class RoleListView(APIView):
    permission_classes = [IsAdminRole]
    serializer_class = RoleSerializer

    @extend_schema(tags=["users"])
    def get(self, request):
        return Response([{"code": code, "label": label} for code, label in User.Role.choices])


class PermissionListView(APIView):
    permission_classes = [IsAdminRole]
    serializer_class = PermissionRowSerializer

    @extend_schema(tags=["users"])
    def get(self, request):
        return Response(
            [{"role": role, "permissions": permissions} for role, permissions in ROLE_PERMISSIONS.items()]
        )


class UserViewSet(ModelViewSet):
    queryset = User.objects.select_related("profile").order_by("username")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ["get", "patch", "post", "head", "options"]
    lookup_url_kwarg = "user_id"

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(Q(username__icontains=search) | Q(email__icontains=search))
        return queryset

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        previous = user.role
        response = super().partial_update(request, *args, **kwargs)
        user.refresh_from_db()
        if user.role != previous:
            record_audit(
                actor=request.user,
                action="role_changed",
                resource_type="user",
                resource_id=str(user.id),
                metadata={"from": previous, "to": user.role},
            )
        return response

    @extend_schema(tags=["users"], request=InvitationSerializer, responses={201: AdminUserSerializer})
    @action(detail=False, methods=["post"], url_path="invitations")
    def invitations(self, request):
        serializer = InvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = invite_user(
            email=serializer.validated_data["email"],
            role=serializer.validated_data["role"],
            invited_by=request.user,
        )
        return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)

    @extend_schema(tags=["users"])
    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request, user_id=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=["is_active"])
        record_audit(
            actor=request.user,
            action="user_activated",
            resource_type="user",
            resource_id=str(user.id),
        )
        return Response(AdminUserSerializer(user).data)

    @extend_schema(tags=["users"])
    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request, user_id=None):
        user = self.get_object()
        user.is_active = False
        user.save(update_fields=["is_active"])
        revoke_all_sessions(user)
        record_audit(
            actor=request.user,
            action="user_deactivated",
            resource_type="user",
            resource_id=str(user.id),
        )
        return Response(AdminUserSerializer(user).data)

    def create(self, request, *args, **kwargs):
        raise Conflict("Utilisez l'invitation pour créer un compte administré.")
