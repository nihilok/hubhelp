import { NotificationJson } from "./NotificationsPanel.tsx";
import { invoke } from "@tauri-apps/api/tauri";

export function NotificationRow({
  notification,
  setIsLoading,
}: {
  notification: NotificationJson;
  setIsLoading: (l: boolean) => void;
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
    team_mention: "fa-solid fa-at",
    assign: "fa-regular ha-hand-point-right",
  };

  return (
    <li className="notification-row">
      <div className="notification-row-grid">
        <div className="notification-icon">
          <a href={buildUrl(notification.subject.url)} target="_blank">
            <i
              className={
                icons[notification.reason as keyof typeof icons] ??
                "fa-brands fa-github-square"
              }
            />
          </a>
        </div>
        <div className="notification-text-section">
          <a href={buildUrl(notification.subject.url)} target="_blank">
            <h4>
              {notification.reason
                .split("_")
                .map(
                  (w) => `${w.substring(0, 1).toUpperCase()}${w.substring(1)}`,
                )
                .join(" ")}
            </h4>
            <p className="notification-text">{notification.subject.title}</p>
          </a>
        </div>
        <i
          className="fa-solid fa-bell-slash notification-option"
          onClick={() => {
            setIsLoading(true);
            invoke("unsubscribe", { url: notification.subscription_url });
          }}
        />
      </div>
    </li>
  );
}
