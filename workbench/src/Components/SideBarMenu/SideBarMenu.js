import React from "react";

import {BoxArrowLeft} from "react-bootstrap-icons";

import "./SideBarMenu.scss";

/**
 * Side bar menu of app.
 * @return {JSX.Element}
 */
export function SideBarMenu () {
    const returnToMenu = () => {
        window.location.href = "/";
    };

    return (
        <div className="side-bar">
            <div className="top"></div>
            <div className="bottom">
                <BoxArrowLeft
                    title="Return to Design Menu"
                    onClick={returnToMenu}
                    size={20}
                    className="icon"
                />
            </div>
        </div>
    );
}
