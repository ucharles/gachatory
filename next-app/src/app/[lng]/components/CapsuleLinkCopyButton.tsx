"use client";

import { useState } from "react";

import SuccessNoti from "./SuccessNoti";

export default function CapsuleLinkCopyButton({ lng }: { lng: string }) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleLinkCopy() {
    await navigator.clipboard.writeText(window.location.href);
    // 현재 주소 링크를 복사
    // 복사가 성공하면 isCopied 상태를 true로 업데이트합니다.
    if (!isCopied) {
      setIsCopied(true);
      // 2초 후에 isCopied를 false로 다시 설정하여 풍선이 사라지게 합니다.
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }

  return (
    <>
      <SuccessNoti lng={lng} isDisplay={isCopied} msg={"link-copied"} />
      <button onClick={handleLinkCopy}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14.4"
          height="16"
          viewBox="0 0 14.4 16"
        >
          <path
            id="share_FILL1_wght400_GRAD0_opsz24"
            d="M132-864a2.314,2.314,0,0,1-1.7-.7,2.314,2.314,0,0,1-.7-1.7,2.194,2.194,0,0,1,.02-.29,1.471,1.471,0,0,1,.06-.27l-5.64-3.28a2.635,2.635,0,0,1-.76.47,2.323,2.323,0,0,1-.88.17,2.314,2.314,0,0,1-1.7-.7,2.314,2.314,0,0,1-.7-1.7,2.314,2.314,0,0,1,.7-1.7,2.314,2.314,0,0,1,1.7-.7,2.323,2.323,0,0,1,.88.17,2.635,2.635,0,0,1,.76.47l5.64-3.28a1.47,1.47,0,0,1-.06-.27,2.2,2.2,0,0,1-.02-.29,2.315,2.315,0,0,1,.7-1.7,2.315,2.315,0,0,1,1.7-.7,2.315,2.315,0,0,1,1.7.7,2.315,2.315,0,0,1,.7,1.7,2.315,2.315,0,0,1-.7,1.7,2.314,2.314,0,0,1-1.7.7,2.324,2.324,0,0,1-.88-.17,2.635,2.635,0,0,1-.76-.47l-5.64,3.28a1.469,1.469,0,0,1,.06.27,2.195,2.195,0,0,1,.02.29,2.194,2.194,0,0,1-.02.29,1.471,1.471,0,0,1-.06.27l5.64,3.28a2.635,2.635,0,0,1,.76-.47,2.323,2.323,0,0,1,.88-.17,2.314,2.314,0,0,1,1.7.7,2.315,2.315,0,0,1,.7,1.7,2.315,2.315,0,0,1-.7,1.7A2.314,2.314,0,0,1,132-864Z"
            transform="translate(-120 880)"
            fill="#a8a8a8"
          />
        </svg>
      </button>
    </>
  );
}
