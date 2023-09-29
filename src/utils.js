import store from "@/store";

import uuid from "uuid/v4";

// types: ['int', 'float', 'date', 'bool', 'str']
// "name", "Name", "str", false
export function createVertexParam(id, label, type, hidden) {
  var param = {};

  param.id = id;
  param.label = label;
  param.type = type;
  param.hidden = hidden;

  return param;
}

export function createEdgeParam(id, label, type, hidden) {
  var param = {};

  param.id = id;
  param.label = label;
  param.type = type;
  param.hidden = hidden;

  return param;
}

export function addTransformEdgeParam(param) {
  const newParam = { ...param };

  if (param.id === "source") {
    newParam.id = "_source";
    newParam.hidden = false;
  } else if (param.id === "target") {
    newParam.id = "_target";
    newParam.hidden = false;
  }

  store.dispatch("addTransformEdgeParam", newParam);
}

function vertexExists(vertexId) {
  const vertices = store.state.transformVertices;

  const index = vertices.findIndex(vertex => vertex.id === vertexId);

  return index > -1;
}

export function addDataVertices(vertices) {
  const newVertices = [...store.state.dataVertices];

  for (let i = 0, len = vertices.length; i < len; i++) {
    const v = vertices[i];

    newVertices.push(Object.freeze(v));
  }

  store.dispatch("setDataVertices", newVertices);
}

export function addDataEdges(edges) {
  const newEdges = [...store.state.dataEdges];

  for (let i = 0, len = edges.length; i < len; i++) {
    const e = edges[i];

    e.id = uuid();

    newEdges.push(Object.freeze(e));
  }

  store.dispatch("setDataEdges", newEdges);
}

export function setTransformVertices(vertices) {
  store.dispatch("setTransformVertices", vertices);
}

export function setTransformEdges(edges) {
  store.dispatch("setTransformEdges", edges);
}

export function rebuildEdges(vertices, edges) {
  var newEdges = [];
  var aV = new Set();

  for (var i = 0, len = vertices.length; i < len; i++) {
    const v = vertices[i];

    if (v) {
      aV.add(v.id);
    }
  }

  for (var i = 0, len = edges.length; i < len; i++) {
    const e = edges[i];

    if (aV.has(e.source.id) && aV.has(e.target.id)) {
      const newEdge = { ...e };

      newEdges.push(newEdge);
    }
  }

  return newEdges;
}

export function addTransformVertices(vertices) {
  const transformVertices = store.state.transformVertices;
  const dataEdges = store.state.dataEdges;

  var newVertices = transformVertices;
  var newEdges = [];
  var aV = new Map();

  for (var i = 0, len = transformVertices.length; i < len; i++) {
    const v = transformVertices[i];

    if (v) {
      aV.set(v.id, v);
    }
  }

  for (var i = 0, len = vertices.length; i < len; i++) {
    const v = vertices[i];

    if (!aV.has(v.id)) {
      const newV = { ...v };

      newV["selected"] = true;
      aV.set(v.id, newV);

      newVertices.push(newV);
    }
  }

  if (newVertices.length === 0) return;

  for (var i = 0, len = dataEdges.length; i < len; i++) {
    const e = dataEdges[i];

    if (aV.has(e.source) && aV.has(e.target)) {
      const newEdge = { ...e };

      newEdge["_source"] = e.source;
      newEdge["_target"] = e.target;
      newEdge.source = aV.get(e.source);
      newEdge.target = aV.get(e.target);

      newEdges.push(newEdge);
    }
  }

  store.dispatch("setTransformVertices", newVertices);
  store.dispatch("setTransformEdges", newEdges);

  store.dispatch("triggerCenterGraph");
}

export function removeTransformVertex(vertexId) {
  store.dispatch("removeTransformVertex", vertexId);

  /*const relevantEdges = store.state.transformEdges.filter(
    edge => edge.source.id === vertexId || edge.target.id === vertexId
  );

  relevantEdges.forEach(edge => {
    store.dispatch("removeTransformEdge", edge);
  });*/

  for (let i = store.state.transformEdges.length - 1; i >= 0; i--) {
    const e = store.state.transformEdges[i];

    if (e.source.id === vertexId || e.target.id === vertexId)
      store.dispatch("removeTransformEdge", e);
  }

  if (store.state.selectedObject.id === vertexId) {
    store.dispatch("setSelectedObject", null);
  }
}

export function removeTransformEdge(edge) {
  store.dispatch("removeTransformEdge", edge);

  if (store.state.selectedObject === edge) {
    store.dispatch("setSelectedObject", null);
  }
}

export function importRelatedVertices(vertex) {
  const verticesToAdd = [];
  const verticesToAddId = new Set();

  const edges = store.state.dataEdges;

  for (let i = 0, len = edges.length; i < len; i++) {
    const e = edges[i];

    if (e.source === vertex.id) {
      if (!verticesToAddId.has(e.target)) verticesToAddId.add(e.target);
    }

    if (e.target === vertex.id) {
      if (!verticesToAddId.has(e.source)) verticesToAddId.add(e.source);
    }
  }

  const vertices = store.state.dataVertices;
  for (let i = 0, len = vertices.length; i < len; i++) {
    const v = vertices[i];

    if (verticesToAddId.has(v.id)) {
      verticesToAdd.push(v);
    }
  }

  this.addTransformVertices(verticesToAdd);
}

// Taken from: https://stackoverflow.com/a/13070569/3223010
// Slightly edited
function componentFromStr(numStr, percent) {
  var num = Math.max(0, parseInt(numStr, 10));
  return percent
    ? Math.floor((255 * Math.min(100, num)) / 100)
    : Math.min(255, num);
}

export function rgbToHex(rgb) {
  var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;

  if (!rgbRegex.test(rgb)) {
    return rgb;
  }

  var result,
    r,
    g,
    b,
    hex = "";
  if ((result = rgbRegex.exec(rgb))) {
    r = componentFromStr(result[1], result[2]);
    g = componentFromStr(result[3], result[4]);
    b = componentFromStr(result[5], result[6]);

    hex = "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  return hex;
}

export function parseHexString(str) {
  return parseInt(str.replace(/^#/, ""), 16);
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}

export function invertColor(hex, bw) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);

  if (bw) {
    // http://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
}

