import React from "react";
import classes from "./Sidebar.css"

export default function SideBar() {
  return (
      <div className="SideBar">
        <div className="SideBar-item Active-item">
          <div>Moje články</div>
        </div>
        <div className="SideBar-item">
          <div>Zdieľané so mnou</div>
        </div>
        <div className="SideBar-item">
          <div>Archivované</div>
        </div>
        <div className="SideBar-item">
          <div>Mnou recenzované</div>
        </div>
        <div className="SideBar-item">
          <div>Schválené</div>
        </div>
      </div>
  );
}
