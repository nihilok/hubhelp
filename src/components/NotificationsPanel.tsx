import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import React, { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { NotificationsReadout } from "./NotificationsReadout.tsx";
import "./notifications.css";

export interface NotificationJson {
  subscription_url: string;
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

function LoadingSpinner() {
  return (
    <div className="loading-spinner-container">
      <div className="lds-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
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
    parseInt(localStorage.getItem("notify-interval") ?? "15"),
  );

  useEffect(() => {
    if (!permissionGranted && notificationsEnabled) {
      checkNotificationPerms().then((result) => setPermissionGranted(result));
    }
  }, [notificationsEnabled, permissionGranted]);

  useEffect(() => {
    if (notificationsEnabled) {
      sendNotification({
        body: "Notifications now enabled",
        sound: "Funk",
        title: "HubHelper Notification",
      });
    }
  }, [notificationsEnabled]);

  const notifyInterval = useRef<ReturnType<typeof setInterval>>();
  const getInterval = useRef<ReturnType<typeof setInterval>>();

  const skipUpdate = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  function enqueue(response: Response) {
    setNotificiationsQueue((prevQueue) => {
      if (!response.notifications.length) {
        return [];
      }
      const existing = prevQueue.map((n) => n.id);
      if (response.notifications.length < prevQueue.length) {
        skipUpdate.current = true;
        return response.notifications;
      }
      const updated = response.notifications.map((n) => n.id);
      for (const u of updated) {
        if (!existing.includes(u)) {
          return response.notifications;
        }
      }
      // IMPORTANT: Return previous state to prevent unnecessary re-renders
      // If queue didn't change
      return prevQueue;
    });
  }

  useEffect(() => {
    const loopedFunc = () =>
      invoke("get_notifications")
        .then((result) => enqueue(result as Response))
        .finally(() => setIsLoading(false));
    clearInterval(getInterval.current);
    loopedFunc();
    getInterval.current = setInterval(loopedFunc, 1000);

    return () => clearInterval(getInterval.current);
  }, [notificationsEnabled]);

  useEffect(() => {
    clearInterval(notifyInterval.current);
    if (
      !notificationsEnabled ||
      !notificationsQueue.length ||
      skipUpdate.current
    ) {
      skipUpdate.current = false;
      return;
    }
    const loopFunc = () => {
      if (!notificationsQueue.length) {
        clearInterval(notifyInterval.current);
        return;
      }
      sendNotification({
        body: "You have unread notifications",
        sound: "Funk",
        title: "HubHelper Notification",
      });
    };
    loopFunc();
    notifyInterval.current = setInterval(loopFunc, 1000 * 60 * intervalValue);
    return () => clearInterval(notifyInterval.current);
  }, [intervalValue, notificationsEnabled, notificationsQueue]);

  let notificationIntervalTimeout = useRef<ReturnType<typeof setTimeout>>();
  const [tempIntervalValue, setTempIntervalValue] =
    useState<number>(intervalValue);

  function onSetInterval(value: string) {
    localStorage.setItem("notify-interval", value);
    setTempIntervalValue(parseInt(value));
  }

  useEffect(() => {
    clearTimeout(notificationIntervalTimeout.current);
    notificationIntervalTimeout.current = setTimeout(() => {
      setIntervalValue(tempIntervalValue);
    }, 800);
  }, [tempIntervalValue]);

  return (
    <div className="notifications-panel">
      {isLoading && <LoadingSpinner />}
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
            <a href="https://github.com/settings/tokens" target="_blank">
              Personal Access Token
            </a>{" "}
            with <b>notifications</b> scope
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
              Remind every{" "}
              <input
                type="number"
                id="notify-interval"
                value={tempIntervalValue}
                onChange={(e) => onSetInterval(e.target.value)}
                style={{ maxWidth: "6ch" }}
              />{" "}
              minutes
            </label>
          </div>
          <NotificationsReadout
            notifications={notificationsQueue}
            setIsLoading={setIsLoading}
          />
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
