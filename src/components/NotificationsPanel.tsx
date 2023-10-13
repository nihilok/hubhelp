import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface INotification {
  id: string;
  subject: { title: string; url: string; latest_comment_url: string };
  reason: string;
  updated_at: string;
}

type Response = { notifications: INotification[] };

export function NotificationsPanel() {
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
    INotification[]
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

  const interval = useRef<ReturnType<typeof setInterval>>();

  function enqueue(response: Response) {
    setNotificiationsQueue([...notificationsQueue, ...response.notifications]);
    console.log(response.notifications);
  }

  function dequeue() {
    setNotificiationsQueue(([_, ...rest]) => rest);
  }

  useEffect(() => {
    if (!notificationsQueue.length) {
      return;
    }
    const nextNotification = notificationsQueue[0];
    sendNotification({
      title: nextNotification.reason
        .split("_")
        .map(
          (word) => `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`,
        )
        .join(" "),
      body: nextNotification.subject.title,
      sound: "Pop",
    });
    dequeue();
  }, [notificationsQueue]);

  useEffect(() => {
    if (notificationsEnabled) {
      const loopedFunc = () =>
        invoke("get_notifications").then((result) =>
          enqueue(result as Response),
        );
      clearInterval(interval.current);
      loopedFunc();
      interval.current = setInterval(loopedFunc, 1000 * intervalValue);
    } else {
      clearInterval(interval.current);
    }
    return () => clearInterval(interval.current);
  }, [notificationsEnabled, intervalValue]);

  function onSetInterval(value: string) {
    localStorage.setItem("notify-interval", value);
    setIntervalValue(parseInt(value));
  }

  return (
    <>
      <br />
      <div className="row-center gap-1">
        <a href={"https://github.com/notifications"} target="_blank">
          Go to Notifications
        </a>
      </div>
      <br />
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
          Check every{" "}
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
    </>
  );
}
