/* eslint-disable max-len */
import React, {useEffect, useState} from "react";

import PropTypes from "prop-types";
import {Floppy, Play} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";

import "./ImplementationToolbar.scss";

ImplementationToolbar.propTypes = {
};

/**
 * Implementation Tool Bar component.
 * @return {JSX.Element}
 */
export function ImplementationToolbar () {
    const dispatch = useDispatch();

    /**
     * I decided to keep the toolbars separate instead of merging them into
     * one component for now.
     */

    return (
        <div className="mainToolBar">
            <div className="mainToolBarLeft">
                <div className="mainToolBarGroup"></div>
                <div className="mainToolBarGroup"></div>
            </div>
            <div className="mainToolBarRight">
                <span className="mainToolBarButton" >
                    <Play
                        size={20}
                        style={{"color": "white", "cursor": "pointer"}}/>
                    <span className="mainToolBarButton">Run Implementation</span>
                </span>

                <span className="mainToolBarButton" >
                    <Floppy
                        size={14}
                        style={{"color": "white", "cursor": "pointer"}}/>
                    <span className="mainToolBarButton">Save Design</span>
                </span>
            </div>
        </div>
    );
}
