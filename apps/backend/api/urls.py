from django.urls import path

from api.views import (
    ComparisonListCreateView,
    LoginView,
    LogoutView,
    PasswordResetView,
    RegisterView,
    ReportListView,
    RunDetailView,
    RunListView,
    RunSeriesView,
    RunWindowsView,
    ScenarioDetailView,
    ScenarioListCreateView,
    ScenarioRunListCreateView,
    SiteDetailView,
    SiteListView,
)

urlpatterns = [
    path("auth/login", LoginView.as_view(), name="v1-login"),
    path("auth/register", RegisterView.as_view(), name="v1-register"),
    path("auth/logout", LogoutView.as_view(), name="v1-logout"),
    path("auth/password-reset", PasswordResetView.as_view(), name="v1-password-reset"),
    path("sites", SiteListView.as_view(), name="v1-sites"),
    path("sites/<str:site_id>", SiteDetailView.as_view(), name="v1-site"),
    path("scenarios", ScenarioListCreateView.as_view(), name="v1-scenarios"),
    path("scenarios/<uuid:scenario_id>", ScenarioDetailView.as_view(), name="v1-scenario"),
    path(
        "scenarios/<uuid:scenario_id>/runs",
        ScenarioRunListCreateView.as_view(),
        name="v1-scenario-runs",
    ),
    path("runs", RunListView.as_view(), name="v1-runs"),
    path("runs/<uuid:run_id>", RunDetailView.as_view(), name="v1-run"),
    path("runs/<uuid:run_id>/series", RunSeriesView.as_view(), name="v1-run-series"),
    path(
        "runs/<uuid:run_id>/visibility-windows",
        RunWindowsView.as_view(),
        name="v1-run-windows",
    ),
    path("comparisons", ComparisonListCreateView.as_view(), name="v1-comparisons"),
    path("reports", ReportListView.as_view(), name="v1-reports"),
]
