import React, {Component} from 'react'
import {Divider, Segment, Label, Button, List} from 'semantic-ui-react'
import log from "loglevel";
import {toHms} from "../shared/tools";
import Service from "./Service";
import mqtt from "../shared/mqtt";

const NODES = ["media-proxy-1", "media-proxy-2"];

const stateColor = (s) => {
    switch (s) {
        case "MASTER": return "green";
        case "BACKUP": return "blue";
        case "FAULT":  return "red";
        default:       return "grey";
    }
};

class MediaProxy extends Component {

    state = {
        ival: null,
        kival: null,
        services: {},
        keepalived: {
            "media-proxy-1": null,
            "media-proxy-2": null,
        },
        keepalived_pending: {
            "media-proxy-1": null,
            "media-proxy-2": null,
        },
    };

    pendingRequests = {};

    componentDidMount() {
        this.props.onRef(this);
        this.runTimer();
        this.runKeepalivedTimer();
    };

    componentWillUnmount() {
        this.props.onRef(undefined);
        clearInterval(this.state.ival);
        clearInterval(this.state.kival);
    };

    onMqttMessage = (message, topic) => {
        const parts = topic.split("/");
        const local = true;
        const family = local ? parts[1] : parts[2];
        const src    = local ? parts[3] : parts[4];

        if (family === "service") {
            if (src && src.match(/^(media-proxy-1|media-proxy-2)$/) && message?.action === "status") {
                const services = {...this.state.services};
                services[src] = message.data;
                for (let i = 0; i < services[src].length; i++) {
                    services[src][i].out_time = toHms(services[src][i].runtime);
                }
                this.setState({services});
            }
            return;
        }

        if (family === "cmd") {
            if (!src || !src.match(/^(media-proxy-1|media-proxy-2)$/)) return;
            this.handleCmdResponse(src, message);
            return;
        }
    };

    handleCmdResponse = (node, msg) => {
        const {id, exit_code, stdout, stderr, error, request_id} = msg || {};
        log.debug("[media-proxy] cmd response:", node, id, msg);

        if (request_id && this.pendingRequests[request_id]) {
            delete this.pendingRequests[request_id];
        }

        const isError = (exit_code !== 0) || (error !== null && error !== undefined);

        if (id === "mpx-watchdog-status") {
            let parsed;
            if (isError) {
                parsed = {error: error || stderr || `exit_code=${exit_code}`};
            } else {
                try {
                    parsed = JSON.parse(stdout);
                } catch (e) {
                    log.warn("[media-proxy] failed to parse status JSON for", node, e);
                    parsed = {error: "Failed to parse status JSON"};
                }
            }
            this.setState(prev => ({
                keepalived: {...prev.keepalived, [node]: parsed},
            }));
            return;
        }

        if (id === "mpx-watchdog-promote" || id === "mpx-watchdog-demote" || id === "mpx-watchdog-reset") {
            this.setState(prev => ({
                keepalived_pending: {...prev.keepalived_pending, [node]: null},
            }));
            if (isError) {
                const text = error || stderr || `${id} failed (exit_code=${exit_code})`;
                log.error("[media-proxy] cmd error:", node, id, text);
                window.alert(`${node}: ${text}`);
            }
            this.getKeepalivedStatus();
            return;
        }
    };

    runTimer = () => {
        this.getStat();
        if (this.state.ival) clearInterval(this.state.ival);
        let ival = setInterval(() => {
            this.getStat();
        }, 1000);
        this.setState({ival});
    };

    runKeepalivedTimer = () => {
        this.getKeepalivedStatus();
        if (this.state.kival) clearInterval(this.state.kival);
        let kival = setInterval(() => {
            this.getKeepalivedStatus();
        }, 3000);
        this.setState({kival});
    };

    getStat = () => {
        mqtt.send("status", false, "exec/service/media-proxy-1");
        mqtt.send("status", false, "exec/service/media-proxy-2");
    };

