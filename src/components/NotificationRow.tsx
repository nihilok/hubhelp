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
    return `https://github.com/${parts[4]}/${[parts[5]]}/${
      parts[6] === "issues" ? "issues" : "pull"
    }/${parts[7]}`;
  }

  const icons = {
    review_requested: "fa-solid fa-user-check",
    mention: "fa-solid fa-at",
  };

  return (
    <li className="notification-row">
      <a href={buildUrl(notification.subject.url)} target="_blank">
        <div className="notification-row-grid">
          <div className="notification-icon">
            <i
              className={
                icons[notification.reason as keyof typeof icons] ??
                "fa-brands fa-github-square"
              }
            />
          </div>
          <div className="notification-text-section">
            <h4>
              {notification.reason
                .split("_")
                .map(
                  (w) => `${w.substring(0, 1).toUpperCase()}${w.substring(1)}`,
                )
                .join(" ")}
            </h4>
            <p className="notification-text">{notification.subject.title}</p>
          </div>
        </div>
      </a>
    </li>
  );
}
