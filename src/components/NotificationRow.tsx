import { NotificationJson } from "./NotificationsPanel.tsx";

export function NotificationRow({
  notification,
}: {
  notification: NotificationJson;
}) {
  function buildUrl(apiUrl: string) {
    if (!apiUrl) {
      return "#";
    }
    const parts = apiUrl.split("/");
    return `https://github.com/${parts[4]}/${[parts[5]]}/${parts[6]}/${
      parts[7]
    }`;
  }
  return (
    <li className="notification-row">
      <a href={buildUrl(notification.subject.url)} target="_blank">
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
