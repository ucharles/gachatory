// middleware.ts
// This file is responsible for redirecting the user to the correct language based on the Accept-Language header or the lng cookie.
// It also sets the lng cookie if it is not set yet.
// It is also responsible for redirecting the user to the correct language if the user is not on the correct language.

import { NextResponse, NextRequest } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages } from "./app/i18n/settings";

acceptLanguage.languages(languages);

// a negative lookahead to exclude the api routes, the static folder, the image folder, the assets folder, the favicon and the service worker
export const config = {
  // matcher: '/:lng*'
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)"],
};

const cookieName = "i18next";

export function middleware(req: NextRequest) {
  // Extract the language from the URL
  const urlLang = req.nextUrl.pathname.split("/")[1];

  // If the URL contains a supported language, set/update the cookie and move on
  if (languages.includes(urlLang)) {
    const response = NextResponse.next();
    response.cookies.set(cookieName, urlLang);
    return response;
  }

  // If the URL does not contain a supported language, determine the correct language and redirect
  let lng =
    req.cookies.get(cookieName)?.value ||
    acceptLanguage.get(req.headers.get("Accept-Language")) ||
    fallbackLng;

  if (languages.includes(lng)) {
    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}`, req.url)
    );
  }

  // Redirect if lng in path is not supported
  return NextResponse.redirect(
    new URL(`/${lng}${req.nextUrl.pathname}`, req.url)
  );

  // if (req.headers.has("referer")) {
  //   const refererUrl = new URL(req.headers.get("referer")!);
  //   console.log(refererUrl.pathname);
  //   const lngInReferer = languages.find((l) =>
  //     refererUrl.pathname.startsWith(`/${l}`)
  //   );
  //   console.log(lngInReferer);
  //   const response = NextResponse.next();
  //   if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
  //   return response;
  // }

  // return NextResponse.next();
}
