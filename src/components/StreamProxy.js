import React, {Component} from 'react'
import {Divider, Segment, Label, Button, Select} from 'semantic-ui-react'
import {getRooms, getService, getStreamUrl, id_options, putData, rstr_options, toHms} from "../shared/tools";
import Service from "./Service";
import mqtt from "../shared/mqtt";

class StreamProxy extends Component {

    state = {
        restream: {},
        id: "stream-proxy",
        ival: null,
        services: [],
        status: "",
        description: "",
        name: "",
        language: "heb",
        rsid: "fb",
        url: "",
        db: {
            restream: []
        }
    };

    componentDidMount() {
        this.props.onRef(this)
        this.runTimer();
    };

    componentWillUnmount() {
        this.props.onRef(undefined)
        clearInterval(this.state.ival);
    };

    onMqttMessage = (message, topic) => {
        //console.debug("[live-proxy] Message: ", message);
        let services = message.data;
        const local = true
        const src = local ? topic.split("/")[3] : topic.split("/")[4];
        if(services && this.state.id === src) {
            for(let i=0; i<services.length; i++) {
                services[i].out_time = toHms(services[i].runtime);
            }
            this.setState({services});
        }
    };

    addRestream = () => {
        const {restream} = this.props;
        const {rsid, language, description, id} = this.state;
        if(!restream[id].services) {
            restream[id].services = [];
        }
        const srv_id = language + "-" + rsid + "-" + (restream[id].services.length + 1).toString();
        restream[id].services.push({description, id: srv_id, name: "ffmpeg", args: []});
        this.saveData(restream[id])
    };

    delRestream = (i) => {
        const {restream} = this.props;
        const {id, services} = this.state;
        if(services[i].alive)
            return;
        restream[id].services.splice(i, 1);
        this.saveData(restream[id])
    };

    addNote = (i, description) => {
        const {restream} = this.props;
        const {id} = this.state;
        restream[id].services[i].description = description;
        getStreamUrl(this.state.language, url => {
            let cmd = `-progress stat_${id}.log -hide_banner -re -i ${url} -c:v copy -c:a libfdk_aac -b:a 64k -f flv ${description}`
            let arg = cmd.split(" ");
            restream[id].services[i].args = arg;
            this.saveData(restream[id])
        });
    };

    saveData = (props) => {
        putData(`streamer/restream/stream-proxy`, props, (data) => {
            console.log("saveProp callback: ", data);
        });
    };

    startEncoder = () => {
        let {id} = this.state;
        getService(id + "/start", () => {})
    };

    stopEncoder = () => {
        let {id} = this.state;
        getService(id + "/stop", () => {})
    };

    runTimer = () => {
        this.getStat();
        if(this.state.ival)
            clearInterval(this.state.ival);
        let ival = setInterval(() => {
            this.getStat();
        }, 10000);
        this.setState({ival});
    };

    getStat = () => {
        const {id} = this.state;
        mqtt.send("status", false, "exec/service/" + id);
    };

    render() {
        const {rsid, id, services, language} = this.state;

        let services_list = services.map((stream,i) => {
            return (<Service key={i} index={i} service={services[i]} id={id}
                             saveData={this.saveData} removeRestream={this.delRestream} addNote={this.addNote} />);
        });

        return(
            <Segment padded textAlign='center' color='brown'>
                <Divider />

                <Label size='big' >
                    <Select compact options={rstr_options} value={language} size='big'
                            onChange={(e, {value}) => this.setState({language: value})} />
                    <Select compact options={id_options} value={rsid} size='big'
                            onChange={(e, {value}) => this.setState({rsid: value})} />
                    <Button size='big' color='green' onClick={this.addRestream}>Add</Button>
                </Label>
                <Divider />

                {services_list}

            </Segment>
        );
    }
}

export default StreamProxy;
