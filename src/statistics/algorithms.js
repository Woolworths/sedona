// Adapted from: https://github.com/anvaka/ngraph.centrality

// Degree

export function degreeCentrality(vertices, edges) {
  const degree = {};
  const inDegree = {};
  const outDegree = {};

  for (let i = 0, len = vertices.length; i < len; i++) {
    const v = vertices[i];

    degree[v.id] = 0;
    inDegree[v.id] = 0;
    outDegree[v.id] = 0;
  }

  for (let i = 0, len = edges.length; i < len; i++) {
    const e = edges[i];

    degree[e.source.id] = degree[e.source.id] + 1 || 1;
    degree[e.target.id] = degree[e.target.id] + 1 || 1;

    inDegree[e.target.id] = inDegree[e.target.id] + 1 || 1;
    outDegree[e.source.id] = outDegree[e.source.id] + 1 || 1;
  }

  return { degree: degree, inDegree: inDegree, outDegree: outDegree };
}

function inDegreeCalculator(links, nodeId) {
  var total = 0;
  if (!links) return total;

  for (var i = 0; i < links.length; i += 1) {
    total += links[i].target === nodeId ? 1 : 0;
  }
  return total;
}

function outDegreeCalculator(links, nodeId) {
  var total = 0;
  if (!links) return total;

  for (var i = 0; i < links.length; i += 1) {
    total += links[i].source === nodeId ? 1 : 0;
  }
  return total;
}

function inoutDegreeCalculator(links) {
  if (!links) return 0;

  return links.length;
}

// Betweenness

/**
 * I'm using http://www.inf.uni-konstanz.de/algo/publications/b-vspbc-08.pdf
 * as a reference for this implementation
 */
export function betweennessCentrality(vertices, edges, oriented) {
  var Q = [],
    S = []; // Queue and Stack
  // list of predecessors on shortest paths from source
  var pred = Object.create(null);
  // distance from source
  var dist = Object.create(null);
  // number of shortest paths from source to key
  var sigma = Object.create(null);
  // dependency of source on key
  var delta = Object.create(null);

  var currentNode;
  var centrality = Object.create(null);

  vertices.forEach(vertex => setCentralityToZero(vertex));
  vertices.forEach(vertex => calculateCentrality(vertex));

  if (!oriented) {
    // The centrality scores need to be divided by two if the graph is not oriented,
    // since all shortest paths are considered twice
    Object.keys(centrality).forEach(divideByTwo);
  }

  return centrality;

  function divideByTwo(key) {
    centrality[key] /= 2;
  }

  function setCentralityToZero(node) {
    centrality[node.id] = 0;
  }

  function calculateCentrality(node) {
    currentNode = node.id;
    singleSourceShortestPath(currentNode);
    accumulate();
  }

  function accumulate() {
    vertices.forEach(vertex => setDeltaToZero(vertex));
    while (S.length) {
      var w = S.pop();
      var coeff = (1 + delta[w]) / sigma[w];
      var predecessors = pred[w];
      for (var idx = 0; idx < predecessors.length; ++idx) {
        var v = predecessors[idx];
        delta[v] += sigma[v] * coeff;
      }
      if (w !== currentNode) {
        centrality[w] += delta[w];
      }
    }
  }

  function setDeltaToZero(node) {
    delta[node.id] = 0;
  }

  function singleSourceShortestPath(source) {
    vertices.forEach(vertex => initNode(vertex));

    dist[source] = 0;
    sigma[source] = 1;
    Q.push(source);

    while (Q.length) {
      var v = Q.shift();
      S.push(v);

      edges.forEach(edge => {
        if (edge.source.id === v && oriented === false) {
          var ver = vertices.find(i => i.id === edge.target.id);

          // TODO: has this affected the calculations?
          if (ver) toId(ver);
        }

        if (edge.target.id === v) {
          var ver = vertices.find(i => i.id === edge.source.id);

          if (ver) toId(ver);
        }
      });
    }

    function toId(otherNode) {
      // NOTE: This code will also consider multi-edges, which are often
      // ignored by popular software (Gephi/NetworkX). Depending on your use
      // case this may not be desired and deduping needs to be performed. To
      // save memory I'm not deduping here...
      processNode(otherNode.id);
    }

    function initNode(node) {
      var nodeId = node.id;
      pred[nodeId] = []; // empty list
      dist[nodeId] = -1;
      sigma[nodeId] = 0;
    }

    function processNode(w) {
      // path discovery
      if (dist[w] === -1) {
        // Node w is found for the first time
        dist[w] = dist[v] + 1;
        Q.push(w);
      }
      // path counting
      if (dist[w] === dist[v] + 1) {
        // edge (v, w) on a shortest path
        sigma[w] += sigma[v];
        pred[w].push(v);
      }
    }
  }
}

