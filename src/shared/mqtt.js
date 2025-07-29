import mqtt from 'mqtt';
import { MQTT_URL } from "./tools";
import log from "loglevel";

class MqttMsg {

    constructor() {
        this.user = null;
        this.mq = null;
        this.connected = false;
        this.room = null;
        this.token = null;
        this._options = null;
        this._onConnect = null;
        this._listenersBound = false;
        this._reconnectScheduled = false;
    }

    setToken = (token) => {
        this.token = token;
    }

    init = (user, callback) => {
        this.user = user;
        this._onConnect = callback;

        const transformUrl = (url, options, client) => {
            client.options.password = this.token;
            return url;
        };

        let options = {
            keepalive: 10,
            connectTimeout: 10 * 1000,
            clientId: user.id,
            protocolId: 'MQTT',
            protocolVersion: 5,
            clean: true,
            username: user.email,
            password: this.token,
            transformWsUrl: transformUrl,
            resubscribe: true,
        };

        this._options = options;
        this._createClient();
        this._bindLifecycleListeners();
    }

    _createClient = () => {
        this.mq = mqtt.connect(`wss://${MQTT_URL}`, this._options);
        this.mq.setMaxListeners(50);

        this.mq.on('connect', (data) => {
            if (data && !this.connected) {
                console.log("[mqtt] Connected to server: ", data);
            }
            this.connected = true;
            if (typeof this._onConnect === 'function') this._onConnect(data);
        });

        this.mq.on('error',      (err) => console.error('[mqtt] error:', err));
        this.mq.on('disconnect', (pck) => console.error('[mqtt] disconnect:', pck));
        this.mq.on('offline',    () => { this.connected = false; log.debug('[mqtt] offline'); });
        this.mq.on('close',      () => { this.connected = false; log.debug('[mqtt] close');   });
        this.mq.on('end',        () => { this.connected = false; log.debug('[mqtt] end');     });
        this.mq.on('reconnect',  () => { log.debug('[mqtt] reconnecting…'); });
    };

    _bindLifecycleListeners = () => {
        if (this._listenersBound) return;
        this._listenersBound = true;

        const hardReconnect = (reason) => this.hardReconnect(reason);

        window.addEventListener('pageshow', () => {
            hardReconnect('pageshow');
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') hardReconnect('visible');
        });

        window.addEventListener('online', () => {
            hardReconnect('online');
        });
    };

    hardReconnect = (reason = '') => {
        if (this._reconnectScheduled) return;
        this._reconnectScheduled = true;

        log.warn('[mqtt] hardReconnect', { reason });

        setTimeout(() => {
            this._reconnectScheduled = false;
            try { this.mq?.end(true); } catch (_) {}
            this.mq = null;
            this.connected = false;

            this._options = { ...this._options, password: this.token };

            this._createClient();
        }, 150);
    };

    join = (topic) => {
        console.debug("[mqtt] Subscribe to:", topic);
        let options = { qos: 1, nl: true };
        this.mq.subscribe(topic, { ...options }, (err) => {
            err && console.error('[mqtt] subscribe error:', err);
        });
    }

    exit = (topic) => {
        let options = {};
        console.debug("[mqtt] Unsubscribe from:", topic);
        this.mq.unsubscribe(topic, { ...options }, (err) => {
            err && console.error('[mqtt] unsubscribe error:', err);
        });
    }

    send = (message, retain, topic, rxTopic, user) => {
        if (!this.mq || !this.mq.connected) {
            log.debug('[mqtt] skip publish (not connected):', topic);
            return;
        }
        log.debug(
            "%c[mqtt] --> send message | topic: " + topic + " | data: " + message,
            "color: darkgrey"
        );

        let properties = rxTopic
            ? { userProperties: user || this.user, responseTopic: rxTopic }
            : { userProperties: user || this.user };

        let options = { qos: 1, retain, properties };
        this.mq.publish(topic, message, { ...options }, (err) => {
            err && log.error("[mqtt] publish error:", err);
        });
    };

    watch = (callback, stat) => {
        this.mq.on('message', (topic, data, packet) => {
            let cd = packet?.properties?.correlationData
                ? " | transaction: " + packet?.properties?.correlationData?.toString()
                : "";
            let msg;
            try {
                msg = JSON.parse(data);
                log.debug("%c[mqtt] <-- receive message" + cd + " | topic : " + topic, "color: darkgrey", msg);
            } catch (e) {
                log.debug("%c[mqtt] <-- receive message" + cd + " | topic : " + topic, "color: darkgrey", data.toString());
                typeof callback === "function" && callback(data.toString(), topic);
                return;
            }

            const t = topic.split("/");
            const [root, service, id] = t;

            switch (root) {
                case "janus": {
                    const json = msg;
                    const mit = json?.session_id || packet?.properties?.userProperties?.mit || service;
                    if (id === "from-janus-admin") {
                        typeof callback === "function" && callback(json, topic);
                    } else {
                        this.mq.emit(mit, data, id);
                    }
                    break;
                }
                default:
                    if (typeof callback === "function") callback(msg, topic);
            }
        });
    }
}

const defaultMqtt = new MqttMsg();
export default defaultMqtt;
