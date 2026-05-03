import React, {useEffect} from "react";

import {PlusSquare} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";
import {useModalManager} from "ui-layout-manager-dev";

import {useDalEngine} from "../../Providers/GlobalProviders";
import {setHasEntryPointThunk} from "../../Store/appThunk";
import {AddBehavior} from "../Modals/AddBehavior";

import "./ToolBar.scss";

/**
 * Toolbar Component
 * @return {JSX.Element}
 */
export function ToolBar () {
    const {openModal} = useModalManager();
    const {engine} = useDalEngine();
    const dispatch = useDispatch();

    useEffect(() => {
        if (engine) {
            const entryPoint = engine.implementation.getEntryPoint();
            dispatch(setHasEntryPointThunk(Boolean(entryPoint)));
        }
    }, [engine, dispatch]);

    const addBehavior = () => {
        openModal({
            title: "Add Behavior",
            render: ({close}) => {
                return <AddBehavior close={close} />;
            },
        });
    };

    return (
        <div className="toolbarWrapper">
            <div className="toolbarContainer">
                <PlusSquare
                    onClick={(e) => addBehavior()}
                    title="Add Behavior"
                    className="icon"
                />
            </div>
            <div className="toolbarContainer bottom">
            </div>
        </div>
    );
}
