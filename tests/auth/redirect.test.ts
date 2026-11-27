import assert from "node:assert/strict";
import test from "node:test";

import { redirectTo } from "../../lib/http/redirect.ts";

test("a redirect carries a relative Location and never a host", () => {
  const response = redirectTo("/login?reason=session-expired");

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/login?reason=session-expired");
});

test("the status can be chosen", () => {
  assert.equal(redirectTo("/admin/application/audit?x=1", 303).status, 303);
});

test("anything but a path on this site is refused", () => {
  for (const target of ["https://evil.example/login", "//evil.example", "/\\evil.example", "login", "http://localhost:3000/login"]) {
    assert.throws(() => redirectTo(target), /only accepts a path on this site/, target);
  }
});
