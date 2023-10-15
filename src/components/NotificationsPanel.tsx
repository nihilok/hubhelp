import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { NotificationsReadout } from "./NotificationsReadout.tsx";
import "./notifications.css";

export interface NotificationJson {
  id: string;
  subject: { title: string; url: string; latest_comment_url: string };
  reason: string;
  updated_at: string;
}

type Response = { notifications: NotificationJson[] };

interface Props {
  hasToken: boolean;
  setHasToken: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NotificationsPanel({ hasToken, setHasToken }: Props) {
  const [token, setToken] = useState("");

  async function updateToken() {
    setHasToken(await invoke("set_token", { token }));
  }

  async function checkNotificationPerms() {
    let perms = await isPermissionGranted();
    if (!perms) {
      perms = (await requestPermission()) === "granted";
    }
    return perms;
  }

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notificationsQueue, setNotificiationsQueue] = useState<
    NotificationJson[]
  >([]);

  const [intervalValue, setIntervalValue] = useState(
    parseInt(localStorage.getItem("notify-interval") ?? "30"),
  );

  useEffect(() => {
    if (!permissionGranted && notificationsEnabled) {
      checkNotificationPerms().then((result) => setPermissionGranted(result));
    }
    if (notificationsEnabled) {
      sendNotification({
        body: "Notifications now enabled",
        sound: "Funk",
        title: "HubHelper Notification",
      });
    }
  }, [notificationsEnabled, permissionGranted]);

  const notifyInterval = useRef<ReturnType<typeof setInterval>>();
  const getInterval = useRef<ReturnType<typeof setInterval>>();

  function enqueue(response: Response) {
    setNotificiationsQueue(response.notifications);
  }

  useEffect(() => {
    if (notificationsEnabled) {
      const loopedFunc = () =>
        invoke("get_notifications").then((result) =>
          enqueue(result as Response),
        );
      clearInterval(getInterval.current);
      loopedFunc();
      getInterval.current = setInterval(loopedFunc, 1000);
    } else {
      clearInterval(getInterval.current);
    }
    return () => clearInterval(getInterval.current);
  }, [notificationsEnabled, intervalValue]);

  useEffect(() => {
    clearInterval(notifyInterval.current);
    if (!notificationsEnabled) {
      return;
    }
    if (!notificationsQueue.length) {
      return;
    }
    const loopFunc = () => {
      sendNotification({
        body: "You have unread notifications",
        sound: "Funk",
        title: "HubHelper Notification",
      });
    };
    notifyInterval.current = setInterval(loopFunc, 1000 * intervalValue);
  }, [notificationsQueue]);

  function onSetInterval(value: string) {
    localStorage.setItem("notify-interval", value);
    setIntervalValue(parseInt(value));
  }

  return (
    <div className="notifications-panel">
      {!hasToken ? (
        <>
          <form
            className="token-form"
            onSubmit={(e) => {
              e.preventDefault();
              updateToken();
            }}
          >
            <input
              id="token-input"
              onChange={(e) => setToken(e.currentTarget.value)}
              placeholder="Personal Access Token"
            />
            <button type="submit">UPDATE</button>
          </form>
          <p>
            Personal Access Token with <b>notifications</b> scope
          </p>
        </>
      ) : (
        <>
          <br />
          <div className="row-center gap-1">
            <input
              type="checkbox"
              id="enable-notifications"
              onChange={(e) => {
                setNotificationsEnabled(e.target.checked);
              }}
            />
            <label htmlFor="enable-notifications">
              Enable Desktop Notifications
            </label>
          </div>
          <br />
          <div className="row-center gap-1">
            <label htmlFor="notify-interval">
              Notify every{" "}
              <input
                type="number"
                id="notify-interval"
                value={intervalValue}
                onChange={(e) => onSetInterval(e.target.value)}
                style={{ maxWidth: "6ch" }}
              />{" "}
              seconds
            </label>
          </div>
          <NotificationsReadout notifications={notificationsQueue} />
          <div className="row-center gap-1 notifications-link">
            <a href={"https://github.com/notifications"} target="_blank">
              View All Notifications
            </a>
          </div>
        </>
      )}
    </div>
  );
}