    getKeepalivedStatus = () => {
        NODES.forEach(node => {
            const requestId = `mpx-watchdog-status-${node}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            this.pendingRequests[requestId] = {node, action: "status"};
            mqtt.send(
                JSON.stringify({request_id: requestId, id: "mpx-watchdog-status"}),
                false,
                `exec/cmd/${node}`
            );
        });
    };

    cmdSwitch = (node, action) => {
        const labels = {promote: "Promote", demote: "Demote", reset: "Reset"};
        const confirmed = window.confirm(
            `${labels[action]} ${node}? Это переключит VIP 10.77.1.1 на keepalived.`
        );
        if (!confirmed) return;

        this.setState(prev => ({
            keepalived_pending: {...prev.keepalived_pending, [node]: action},
        }));

        const cmdId = `mpx-watchdog-${action}`;
        const requestId = `${cmdId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        this.pendingRequests[requestId] = {node, action};
        mqtt.send(
            JSON.stringify({request_id: requestId, id: cmdId}),
            false,
            `exec/cmd/${node}`
        );
    };

    formatTransition = (k) => {
        if (!k || !k.last_transition) return "—";
        const ts = Date.parse(k.last_transition);
        if (isNaN(ts)) return k.last_transition;
        const elapsed = Math.max(0, Math.floor((Date.now() - ts) / 1000));
        const to = k.last_transition_to ? ` to ${k.last_transition_to}` : "";
        return `${toHms(elapsed)} ago${to}`;
    };

    renderKeepalivedNode = (node) => {
        const k = this.state.keepalived[node];
        const pending = this.state.keepalived_pending[node];
        const hasError = !!(k && k.error);
        const nodeState = hasError ? "ERROR" : ((k && k.node_state) || "UNKNOWN");
        const color = hasError ? "red" : stateColor(nodeState);
        const errorTitle = hasError ? k.error : undefined;

        const vipPresent = !!(k && !hasError && k.vip_present);
        const vip   = (k && !hasError && k.vip) || "10.77.1.1";
        const iface = (k && !hasError && k.interface) || "";
        const cur = (k && !hasError && typeof k.current_priority === "number") ? k.current_priority : null;
        const def = (k && !hasError && typeof k.default_priority === "number") ? k.default_priority : null;
        const priorityDiff = (cur !== null && def !== null && cur !== def);
        const keepalivedActive = !!(k && !hasError && k.keepalived_active);

        const isMaster = nodeState === "MASTER";
        const isBackup = nodeState === "BACKUP";
        const busy = pending !== null;

        return (
            <Segment key={node} textAlign='center'>
                <Label attached='top' size='big'>{node}</Label>
                <Divider hidden />

                <Label color={color} size='large' title={errorTitle}>{nodeState}</Label>

                <Divider />

                <List relaxed verticalAlign='middle' style={{textAlign: 'left', display: 'inline-block'}}>
                    <List.Item>
                        <List.Icon name={vipPresent ? 'check' : 'close'} color={vipPresent ? 'green' : 'red'} />
                        <List.Content>
                            VIP: <b>{vip}</b>{iface ? ` (${iface})` : ""} — {vipPresent ? "Present" : "Absent"}
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name='shield' />
                        <List.Content>
                            Priority:{" "}
                            <span style={priorityDiff ? {fontWeight: 'bold', color: '#b58105'} : {}}>
                                {cur !== null ? cur : "—"}
                            </span>
                            {def !== null ? <span style={{color: '#888'}}>{` / default ${def}`}</span> : null}
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon
                            name={keepalivedActive ? 'check' : 'close'}
                            color={keepalivedActive ? 'green' : 'red'}
                        />
                        <List.Content>
                            keepalived: {keepalivedActive ? "active" : "inactive"}
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name='clock outline' />
                        <List.Content>
                            Last transition: {this.formatTransition(k)}
                        </List.Content>
                    </List.Item>
                </List>

                <Divider />

                <Button.Group>
                    <Button color='green'
                            disabled={busy || isMaster}
                            loading={pending === 'promote'}
                            onClick={() => this.cmdSwitch(node, 'promote')}>
                        Promote
                    </Button>
                    <Button.Or />
                    <Button color='blue'
                            disabled={busy || isBackup}
                            loading={pending === 'demote'}
                            onClick={() => this.cmdSwitch(node, 'demote')}>
                        Demote
                    </Button>
                    <Button.Or />
                    <Button color='grey'
                            disabled={busy}
                            loading={pending === 'reset'}
                            onClick={() => this.cmdSwitch(node, 'reset')}>
                        Reset
                    </Button>
                </Button.Group>
            </Segment>
        );
    };

    render() {
        const {services} = this.state;
        let services_list = [];

        Object.keys(services).forEach(src => {
            services_list.push(services[src]?.map((stream, i) => {
                return (
                    <Segment key={`${src}-${i}`}>
                        <Label attached='top' size='big'>{src}</Label>
                        <Divider />
                        <Service key={src} index={i} service={services[src][i]} id={src} />
                    </Segment>
                );
            }));
        });

        return (
            <Segment basic padded textAlign='center'>
                <Segment.Group horizontal>
                    {NODES.map(this.renderKeepalivedNode)}
                </Segment.Group>
                <Divider hidden />
                {services_list}
            </Segment>
        );
    }
}

export default MediaProxy;
