import { NotificationJson } from "./NotificationsPanel.tsx";
import { NotificationRow } from "./NotificationRow.tsx";

export function NotificationsReadout({
  notifications,
  setIsLoading,
}: {
  notifications: NotificationJson[];
  setIsLoading: (l: boolean) => void;
}) {
  return notifications.length > 0 ? (
    <>
      <div className="notifications-table-header">Unread Notifications:</div>
      <div className="notifications-table">
        {notifications.map((n) => (
          <NotificationRow notification={n} setIsLoading={setIsLoading} />
        ))}
      </div>
    </>
  ) : (
    <div className="notifications-table-header">No Unread Notifications</div>
  );
}
