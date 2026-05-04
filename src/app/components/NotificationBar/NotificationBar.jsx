import { Fragment, useState } from "react";
import useSettings from "app/hooks/useSettings";
import useNotification from "app/hooks/useNotification";

export default function NotificationBar({ container }) {
  const { settings } = useSettings();
  const [panelOpen, setPanelOpen] = useState(false);
  const { deleteNotification, clearNotifications, notifications } = useNotification();

  const handleDrawerToggle = () => setPanelOpen(!panelOpen);

  return (
    <Fragment>

    </Fragment>
  );
}
