import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { signRefreshToken } from "@/lib/auth/jwt";
import { setRefreshCookie } from "@/lib/auth/cookies";
import { cookies } from "next/headers";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = cookies().get("dsa_oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_state_mismatch`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_not_configured`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${appUrl}/api/auth/google/callback`,
      }),
    });

    if (!tokenRes.ok) throw new Error("Token exchange failed");
    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userInfoRes.ok) throw new Error("Failed to fetch Google profile");
    const profile = (await userInfoRes.json()) as GoogleUserInfo;

    await connectDB();

    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email }] });

    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.sub,
        avatarUrl: profile.picture,
        emailVerified: profile.email_verified,
      });
    } else if (!user.googleId) {
      user.googleId = profile.sub;
      if (!user.avatarUrl) user.avatarUrl = profile.picture;
      await user.save();
    }

    const refreshToken = signRefreshToken({ sub: user.id, tokenVersion: user.tokenVersion });
    setRefreshCookie(refreshToken);

    // We only set the httpOnly refresh cookie here. The client's
    // AuthInitializer calls POST /api/auth/refresh on every page load,
    // which exchanges this cookie for a fresh access token — so there's
    // no need to smuggle the access token through the redirect itself.
    const res = NextResponse.redirect(`${appUrl}/dashboard`);
    res.cookies.set("dsa_oauth_state", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    console.error("[google oauth]", err);
    return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
  }
}
