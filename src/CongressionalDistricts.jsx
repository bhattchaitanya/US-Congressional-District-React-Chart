
import React from 'react';
import * as topojson from 'topojson';
import * as d3 from 'd3';
import './App.css';

class CongressionalDistricts extends React.Component {
    constructor() {
        super()
        this.svgRef = React.createRef();

        this.state = {
            usData: null,
            usCongress: null
        }
    }

    componentWillMount() {
        Promise.all(
            [
                d3.json('https://raw.githubusercontent.com/Swizec/113th-congressional-districts/master/public/us.json'),
                d3.json('https://raw.githubusercontent.com/Swizec/113th-congressional-districts/master/public/us-congress-113.json')
            ])
            .then((results) => {
                console.log(results)
                // do stuff
                this.setState({
                    usData: results[0],
                    usCongress: results[1]
                });
            })
    }
    componentDidUpdate() {
        const svg = d3.select(this.refs.anchor),
        { width, height } = this.props;

        const projection = d3.geoAlbers()
            .scale(1280)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath(projection);

        const us = this.state.usData,
        congress = this.state.usCongress;

        svg.append("defs").append("path")
            .attr("id", "land")
            .datum(topojson.feature(us, us.objects.land))
            .attr("d", path);

        svg.append("clipPath")
            .attr("id", "clip-land")
            .append("use")
            .attr("xlink:href", "#land");

        svg.append("g")
            .attr("class", "districts")
            .attr("clip-path", "url(#clip-land)")
            .selectAll("path")
            .data(topojson.feature(congress, congress.objects.districts).features)
            .enter().append("path")
            .attr("d", path)
            .append("title")
            .text(function (d) { return d.id; });

        svg.append("path")
            .attr("class", "district-boundaries")
            .datum(topojson.mesh(congress, congress.objects.districts, function (a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); }))
            .attr("d", path);

        svg.append("path")
            .attr("class", "state-boundaries")
            .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
            .attr("d", path);
    }

    render() {
        console.log("here", this.state.usCongress)

        const { usData, usCongress } = this.state;
        if (!usData || !usCongress) {
            console.log("null data found!!")
            return null;
        }
        return <g ref="anchor" />;
    }
}
export default CongressionalDistricts;