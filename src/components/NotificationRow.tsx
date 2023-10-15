import { NotificationJson } from "./NotificationsPanel.tsx";

export function NotificationRow({
  notification,
}: {
  notification: NotificationJson;
}) {
  return (
    <li className="notification-row">
      <a href={notification.subject.url} target="_blank">
        <h4>
          {notification.reason
            .split("_")
            .map((w) => `${w.substring(0, 1).toUpperCase()}${w.substring(1)}`)
            .join(" ")}
        </h4>
        <p>{notification.subject.title}</p>
      </a>
    </li>
  );
}
