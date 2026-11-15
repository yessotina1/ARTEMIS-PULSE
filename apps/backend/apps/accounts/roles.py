from apps.accounts.models import User

ROLE_PERMISSIONS = {
    User.Role.PUBLIC: ["catalog.read", "datasets.read", "profile.self"],
    User.Role.MISSION_PLANNER: ["catalog.read", "datasets.read", "profile.self", "analyses.own"],
    User.Role.EDUCATOR: ["catalog.read", "datasets.read", "profile.self", "education.own"],
    User.Role.ADMIN: ["catalog.write", "datasets.write", "users.manage", "ingestions.manage"],
}
