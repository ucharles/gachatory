import Script from "next/script";

const NAVER_ANALYTICS_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID_NAVER || "";

const NaverAnalytics = () => (
  <>
    <Script
      id="naver-analytics"
      src="//wcs.naver.net/wcslog.js"
      strategy="afterInteractive"
    />
    <Script id="naver-analytics-script" strategy="afterInteractive">
      {`
        if(!wcs_add) var wcs_add = {};
        wcs_add["wa"] = "${NAVER_ANALYTICS_ID}";
        if(window.wcs) {
          wcs_do();
        }
      `}
    </Script>
  </>
);
export default NaverAnalytics;
