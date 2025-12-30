import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { api } from "../lib/api";

/* =====================
   Type Definitions
===================== */

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface ShardMapResponse {
  nodes: GraphNode[];
  links: GraphLink[];
}

/* =====================
   Component
===================== */

export default function ShardMap() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    api.get<ShardMapResponse>("/shard-map").then((res) => {
      const { nodes, links } = res.data;

      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();

      const width = 400;
      const height = 300;

      /* ---- Simulation ---- */
      const simulation = d3
        .forceSimulation<GraphNode>(nodes)
        .force(
          "link",
          d3
            .forceLink<GraphNode, GraphLink>(links)
            .id((d) => d.id)
            .distance(60)
        )
        .force("charge", d3.forceManyBody().strength(-120))
        .force("center", d3.forceCenter(width / 2, height / 2));

      /* ---- Links ---- */
      const link = svg
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke-width", 1.5);

      /* ---- Nodes ---- */
      const node = svg
        .append("g")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 6)
        .attr("fill", "#60a5fa");

      /* ---- Tick ---- */
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
          .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
          .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
          .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

        node
          .attr("cx", (d) => d.x ?? 0)
          .attr("cy", (d) => d.y ?? 0);
      });
    });
  }, []);

  return (
    <>
      <h3>Shard Distribution</h3>
      <svg ref={ref} width={400} height={300} />
    </>
  );
}
