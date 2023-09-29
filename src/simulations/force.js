export function forceSim() {
  //importScripts(location.origin + "/js/d3-dispatch.min.js", location.origin + "/js/d3-quadtree.min.js", location.origin + "/js/d3-timer.min.js", location.origin + "/js/d3-force.min.js");
  // TODO: cannot use this with CORP, since cdnjs does not have CORP headers
  importScripts("https://cdn.jsdelivr.net/npm/d3-dispatch@1.0.6/dist/d3-dispatch.min.js", "https://cdn.jsdelivr.net/npm/d3-quadtree@1.0.7/dist/d3-quadtree.min.js", "https://cdn.jsdelivr.net/npm/d3-timer@1.0.10/dist/d3-timer.min.js", "https://cdn.jsdelivr.net/npm/d3-force@2.0.1/dist/d3-force.min.js");

  onmessage = function(event) {
    console.log('Starting Worker()');

    var nodes = [];

    const vB = event.data.verticesBuffer;
    const vDV = new DataView(vB);

    for (let i = 0, bLen = vB.byteLength; i < bLen; i = i + 4 * 4) {
      const autoId = vDV.getUint32(i);
      const x = vDV.getFloat32(i + 4);
      const y = vDV.getFloat32(i + 8);
      const radius = vDV.getFloat32(i + 12);

      var newN = { id: autoId, x: x, y: y, radius: radius };
      nodes.push(newN);
    }

    var edges = [];

    const eB = event.data.edgesBuffer;
    const eDV = new DataView(eB);

    for (let i = 0, bLen = eB.byteLength; i < bLen; i = i + 4 * 2) {
      const sourceAutoId = eDV.getUint32(i);
      const targetAutoId = eDV.getUint32(i + 4);

      var newE = { source: sourceAutoId, target: targetAutoId };
      edges.push(newE);
    }

    const forceLink = d3.forceLink(edges).id(function(d) {
      return d.id;
    })// .distance(30), .strength([0, 1])

    const linkStrength = event.data.linkStrength;

    if (linkStrength) {
      forceLink.strength(linkStrength);
    }

    const theta = event.data.theta;
    const vertexStrength = event.data.vertexStrength;

    const forceManyBody = d3.forceManyBody(); //0.9, -30
    
    if (theta) {
      forceManyBody.theta(theta);
    }

    if (vertexStrength) {
      forceManyBody.strength(vertexStrength);
    }

    const nooverlap = true;
    
    var forceCollide = null;

    if (nooverlap) {
      forceCollide = d3.forceCollide().radius(v => v.radius / 2 - 4).strength(0.05)
    }

    const center = { x: 0, y: 0 };

    // Higher theta = more performant
    var simulation = d3
      .forceSimulation(nodes)
      .force("charge", forceManyBody)
      .force("collision", forceCollide)
      .force("x", d3.forceX(center.x))
      .force("y", d3.forceY(center.y))
      .force("link", forceLink)
      //.alphaDecay(0.001)
      .stop();

    function ticked() {
      for (let i = 0, bLen = vB.byteLength; i < bLen; i = i + 4 * 4) {
        const autoId = vDV.getUint32(i);

        const n = nodes[autoId];

        vDV.setFloat32(i + 4, n.x);
        vDV.setFloat32(i + 8, n.y);
      }

      if (event.data.returnData === false) {
        postMessage({ type: "tick" });
      } else {
        postMessage({ type: "tick", verticesBuffer: vB });
      }
    }

    simulation.on("tick", ticked);
    simulation.restart();
  };
}
