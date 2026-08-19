import { NextRequest, NextResponse } from "next/server";

/**
 * App-level password gate (HTTP Basic Auth), independent of Vercel's own
 * Deployment Protection — that dashboard setting only reliably covers Preview
 * deployments on the free plan, not the Production URL, so this runs the
 * check in our own code instead where it works on any plan.
 *
 * Requires SITE_USER and SITE_PASSWORD to be set as Environment Variables in
 * the Vercel project (Settings -> Environment Variables) for Production.
 * Until those are set, every request is rejected — it fails locked, not open.
 */
export function middleware(req: NextRequest) {
  const expectedUser = process.env.SITE_USER;
  const expectedPass = process.env.SITE_PASSWORD;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);

    if (expectedUser && expectedPass && user === expectedUser && pass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Restricted", charset="UTF-8"' },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
