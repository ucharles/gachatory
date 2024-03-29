"use client";

import Image from "next/image";
import Link from "next/link";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getNotifications } from "@/lib/fetch-data";
import DisplayDate from "@/components/DisplayDate";

import { translate } from "@/app/i18n/client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Notification {
  notificationId: string;
  tags: Tag[];
  createdAt: string;
  confirmed: boolean;
}

interface Tag {
  tagId: string;
  tagName: Localization<string[]>;
  capsules: Capsule[];
}

interface Capsule {
  capsuleId: string;
  capsuleName: Localization<string>;
  brandName: Localization<string>;
  releaseDate: string;
  detailUrl: string;
  img: string;
}

interface Localization<T extends string | string[]> {
  ja: T;
  en: T;
  ko: T;
}

type Language = "ja" | "en" | "ko";

function setNotification(notificationId: string) {
  return fetch(`/api/notifications/${notificationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default function NotificationsPage({ lng }: { lng: Language }) {
  const { t } = translate(lng, "translation");
  const queryClient = useQueryClient();
  const { data } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () =>
      getNotifications(lng).then((data) => {
        return data;
      }),
  });

  const { mutate } = useMutation({
    mutationFn: (notificationId: string) => setNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });

  return (
    <>
      {data?.length === 0 && <p>{t("no-notification-message")}</p>}
      <Accordion type="multiple" className="w-full text-gray-800">
        {data?.map((notification, idx) => {
          return (
            <AccordionItem
              key={notification.notificationId}
              value={notification.notificationId}
            >
              <AccordionTrigger
                onClick={() => {
                  notification.confirmed
                    ? null
                    : mutate(notification.notificationId);
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  {notification.confirmed ? (
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gigas-700"></div>
                  )}
                  <DisplayDate date={notification.createdAt} />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="px-2 sm:px-4">
                  {Object.values(notification.tags).map((tag) => {
                    return (
                      <li key={tag.tagId} className="space-y-3">
                        <Link href={`/${lng}/search?tag=${tag.tagId}`}>
                          <h3 className="text-xl font-bold">
                            {tag.tagName[lng][0]}
                          </h3>
                        </Link>
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
                          {tag.capsules.map((capsule) => {
                            return (
                              <li key={capsule.capsuleId}>
                                <Link
                                  href={`/${lng}/capsule/${capsule.capsuleId}`}
                                >
                                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-gray-100">
                                    <Image
                                      priority
                                      src={capsule.img}
                                      alt={capsule.capsuleName[lng]}
                                      width={200}
                                      height={0}
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                      }}
                                      className="scale-125 object-center transition duration-300 hover:translate-y-0 hover:scale-100 hover:opacity-90"
                                    />
                                  </div>
                                </Link>
                                <div className="_text-info mt-3 space-y-1">
                                  <p className="text-subtle-medium text-gray-600">
                                    {capsule.releaseDate}
                                  </p>
                                  <h4 className="max-lines-3 3xs:text-base-semibold break-words text-body-bold ">
                                    {capsule.capsuleName[lng]}
                                  </h4>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
              {idx < data.length - 1 && <hr />}
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
}
