import React, { Component } from "react";
import PropTypes from "prop-types";

import nodeToHTML from "./utils/nodeToHTML";
import subnodesToHTML from "./utils/subnodesToHTML";
import { getDimensions, getViewBox } from "./utils/dimensions";
import { d3Connections, d3Nodes, d3Drag, d3PanZoom, onTick } from "./utils/d3";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  zoom,
  zoomIdentity
} from "d3";
export default class MyReactCompoennt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      simulation: null
    };
  }
  static propTypes = {
    nodes: PropTypes.array,
    connections: PropTypes.array,
    editable: PropTypes.boolean
  };
  static defaultProps = { nodes: [], connections: [], editable: false };
  prepareNodes() {
    const render = node => {
      this.setState({ html: nodeToHTML(node) });
      this.setState({ nodesHTML: subnodesToHTML(node.nodes) });

      const dimensions = getDimensions(node.html, {}, "mindmap-node");
      this.setState({ width: dimensions.width });
      this.setState({ height: dimensions.height });

      const nodesDimensions = getDimensions(
        node.nodesHTML,
        {},
        "mindmap-subnodes-text"
      );
      this.setState({ nodesWidth: nodesDimensions.width });
      this.setState({ nodesHeight: nodesDimensions.height });
    };
    this.setState({ html: nodeToHTML(node) });
    this.setState({ nodesHTML: subnodesToHTML(node.nodes) });
    const dimensions = getDimensions(node.html, {}, "mindmap-node");
    this.setState({ width: dimensions.width });
    this.setState({ height: dimensions.height });
    const nodesDimensions = getDimensions(
      node.nodesHTML,
      {},
      "mindmap-subnodes-text"
    );
    this.setState({ nodesWidth: nodesDimensions.width });
    this.setState({ nodesHeight: nodesDimensions.height });

    this.props.nodes.forEach(node => render(node));
  }
  prepareEditor() {
    nodes
      .attr("class", "mindmap-node mindmap-node--editable")
      .on("dbclick", node => {
        this.setState({ fx: null });
        this.setState({ fy: null });
      });
    this.setState({ fx: null });
    this.setState({ fy: null });

    nodes.call(d3Drag(this.state.simulation, svg, nodes));

    // Tick the simulation 100 times
    let i = 0;
    this.state.simulation.tick();

    setTimeout(() => {
      this.props.state.simulation
        .alphaTarget(0.5)
        .on("tick", () => onTick(conns, nodes, subnodes));
    }, 200);
    this.props.state.simulation
      .alphaTarget(0.5)
      .on("tick", () => onTick(conns, nodes, subnodes));
  }
  renderMap() {
    const svg = select(this.mountPoint);

    // Clear the SVG in case there's stuff already there.
    svg.selectAll("*").remove();

    // Add subnode group
    svg.append("g").attr("id", "mindmap-subnodes");

    this.prepareNodes();

    // Bind data to SVG elements and set all the properties to render them
    const connections = d3Connections(svg, this.connections);
    const { nodes, subnodes } = d3Nodes(svg, this.nodes);

    nodes.append("title").text(node => node.note);

    // Bind nodes and connections to the simulation
    this.state.simulation
      .nodes(this.props.nodes)
      .force("link")
      .links(this.props.connections);

    this.prepareEditor(svg, connections, nodes, subnodes);

    let i = 0;
    this.state.simulation.tick();

    onTick(connections, nodes, subnodes);

    svg
      .attr("viewBox", getViewBox(nodes.data()))
      .call(d3PanZoom(svg))
      .on("dbClick.zoom", null);
  }
  componentDidMount() {
    this.renderMap();
  }
  componentDidUpdate() {
    zoom().transform(select(this.refs.mountPoint), zoomIdentity);

    this.renderMap();
  }
  componentWillMount() {
    // Create force simulation to position nodes that have
    // no coordinate, and add it to the component state
    this.setState({
      simulation: forceSimulation()
        .force("link", forceLink().id(node => node.text))
        .force("charge", forceManyBody())
        .force("collide", forceCollide().radius(100))
    });
  }
  render() {
    return (
      <div>
        <svg className="mindmap-svg" ref={(input) => { this.mountPoint = input; }} />
      </div>
    );
  }
}
