from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.http import Http404
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.utils.text import slugify
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.presenters import (
    ROLE_BY_PROFILE,
    auth_user,
    run_payload,
    scenario_payload,
    site_detail,
    site_summary,
)
from apps.accounts.models import User
from apps.accounts.services import send_password_reset
from apps.analyses.models import AnalysisJob, AnalysisScenario, ProcessingStatus
from apps.analyses.services import execute_scenario
from apps.catalog.models import LunarSite
from scientific.exceptions import ScientificNotImplemented

NOT_COMPUTED = {
    "code": "NOT_COMPUTED",
    "message": "Ce résultat n'est pas calculé. Aucune valeur scientifique n'est synthétisée.",
    "details": {},
    "requestId": "req_unavailable",
}


def _envelope(items: list, page: int, page_size: int, total: int) -> dict:
    return {"items": items, "meta": {"page": page, "pageSize": page_size, "total": total}}


def _page(request) -> tuple[int, int]:
    try:
        page = max(int(request.query_params.get("page", 1)), 1)
        page_size = min(max(int(request.query_params.get("pageSize", 25)), 1), 100)
    except (TypeError, ValueError):
        return 1, 25
    return page, page_size


def _unique_username(email: str) -> str:
    base = slugify(email.split("@", 1)[0]) or "utilisateur"
    candidate = base
    suffix = 2
    while User.objects.filter(username=candidate).exists():
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate


def _split_name(full_name: str) -> tuple[str, str]:
    parts = full_name.strip().split(None, 1)
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[1]


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(tags=["v1"])
    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        password = str(request.data.get("password", ""))
        account = User.objects.filter(email__iexact=email).first()
        user = authenticate(
            request,
            username=account.username if account else email,
            password=password,
        )
        if user is None:
            return Response(
                {
                    "code": "INVALID_CREDENTIALS",
                    "message": "Identifiants invalides.",
                    "details": {},
                    "requestId": "req_unavailable",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        token, _created = Token.objects.get_or_create(user=user)
        return Response({"user": auth_user(user), "token": token.key})


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(tags=["v1"])
    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        password = str(request.data.get("password", ""))
        full_name = str(request.data.get("fullName", "")).strip()
        profile = str(request.data.get("profile", "EXPLORER"))
        if profile not in ROLE_BY_PROFILE:
            return Response(
                {
                    "code": "INVALID_PROFILE",
                    "message": "Le profil doit être PLANNER, EDUCATOR ou EXPLORER.",
                    "details": {},
                    "requestId": "req_unavailable",
                },
                status=400,
            )
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {
                    "code": "EMAIL_TAKEN",
                    "message": "Un compte existe déjà pour cette adresse.",
                    "details": {},
                    "requestId": "req_unavailable",
                },
                status=400,
            )
        first_name, last_name = _split_name(full_name)
        user = User(username=_unique_username(email), email=email, role=ROLE_BY_PROFILE[profile])
        user.first_name = first_name
        user.last_name = last_name
        try:
            from django.contrib.auth.password_validation import validate_password

            validate_password(password, user)
        except Exception as exc:
            messages = getattr(exc, "messages", None) or [str(exc)]
            return Response(
                {
                    "code": "INVALID_PASSWORD",
                    "message": messages[0],
                    "details": {"password": messages},
                    "requestId": "req_unavailable",
                },
                status=400,
            )
        user.set_password(password)
        user.save()
        organization = str(request.data.get("organization", "")).strip()
        if organization:
            user.profile.affiliation = organization
            user.profile.save(update_fields=["affiliation", "updated_at"])
        token = Token.objects.create(user=user)
        return Response({"user": auth_user(user), "token": token.key}, status=201)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["v1"])
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=204)


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(tags=["v1"])
    def post(self, request):
        email = str(request.data.get("email", "")).strip()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is not None:
            send_password_reset(user)
        return Response(
            {"detail": "Si un compte actif correspond à cette adresse, un message a été envoyé."}
        )


class SiteListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(tags=["v1"])
    def get(self, request):
        queryset = LunarSite.objects.all().order_by("name")
        search = request.query_params.get("search")
        category = request.query_params.get("category")
        mission = request.query_params.get("mission")
        region = request.query_params.get("region")
        dem_status = request.query_params.get("demStatus")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(slug__icontains=search)
                | Q(description__icontains=search)
            )
        if category and category != "ALL":
            queryset = queryset.filter(characteristics__category=category)
        if mission:
            queryset = queryset.filter(characteristics__mission=mission)
        if region == "SOUTH_POLE":
            queryset = queryset.filter(latitude_deg__lt=-60)
        if dem_status in {"FULL", "PARTIAL"}:
            queryset = queryset.none()
        total = queryset.count()
        page, page_size = _page(request)
        start = (page - 1) * page_size
        items = [site_summary(site) for site in queryset[start : start + page_size]]
        return Response(_envelope(items, page, page_size, total))


class SiteDetailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(tags=["v1"])
    def get(self, request, site_id: str):
        site = LunarSite.objects.filter(slug=site_id).first()
        if site is None:
            try:
                site = LunarSite.objects.get(pk=site_id)
            except (LunarSite.DoesNotExist, ValidationError, ValueError) as exc:
                raise Http404 from exc
        return Response(site_detail(site))


class ScenarioListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["v1"])
    def get(self, request):
        queryset = AnalysisScenario.objects.filter(owner=request.user).select_related("site", "owner")
        total = queryset.count()
        page, page_size = _page(request)
        start = (page - 1) * page_size
        items = [scenario_payload(item) for item in queryset.order_by("-created_at")[start : start + page_size]]
        return Response(_envelope(items, page, page_size, total))

    @extend_schema(tags=["v1"])
    def post(self, request):
        name = str(request.data.get("name", "")).strip()
        site = get_object_or_404(LunarSite, pk=request.data.get("siteId"))
        window = request.data.get("window") or {}
        start = parse_datetime(str(window.get("startUtc", "")))
        end = parse_datetime(str(window.get("endUtc", "")))
        try:
            step_seconds = int(window.get("stepSeconds"))
        except (TypeError, ValueError):
            step_seconds = 0
        if not name or start is None or end is None or end <= start or step_seconds <= 0:
            return Response(
                {
                    "code": "INVALID_SCENARIO",
                    "message": "Le scénario doit avoir un nom, un site et une fenêtre UTC valide.",
                    "details": {},
                    "requestId": "req_unavailable",
                },
                status=400,
            )
        if timezone.is_naive(start):
            start = timezone.make_aware(start, timezone.utc)
        if timezone.is_naive(end):
            end = timezone.make_aware(end, timezone.utc)
        steps = int((end - start).total_seconds() // step_seconds)
        observer = request.data.get("observer") or {
            "name": name,
            "heightM": 0,
            "mode": "SITE_SURFACE",
        }
        scenario = AnalysisScenario.objects.create(
            title=name,
            owner=request.user,
            site=site,
            notes=str(request.data.get("notes") or ""),
            parameters={
                "observer": observer,
                "window": {
                    "startUtc": start.isoformat().replace("+00:00", "Z"),
                    "endUtc": end.isoformat().replace("+00:00", "Z"),
                    "stepSeconds": step_seconds,
                    "steps": steps,
                },
                "tags": request.data.get("tags") if isinstance(request.data.get("tags"), list) else [],
                "domain": "solar",
            },
        )
        return Response(scenario_payload(scenario), status=201)


class ScenarioDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _owned(self, request, scenario_id: str) -> AnalysisScenario:
        return get_object_or_404(
            AnalysisScenario.objects.select_related("site", "owner"),
            pk=scenario_id,
            owner=request.user,
        )

    @extend_schema(tags=["v1"])
    def get(self, request, scenario_id: str):
        return Response(scenario_payload(self._owned(request, scenario_id)))

    @extend_schema(tags=["v1"])
    def delete(self, request, scenario_id: str):
        self._owned(request, scenario_id).delete()
        return Response(status=204)


class ScenarioRunListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["v1"])
    def get(self, request, scenario_id: str):
        scenario = get_object_or_404(AnalysisScenario, pk=scenario_id, owner=request.user)
        jobs = scenario.jobs.order_by("-created_at")
        return Response(_envelope([run_payload(job) for job in jobs], 1, jobs.count() or 1, jobs.count()))

    @extend_schema(tags=["v1"])
    def post(self, request, scenario_id: str):
        scenario = get_object_or_404(AnalysisScenario, pk=scenario_id, owner=request.user)
        now = timezone.now()
        job = AnalysisJob.objects.create(
            scenario=scenario,
            requested_by=request.user,
            status=ProcessingStatus.RUNNING,
            progress=0,
            started_at=now,
        )
        try:
            execute_scenario(scenario)
        except ScientificNotImplemented as exc:
            job.status = ProcessingStatus.FAILED
            job.progress = 0
            job.error_message = str(exc)
            job.finished_at = timezone.now()
            job.save()
        else:
            job.status = ProcessingStatus.FAILED
            job.error_message = "Le moteur scientifique n'a retourné aucun résultat."
            job.finished_at = timezone.now()
            job.save()
        return Response(run_payload(job), status=201)


class RunListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["v1"])
    def get(self, request):
        jobs = AnalysisJob.objects.filter(requested_by=request.user).order_by("-created_at")
        return Response(_envelope([run_payload(job) for job in jobs], 1, jobs.count() or 1, jobs.count()))


class RunDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["v1"])
    def get(self, request, run_id: str):
        job = get_object_or_404(AnalysisJob, pk=run_id, requested_by=request.user)
        return Response(run_payload(job))


class RunSeriesView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["v1"])
    def get(self, request, run_id: str):
        job = get_object_or_404(
            AnalysisJob.objects.select_related("scenario"),
            pk=run_id,
            requested_by=request.user,
        )
        window = (job.scenario.parameters or {}).get("window") or {}
        return Response(
            {
                "runId": str(job.id),
                "scenarioId": str(job.scenario_id),
                "startUtc": window.get("startUtc"),
                "endUtc": window.get("endUtc"),
                "stepSeconds": window.get("stepSeconds"),
                "points": [],
                "source": {
                    "source": "non calculé",
                    "version": "aucune",
                    "model": None,
                },
            }
        )


class RunWindowsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["v1"])
    def get(self, request, run_id: str):
        get_object_or_404(AnalysisJob, pk=run_id, requested_by=request.user)
        return Response(_envelope([], 1, 25, 0))


class ComparisonListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["v1"])
    def get(self, request):
        return Response(_envelope([], 1, 25, 0))

    @extend_schema(tags=["v1"])
    def post(self, request):
        return Response(NOT_COMPUTED, status=409)


class ReportListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["v1"])
    def get(self, request):
        return Response([])

