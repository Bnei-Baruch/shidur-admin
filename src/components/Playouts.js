import React, {Component} from 'react'
//import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {Divider, Table, Segment, Label, Dropdown, Select, Message, Button, Icon} from 'semantic-ui-react'
import {getWorkflowData, langch_options, streamFetcher, toHms, vres_options} from "../shared/tools";
import mqtt from "../shared/mqtt";


class Playouts extends Component {

    state = {
        disabled: true,
        main: [],
        backup: [],
        trimmed: [],
        date: new Date().toLocaleDateString('sv'),
        startDate: new Date(),
        files: [],
        file_data: "",
        file_name: "",
        playout: {},
        id: "",
        status: "Off",
        source: "",
        trim_meta: {},
        src: "Workflow",
        year: "2020",
        month: "01",
    };

    componentDidMount() {
        this.props.onRef(this)
        const {id,playouts} = this.props;
        if(id)
            this.setPlayout(id, playouts[id]);
    };

    componentWillUnmount() {
        this.props.onRef(undefined)
        clearInterval(this.state.ival);
    };

    getStat = () => {
        mqtt.send("status", false, "exec/service/gst-play-1/sdi");
    };

    onMqttMessage = (message, topic) => {
        const local = true
        const src = local ? topic.split("/")[3] : topic.split("/")[4];
        console.log("[playout] Message: ", message);
        if(message.action === "status") {
            const status = message.data.alive ? "On" : "Off";
            this.setState({status});
        }
    };

    getWorkflow = (date) => {
        getWorkflowData(`source/find?key=date&value=${this.state.date}`, (data) => {
            console.log(":: Got workflow: ",data);
            this.setState({files: data})
        });
    };

    selectFile = (data) => {
        console.log(":: Select file: ", data);
        const {src, id, playout, date} = this.state;
        let file_path = `/backup/files/sources/${date.split('-').join('/')}/${data.file_name}`
        playout.jsonst.file_name = data.file_name;
        playout.jsonst.source_id = data.source_id;
        playout.jsonst.file_path = file_path;
        this.props.jsonState("playouts", {[id]: playout}, id);
        this.setState({source: file_path, file_data: data, file_name: data.file_name, disabled: false});
    };

    setSrc = (src) => {
        this.setState({src, disabled: true, file_data: ""});
    };

    changeDate = (data) => {
        let date = data.toLocaleDateString('sv');
        this.setState({startDate: data, date});
    };

    setPlayout = (id, playout) => {
        console.log(":: Set Playout: ",playout);
        this.setState({id, playout});
        if(id !== this.props.id)
            this.props.idState("playout_id", id);
        this.getStat()
    };

    setJsonState = (key, value) => {
        let {playout, id} = this.state;
        playout.jsonst[key] = value;
        this.props.jsonState("playouts", {[id]: playout}, id);
    };

    startPlayout = () => {
        this.setState({status: "On"});
        mqtt.send("start", false, "exec/service/gst-play-1/sdi");
    };

    stopPlayout = () => {
        this.setState({status: "Off", file_name: null});
        mqtt.send("stop", false, "exec/service/gst-play-1/sdi");
    };

