"use client";

import { translate } from "@/app/i18n/client";

export default function EmailNotification() {
  return (
    <div className="flex space-x-2">
      <div>
        <input type="checkbox" />
      </div>
      <div>
        <p className="font-semibold">Receive Keyword notifications</p>
        <p className="text-sm text-gray-500">
          We will send you an email when we find a new job posting that matches
          your keywords.
        </p>
      </div>
    </div>
  );
}
