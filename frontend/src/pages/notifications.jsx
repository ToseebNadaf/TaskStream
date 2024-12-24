import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata";
import NotificationCard from "../components/notification-card";
import LoadMoreDataBtn from "../components/load-more";
import toast, { Toaster } from "react-hot-toast";

const Notifications = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const { access_token, new_notification_available } = userAuth;

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);

  const filters = ["all", "like", "comment", "reply"];

  const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/notifications`,
        { page, filter, deletedDocCount },
        {
          headers: { Authorization: `${access_token}` },
        }
      )
      .then(async ({ data: { notifications: data } }) => {
        if (new_notification_available) {
          setUserAuth({ ...userAuth, new_notification_available: false });
        }

        const formattedData = await filterPaginationData({
          state: notifications,
          data,
          page,
          countRoute: "/all-notifications-count",
          data_to_send: { filter },
          user: access_token,
        });

        setNotifications(formattedData);
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
        toast.error("Failed to fetch notifications. Please try again.");
      });
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  const handleFilter = (e) => {
    const selectedFilter = e.target.innerHTML.toLowerCase();
    setFilter(selectedFilter);
    setNotifications(null);
  };

  return (
    <>
      <Toaster />
      <div>
        <h1 className="max-md:hidden capitalize font-bold text-3xl">
          Recent Notifications
        </h1>

        <div className="my-8 flex gap-6">
          {filters.map((filterName, i) => {
            return (
              <button
                key={i}
                className={
                  "py-2 " + (filter == filterName ? "btn-dark" : "btn-light")
                }
                onClick={handleFilter}
              >
                {filterName}
              </button>
            );
          })}
        </div>

        {notifications == null ? (
          <Loader />
        ) : (
          <>
            {notifications.results.length ? (
              notifications.results.map((notification, i) => {
                return (
                  <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                    <NotificationCard
                      data={notification}
                      index={i}
                      notificationState={{ notifications, setNotifications }}
                    />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="Nothing available" />
            )}

            <LoadMoreDataBtn
              state={notifications}
              fetchDataFun={fetchNotifications}
              additionalParam={{
                deletedDocCount: notifications.deletedDocCount,
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Notifications;
