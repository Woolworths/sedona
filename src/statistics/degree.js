export function calculateVertexDegrees() {
  onmessage = function(event) {
    const degree = [];
    const inDegree = [];
    const outDegree = [];

    const vB = event.data.verticesBuffer;
    const vDV = new DataView(vB);

    for (let i = 0, bLen = vB.byteLength; i < bLen; i = i + 4) {
      const index = vDV.getUint32(i);

      degree[index] = 0;
      inDegree[index] = 0;
      outDegree[index] = 0;
    }

    const eB = event.data.edgesBuffer;
    const eDV = new DataView(eB);

    for (let i = 0, bLen = eB.byteLength; i < bLen; i = i + 4 * 2) {
      const sourceIndex = eDV.getUint32(i);
      const targetIndex = eDV.getUint32(i + 4);

      degree[sourceIndex] = degree[sourceIndex] + 1 || 1;
      degree[targetIndex] = degree[targetIndex] + 1 || 1;

      inDegree[targetIndex] = inDegree[targetIndex] + 1 || 1;
      outDegree[sourceIndex] = outDegree[sourceIndex] + 1 || 1;
    }

    const degreeBuffer = new Uint32Array(degree);
    const inDegreeBuffer = new Uint32Array(inDegree);
    const outDegreeBuffer = new Uint32Array(outDegree);

    postMessage({
      type: "result",
      degreeBuffer: degreeBuffer,
      inDegreeBuffer: inDegreeBuffer,
      outDegreeBuffer: outDegreeBuffer
    });
  };
}

export function calculatePageRank() {
  onmessage = function(event) {
    const pageRank = [];
    const prevPageRank = [];
    const degree = [];
    const inDegree = [];
    const outDegree = [];
    const vertexNeighbours = [];

    const epsilon = event.data.pageRankEpsilon;
    const d = event.data.pageRankProb;

    const vB = event.data.verticesBuffer;
    const vDV = new DataView(vB);

    const numVertices = vB.byteLength / 4;
    const initialPageRank = 1 / numVertices;

    for (let i = 0, bLen = vB.byteLength; i < bLen; i = i + 4) {
      const index = vDV.getUint32(i);

      pageRank[index] = initialPageRank;
      prevPageRank[index] = initialPageRank;
      degree[index] = 0;
      inDegree[index] = 0;
      outDegree[index] = 0;
      vertexNeighbours[index] = [];
    }

    const eB = event.data.edgesBuffer;
    const eDV = new DataView(eB);

    for (let i = 0, bLen = eB.byteLength; i < bLen; i = i + 4 * 2) {
      const sourceIndex = eDV.getUint32(i);
      const targetIndex = eDV.getUint32(i + 4);

      degree[sourceIndex] = degree[sourceIndex] + 1 || 1;
      degree[targetIndex] = degree[targetIndex] + 1 || 1;

      inDegree[targetIndex] = inDegree[targetIndex] + 1 || 1;
      outDegree[sourceIndex] = outDegree[sourceIndex] + 1 || 1;

      vertexNeighbours[targetIndex].push(sourceIndex);
    }

    var distance = 1;
    var currentRank = 0;

    var num_iter = 0;

    while (distance >= epsilon && num_iter < 100) {
      var leakedRank = 0;

      for (let i = 0; i < numVertices; i++) {
        var currentRank = 0;

        if (inDegree[i] === 0) {
          pageRank[i] = 0;
        } else {
          const vN = vertexNeighbours[i];

          for (let j = 0; j < vN.length; j++) {
            const n = vN[j];

            currentRank += prevPageRank[n] / outDegree[n];
          }

          pageRank[i] = d * currentRank;
          leakedRank += d * currentRank;
        }
      }

      leakedRank = (1 - leakedRank) / numVertices;
      distance = 0;

      for (let i = 0; i < numVertices; i++) {
        currentRank = pageRank[i] + leakedRank;
        distance += Math.abs(currentRank - prevPageRank[i]);
        prevPageRank[i] = currentRank;
      }

      num_iter++;
    }

    const pageRankBuffer = new Float32Array(pageRank);

    postMessage({ type: "result", pageRankBuffer: pageRankBuffer });
  };
}
