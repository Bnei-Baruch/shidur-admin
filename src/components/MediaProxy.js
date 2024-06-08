import React, {Component} from 'react'
import {Divider, Segment, Label, Button, Select} from 'semantic-ui-react'
import {getRooms, getService, getStreamUrl, id_options, putData, rstr_options, toHms} from "../shared/tools";
import Service from "./Service";
import mqtt from "../shared/mqtt";

class MediaProxy extends Component {

    state = {
        ival: null,
        services: {},
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
        const {services} = this.state;
        const local = true
        const src = local ? topic.split("/")[3] : topic.split("/")[4];
        //console.debug("["+src+"] Message: ", message);
        if(src.match(/^(media-proxy-1|media-proxy-2)$/)) {
            services[src] = message.data;
            for(let i=0; i<services[src].length; i++) {
                services[src][i].out_time = toHms(services[src][i].runtime);
            }
            this.setState({services});
        }
    };

    runTimer = () => {
        this.getStat();
        if(this.state.ival)
            clearInterval(this.state.ival);
        let ival = setInterval(() => {
            this.getStat();
        }, 1000);
        this.setState({ival});
    };

    getStat = () => {
        mqtt.send("status", false, "exec/service/media-proxy-1");
        mqtt.send("status", false, "exec/service/media-proxy-2");
    };

    render() {
        const {services} = this.state;
        let services_list = []

        Object.keys(services).map(src => {
            services_list.push(services[src]?.map((stream,i) => {
                return (<Segment><Label size='massive'>{src}</Label><Service key={src} index={i} service={services[src][i]} id={src}
                                 saveData={this.saveData} removeRestream={this.delRestream} addNote={this.addNote} /></Segment>);
            }))
        })

        return(
            <Segment basic padded textAlign='center'>
                {services_list}
            </Segment>
        );
    }
}

export default MediaProxy;
