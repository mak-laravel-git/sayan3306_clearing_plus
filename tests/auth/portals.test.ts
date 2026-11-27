import assert from "node:assert/strict";
import test from "node:test";

import {
  ACCOUNT_HOME,
  PORTALS,
  homeFor,
  isAccountPath,
  portalOfPath,
  roleMayOpen,
  safeNextFor,
} from "../../lib/auth/portals.ts";

const ROLES = ["platform_super_admin", "platform_admin", "ppm", "player", "guardian", "club_admin", "club_user", "employer"] as const;

const HOME: Record<(typeof ROLES)[number], string> = {
  platform_super_admin: "/admin",
  platform_admin: "/admin",
  ppm: "/ppm",
  player: "/player",
  guardian: "/guardian",
  club_admin: "/club",
  club_user: "/club",
  employer: "/employer",
};

test("every role lands on its own dashboard", () => {
  for (const role of ROLES) {
    assert.equal(homeFor({ role }), HOME[role], role);
  }
});

test("an account without a role has only its account area", () => {
  assert.equal(homeFor({ role: null }), ACCOUNT_HOME);
  assert.equal(roleMayOpen(null, "/admin"), false);
  assert.equal(roleMayOpen(null, "/account/profile"), true);
});

test("a role may open its own dashboard and nobody else's", () => {
  for (const role of ROLES) {
    for (const portal of Object.values(PORTALS)) {
      for (const path of [portal.prefix, `${portal.prefix}/anything/below`]) {
        assert.equal(roleMayOpen(role, path), portal.roles.includes(role), `${role} -> ${path}`);
      }
    }
  }
});

test("club admin and club user share the club dashboard only", () => {
  assert.equal(roleMayOpen("club_admin", "/club"), true);
  assert.equal(roleMayOpen("club_user", "/club/players"), true);
  assert.equal(roleMayOpen("club_user", "/admin"), false);
});

test("every role may open the account area, and public pages are open", () => {
  for (const role of ROLES) {
    assert.equal(roleMayOpen(role, "/account"), true);
    assert.equal(roleMayOpen(role, "/account/security"), true);
    assert.equal(roleMayOpen(role, "/about"), true);
  }
});

test("a prefix is not matched by a longer word", () => {
  assert.equal(portalOfPath("/administrator"), null);
  assert.equal(portalOfPath("/players"), null);
  assert.equal(portalOfPath("/clubhouse"), null);
  assert.equal(isAccountPath("/accounts"), false);
  assert.equal(roleMayOpen("player", "/administrator"), true);
});

test("a next value only stays inside the person's own areas", () => {
  assert.equal(safeNextFor({ role: "player" }, "/player/profile"), "/player/profile");
  assert.equal(safeNextFor({ role: "player" }, "/account/security"), "/account/security");
  assert.equal(safeNextFor({ role: "player" }, "/admin"), "/player");
  assert.equal(safeNextFor({ role: "player" }, "/admin/users"), "/player");
  assert.equal(safeNextFor({ role: "player" }, "/ppm"), "/player");
  assert.equal(safeNextFor({ role: "platform_admin" }, "/admin/users"), "/admin/users");
  assert.equal(safeNextFor({ role: "employer" }, null), "/employer");
  assert.equal(safeNextFor({ role: "employer" }, "/"), "/employer");
  assert.equal(safeNextFor({ role: "employer" }, "/blog"), "/employer");
});
