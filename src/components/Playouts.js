import React, {Component} from 'react'
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {Divider, Table, Segment, Label, Dropdown, Select, Message, Button, Icon} from 'semantic-ui-react'
import {
    getWorkflowData,
    channels_options,
    streamFetcher,
    vres_options,
    WFSRV_BACKEND
} from "../shared/tools";


class Playouts extends Component {

    state = {
        disabled: true,
        main: [],
        backup: [],
        trimmed: [],
        date: moment().format('YYYY-MM'),
        startDate: moment(),
        files: [],
        file_data: "",
        file_name: "",
        playout: {},
        id: "",
        status: "",
        source: "",
        trim_meta: {},
        src: "ShiurBoker",
        year: "2020",
        month: "01",
    };

    componentDidMount() {
        const {id,playouts} = this.props;
        if(id)
            this.setPlayout(id, playouts[id]);
    };

    getWorkflow = () => {
        const {src, year, month, playout} = this.state;
        let file_path = `/backup/__BACKUP/${year}-${month}/${src}`
        console.log(":: Set File Path: ",file_path);
        let req = {"req":"files", "id":"status", file_path};
        streamFetcher(playout.ip, `playout`, req,  (data) => {
            //let status = data.stdout.replace(/\n/ig, '');
            let files = JSON.parse(data.stdout)
            this.setState({files});
        });
    };

    selectFile = (file) => {
        console.log(":: Select file: ",file);
        const {src, year, month} = this.state;
        let file_path = `/backup/__BACKUP/${year}-${month}/${src}/${file}`
        this.setJsonState("file_path", file_path);
        this.setState({source: file_path, file_data: file, file_name: file, disabled: false});
        let file_name = file.split('.')[0];
        getWorkflowData(`trimmer/find?key=file_name&value=${file_name}`, (data) => {
            let chk = data.filter(b => b.original.languages);
            if(chk.length > 0) {
                console.log(":: Got workflow: ",data);
                console.log(":: Filter: ",chk);
            } else {
                console.log(":: File or languages not found in workflow :");
            }
        });
    };

    setSrc = (src) => {
        this.setState({src, disabled: true, file_data: ""});
    };

    setYear = (year) => {
        this.setState({year});
    };

    setMonth = (month) => {
        this.setState({month});
    }

    setPlayout = (id, playout) => {
        console.log(":: Set Playout: ",playout);
        this.setState({id, playout});
        let req = {"req":"strstat", "id":"status"};
        streamFetcher(playout.ip, `playout`, req,  (data) => {
            let status = data.stdout.replace(/\n/ig, '');
            console.log(":: Got playout status: ",status);
            this.setState({status});
        });
        if(id !== this.props.id)
            this.props.idState("playout_id", id);
    };

    setJsonState = (key, value) => {
        let {playout, id} = this.state;
        playout.jsonst[key] = value;
        this.props.jsonState("playouts", {[id]: playout}, id);
    };

    startPlayout = () => {
        this.setState({status: "On"});
        let {playout,file_data} = this.state;
        this.setJsonState("file_name", file_data.file_name);
        let {jsonst} = playout;
        jsonst.id = "stream";
        jsonst.req = "start";
        streamFetcher(playout.ip, `playout`, jsonst,  (data) => {
            //let status = data.stdout.replace(/\n/ig, '');
            console.log(":: Start Playout status: ",data);
            //TODO: here we need save state to db
        });
    };

    stopPlayout = () => {
        this.setState({status: "Off", file_name: null});
        this.setJsonState("file_name", null);
        let {playout} = this.state;
        let {jsonst} = playout;
        jsonst.id = "stream";
        jsonst.req = "stop";
        streamFetcher(playout.ip, `playout`, jsonst,  (data) => {
            //let status = data.stdout.replace(/\n/ig, '');
            console.log(":: Stop Playout status: ",data);
        });
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
            return ({ key: i, text: data, value: data })
        });

        const src_options = [
            { key: 1, text: 'ShiurBoker', value: 'ShiurBoker' },
            { key: 2, text: 'Special', value: 'Special' },
            { key: 3, text: 'Rawmaterial', value: 'Rawmaterial' },
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

                <Table basic='very' compact='very' collapsing>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell />
                            <Table.HeaderCell />
                            <Table.HeaderCell />
                            <Table.HeaderCell />
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>Channels</Table.Cell>
                            <Table.Cell>
                                <Select disabled={!id}
                                        compact options={channels_options}
                                        value={id ? playouts[id].jsonst.channels : ""}
                                        onChange={(e, {value}) => this.setJsonState("channels", value)}
                                />
                            </Table.Cell>
                            <Table.Cell>Format</Table.Cell>
                            <Table.Cell>
                                <Select disabled={!id}
                                        compact options={vres_options}
                                        value={id ? playouts[id].jsonst.vres : ""}
                                        onChange={(e, {value}) => this.setJsonState("vres", value)}
                                />
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Source</Table.Cell>
                            <Table.Cell>
                                <Dropdown
                                    disabled={!id}
                                    compact
                                    className="trim_src_dropdown"
                                    selection
                                    options={src_options}
                                    defaultValue="ShiurBoker"
                                    onChange={(e, {value}) => this.setSrc(value)}
                                >
                                </Dropdown>
                            </Table.Cell>
                            <Table.Cell>Date</Table.Cell>
                            <Table.Cell>
                                <Select disabled={!id}
                                        compact options={year_options}
                                        value={year}
                                        onChange={(e, {value}) => this.setYear(value)}
                                />
                                <Select disabled={!id}
                                        compact options={month_options}
                                        value={month}
                                        onChange={(e, {value}) => this.setMonth(value)}
                                />
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