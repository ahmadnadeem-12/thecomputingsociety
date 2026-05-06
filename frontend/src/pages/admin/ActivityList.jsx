
import React from "react";

export default function ActivityList({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="emptyActivity">
        <p>No recent activity to show.</p>
      </div>
    );
  }

  return (
    <ul className="activityList">
      {activities.map((activity, index) => (
        <li key={index} className="activityItem">
          <div className="activityDot" />
          <div className="activityContent">
            <p className="activityText">{activity.text}</p>
            <span className="activityTime">{activity.time}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