// Closeness

/**
 * In a connected graph, the normalized closeness centrality of a node is the average
 * length of the shortest path between the node and all other nodes in the
 * graph. Thus the more central a node is, the closer it is to all other nodes.
 */
export function closenessCentrality(vertices, edges, oriented) {
  var Q = [];
  // list of predecessors on shortest paths from source
  // distance from source
  var dist = Object.create(null);

  var currentNode;
  var centrality = Object.create(null);

  vertices.forEach(vertex => setCentralityToZero(vertex));
  vertices.forEach(vertex => calculateCentrality(vertex));

  return centrality;

  function setCentralityToZero(node) {
    centrality[node.id] = 0;
  }

  function calculateCentrality(node) {
    currentNode = node.id;
    singleSourceShortestPath(currentNode);
    accumulate();
  }

  function accumulate() {
    // Add all distances for node to array, excluding -1s
    var distances = Object.keys(dist)
      .map(function(key) {
        return dist[key];
      })
      .filter(function(val) {
        return val !== -1;
      });
    // Set number of reachable nodes
    var reachableNodesTotal = distances.length;
    // Compute sum of all distances for node
    var totalDistance = distances.reduce(function(a, b) {
      return a + b;
    });
    if (totalDistance > 0) {
      centrality[currentNode] = (reachableNodesTotal - 1) / totalDistance;
    } else {
      centrality[currentNode] = 0;
    }
  }

  function singleSourceShortestPath(source) {
    vertices.forEach(vertex => initNode(vertex));

    dist[source] = 0;
    Q.push(source);

    while (Q.length) {
      var v = Q.shift();
      // TODO: graph.forEachLinkedNode(v, processNode, oriented);
      // vertices.find() is inefficent.. modify processNode()
      edges.forEach(edge => {
        if (edge.source.id === v && oriented === false) {
          var ver = vertices.find(i => i.id === edge.target.id);

          if (ver) processNode(ver);
        }

        if (edge.target.id === v) {
          var ver = vertices.find(i => i.id === edge.source.id);

          if (ver) processNode(ver);
        }
      });
    }

    function initNode(node) {
      var nodeId = node.id;
      dist[nodeId] = -1;
    }

    function processNode(otherNode) {
      var w = otherNode.id;
      if (dist[w] === -1) {
        // Node w is found for the first time
        dist[w] = dist[v] + 1;
        Q.push(w);
      }
    }
  }
}

// Eccentricity

/**
 * The eccentricity centrality of a node is the greatest distance between that node and
 * any other node in the network.
 */
export function eccentricityCentrality(vertices, edges, oriented) {
  var Q = [];
  // distance from source
  var dist = Object.create(null);

  var currentNode;
  var centrality = Object.create(null);

  vertices.forEach(vertex => setCentralityToZero(vertex));
  vertices.forEach(vertex => calculateCentrality(vertex));

  return centrality;

  function setCentralityToZero(node) {
    centrality[node.id] = 0;
  }

  function calculateCentrality(node) {
    currentNode = node.id;
    singleSourceShortestPath(currentNode);
    accumulate();
  }

  function accumulate() {
    var maxDist = 0;
    Object.keys(dist).forEach(function(key) {
      var val = dist[key];
      if (maxDist < val) maxDist = val;
    });

    centrality[currentNode] = maxDist;
  }

  function singleSourceShortestPath(source) {
    vertices.forEach(vertex => initNode(vertex));

    dist[source] = 0;
    Q.push(source);

    while (Q.length) {
      var v = Q.shift();

      edges.forEach(edge => {
        if (edge.source.id === v && oriented === false) {
          var ver = vertices.find(i => i.id === edge.target.id);

          if (ver) processNode(ver);
        }

        if (edge.target.id === v) {
          var ver = vertices.find(i => i.id === edge.source.id);

          if (ver) processNode(ver);
        }
      });
    }

    function initNode(node) {
      var nodeId = node.id;
      dist[nodeId] = -1;
    }

    function processNode(otherNode) {
      var w = otherNode.id;
      if (dist[w] === -1) {
        // Node w is found for the first time
        dist[w] = dist[v] + 1;
        Q.push(w);
      }
    }
  }
}
