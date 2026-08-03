import pty from "node-pty";
import os from "os";
import { EventEmitter } from "events";
import path from "node:path";

const workspacePath = path.join(process.cwd(), "workspace");
const bashRcFile = path.join(process.cwd(), "terminal.bashrc");

/**
 * Class to interface with terminal. It exposes functions
 * to control its state and emits events which allows the
 * consumer to react to the events.
 * 
 * In this case, a websocket acts as a bridge between the
 * terminal UI in the front end and the backend server.
 */
export class TerminalSession extends EventEmitter {
    constructor(args = {}, options = {}) {
        super();

        this.shell = options.shell || (os.platform() === "win32"
            ? "powershell.exe"
            : process.env.SHELL || "bash");

        // If design name is provided, set the working directory to the design repo
        if ("designName" in args && args["designName"]) {
            this.cwd = path.join(process.cwd(), "workspace", args["designName"])
            this.name = this.designName;
        } else {
            this.cwd = options.cwd || workspacePath;
            this.name = options.name || "xterm-color";
        }

        this.env = options.env || process.env;
        this.cols = options.cols || 80;
        this.rows = options.rows || 24;

        this.ptyProcess = null;
        this.args = args;
    }

    start() {
        if (this.ptyProcess) return; 

        if (this.args?.command) {
            this.ptyProcess = pty.spawn("/bin/bash", ["-c", this.args.command], {
                name: this.name,
                cwd: this.cwd,
                env: this.env,
                cols: this.cols,
                rows: this.rows,
            });
        } else {
            this.ptyProcess = pty.spawn("/bin/bash", ["--rcfile", bashRcFile, "-i"], {
                name: this.name,
                cwd: this.cwd,
                env: this.env,
                cols: this.cols,
                rows: this.rows,
            });
        }

        this.ptyProcess.onData(
            (data) => {
                // console.log("Received from terminal:", data);
                this.emit("data", data)
            }
        );

        this.ptyProcess.onExit((exit) => {
            this.emit("exit", exit);
            this.ptyProcess = null;
        });

        this.emit("start");
    }

    write(data) {
        if (!this.ptyProcess) {
            // TODO: Restart?
            return;
        }
        // console.log("Writing to terminal:", data);
        this.ptyProcess?.write(data);
    }

    resize(cols, rows) {
        if (!cols || !rows) return;
        this.cols = cols;
        this.rows = rows;
        this.ptyProcess?.resize(cols, rows);
    }

    stop() {
        if (!this.ptyProcess) return;

        try {
            if (os.platform() === "win32") {
                this.ptyProcess.kill();
            } else {
                this.ptyProcess.kill("SIGTERM");
            }
        } catch (e) {
            this.ptyProcess.kill();
        }

        this.ptyProcess = null;
        this.emit("stop");
    }

    restart() {
        this.stop();
        this.start();
    }

    isRunning() {
        return !!this.ptyProcess;
    }
}