    render() {

        const {playouts} = this.props;
        const {playout, id, status, src, files, year, month} = this.state;

        let dec_options = Object.keys(playouts).map((id, i) => {
            let playout = playouts[id];
            return (
                <Dropdown.Item
                    key={i}
                    onClick={() => this.setPlayout(id, playout)}>{playout.name}
                </Dropdown.Item>
            )
        });

        let files_list = files.map((data, i) => {
            return ({ key: i, text: data.file_name, value: data })
        });

        const src_options = [
            { key: 1, text: 'Workflow', value: 'Workflow' },
            { key: 2, text: 'Backup', value: 'Backup' },
        ];

        const year_options = [
            { key: 1, text: '2020', value: '2020' },
            { key: 2, text: '2019', value: '2019' },
            { key: 3, text: '2018', value: '2018' },
        ];

        const month_options = [
            { key: 1, text: '01', value: '01' },
            { key: 2, text: '02', value: '02' },
            { key: 3, text: '03', value: '03' },
            { key: 4, text: '04', value: '04' },
            { key: 5, text: '05', value: '05' },
            { key: 6, text: '06', value: '06' },
            { key: 7, text: '07', value: '07' },
            { key: 8, text: '08', value: '08' },
            { key: 9, text: '09', value: '09' },
            { key: 10, text: '10', value: '10' },
            { key: 11, text: '11', value: '11' },
            { key: 12, text: '12', value: '12' },
        ];

        return(
            <Segment textAlign='center' color={status === "On" ? 'green' : 'red'} raised>
                <Label attached='top' size='big' >
                    <Dropdown item text={id ? playout.name : "Select:"}>
                        <Dropdown.Menu>{dec_options}</Dropdown.Menu>
                    </Dropdown>
                </Label>
                <Divider />

                <Table basic='very'>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell />
                            <Table.HeaderCell />
                            <Table.HeaderCell />
                            <Table.HeaderCell />
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {/*<Table.Row>*/}
                        {/*    <Table.Cell>Channels</Table.Cell>*/}
                        {/*    <Table.Cell>*/}
                        {/*        <Select disabled={!id}*/}
                        {/*                compact options={langch_options}*/}
                        {/*                value={id ? playouts[id].jsonst.channels : ""}*/}
                        {/*                onChange={(e, {value}) => this.setJsonState("channels", value)}*/}
                        {/*        />*/}
                        {/*    </Table.Cell>*/}
                        {/*    <Table.Cell>Format</Table.Cell>*/}
                        {/*    <Table.Cell>*/}
                        {/*        <Select disabled={!id}*/}
                        {/*                compact options={vres_options}*/}
                        {/*                value={id ? playouts[id].jsonst.vres : ""}*/}
                        {/*                onChange={(e, {value}) => this.setJsonState("vres", value)}*/}
                        {/*        />*/}
                        {/*    </Table.Cell>*/}
                        {/*</Table.Row>*/}
                        <Table.Row>
                            <Table.Cell>Source</Table.Cell>
                            <Table.Cell>
                                <Dropdown
                                    disabled={!id}
                                    compact
                                    className="trim_src_dropdown"
                                    selection
                                    options={src_options}
                                    defaultValue="Workflow"
                                    onChange={(e, {value}) => this.setSrc(value)}
                                >
                                </Dropdown>
                            </Table.Cell>
                            <Table.Cell>Date</Table.Cell>
                            <Table.Cell>
                                <DatePicker
                                    className="datepickercs"
                                    dateFormat="yyyy-MM-dd"
                                    // locale={he}
                                    showYearDropdown
                                    showMonthDropdown
                                    scrollableYearDropdown
                                    maxDate={new Date()}
                                    selected={this.state.startDate}
                                    onChange={this.changeDate}
                                />
                                {/*<Select disabled={!id}*/}
                                {/*        compact options={year_options}*/}
                                {/*        value={year}*/}
                                {/*        onChange={(e, {value}) => this.setYear(value)}*/}
                                {/*/>*/}
                                {/*<Select disabled={!id}*/}
                                {/*        compact options={month_options}*/}
                                {/*        value={month}*/}
                                {/*        onChange={(e, {value}) => this.setMonth(value)}*/}
                                {/*/>*/}
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell><b>Files</b></Table.HeaderCell>
                            <Table.HeaderCell colSpan='4'>
                                <Dropdown
                                    disabled={!id}
                                    className="trim_files_dropdown"
                                    error={this.state.disabled}
                                    scrolling={false}
                                    placeholder="Select File To Play:"
                                    selection
                                    value={this.state.file_data}
                                    options={files_list}
                                    onChange={(e,{value}) => this.selectFile(value)}
                                    onClick={() => this.getWorkflow(this.state.date)}
                                >
                                </Dropdown>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>

                <Message className='or_buttons' >
                    <Button.Group >
                        <Button positive disabled={status !== "Off"}
                        onClick={this.startPlayout}>Start</Button>
                        <Button.Or text='out' />
                        <Button negative disabled={status !== "On"}
                        onClick={this.stopPlayout}>Stop</Button>
                    </Button.Group>
                    {id ? <Label className='file_name'><Icon name='play' />{playouts[id].jsonst.file_name}</Label> : ""}
                </Message>

            </Segment>
        );
    }
}

export default Playouts;
