import axios from "axios";
import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import { OAuthApp } from "@octokit/oauth-app";

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

/**
 * Revokes the permission of a GitHub App.
 * @param githubAppClientId The client ID of the GitHub App.
 * @param githubAppClientSecret The client secret of the GitHub App.
 * @param userToken The user token for authentication.
 */
export async function revokeGitHubAppPermission(
  githubAppClientId: string,
  githubAppClientSecret: string,
  userToken: string,
): Promise<void> {
  try {
    if (!githubAppClientId || !githubAppClientSecret) {
      throw new Error("GitHub App credentials are missing");
    }

    if (!userToken) {
      throw new Error("User token is missing");
    }

    const url = `https://api.github.com/applications/${githubAppClientId}/grant`;
    // Basic 인증을 위한 client_id와 client_secret을 base64로 인코딩
    const credentials = Buffer.from(
      `${githubAppClientId}:${githubAppClientSecret}`,
    ).toString("base64");
    // const credentials = `${githubAppClientId}:${githubAppClientSecret}`;
    const headers = {
      Authorization: `basic ${credentials}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // const response = await fetch(url, {
    //   method: "DELETE",
    //   headers: headers,
    //   body: JSON.stringify({
    //     access_token: userToken,
    //   }),
    // }).then(async (res) => {
    //   const { status, ok } = res;
    //   // 헤더 추출
    //   const headers: { [key: string]: string } = {};
    //   res.headers.forEach((value, key) => {
    //     headers[key] = value;
    //   });
    //   // 바디 데이터 추출
    //   const data = await res.json();
    //   // 모든 정보 반환
    //   return { status, ok, headers, data };
    // });

    const response = await axios.delete(url, {
      headers,
      data: {
        access_token: userToken,
      },
    });

    // const octokit = new Octokit({
    //   authStrategy: createAppAuth,
    //   auth: {
    //     clientId: githubAppClientId,
    //     clientSecret: githubAppClientSecret,
    //   },
    // });

    // const response = await octokit.request(
    //   `DELETE /applications/${githubAppClientId}/grant`,
    //   {
    //     client_id: githubAppClientId,
    //     access_token: userToken,
    //     headers: {
    //       "X-GitHub-Api-Version": "2022-11-28",
    //     },
    //   },
    // );

    // const app = new OAuthApp({
    //   clientType: "oauth-app",
    //   clientId: githubAppClientId,
    //   clientSecret: githubAppClientSecret,
    // });

    // const response = await app.deleteAuthorization({ token: userToken });
    // const response = await app.checkToken({ token: userToken });
    // console.log(
    //   `token valid, created on %s by %s for %s`,
    //   response.data.created_at,
    //   response.data.app.name,
    //   response.data.user,
    // );

    if (!response.ok) {
      console.log("Failed to revoke GitHub App permission");
      console.error(response);
      throw new Error("OAuthRevokeError");
    }

    console.log("GitHub App permission revoked successfully");
  } catch (error) {
    console.error("Failed to revoke GitHub App permission", error);
    throw new Error("OAuthRevokeError");
  }
}

export async function revokeDiscordAppPermission(
  discordClientId: string,
  discordClientSecret: string,
  userToken: string,
): Promise<void> {
  try {
    const url = "https://discord.com/api/v10/oauth2/token/revoke";
    const data = new URLSearchParams({
      token: userToken,
      token_type_hint: "access_token",
    });

    const credentials = Buffer.from(
      `${discordClientId}:${discordClientSecret}`,
    ).toString("base64");

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: data,
    }).then((res) => {
      const { status, ok } = res;
      return res.json().then((data) => {
        return { status, ok, data };
      });
    });

    if (!response.ok) {
      console.log("Failed to revoke Discord App permission");
      console.error(response);
      throw new Error("OAuthRevokeError");
    }

    console.log("Discord App permission revoked successfully");
  } catch (error) {
    console.error("Failed to revoke Discord App permission", error);
    throw new Error("OAuthRevokeError");
  }
}

export async function revokeGoogleAppPermission(
  userToken: string,
): Promise<void> {
  if (!userToken) {
    throw new Error("User token is missing");
  }

  console.log("access_token", userToken);
  const url = `https://oauth2.googleapis.com/revoke`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const data = new URLSearchParams({
    token: userToken,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: data,
    }).then((res) => {
      const { status, ok } = res;
      return res.json().then((data) => {
        return { status, ok, data };
      });
    });

    if (!response.ok) {
      console.log("Failed to revoke Google App permission");
      console.error(response);
      throw new Error("OAuthRevokeError");
    }

    console.log("Token revoked successfully");
  } catch (error) {
    console.error("Failed to revoke token:", error);
    throw new Error("OAuthRevokeError");
  }
}
