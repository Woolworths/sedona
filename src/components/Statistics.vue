<template>
  <div class="content-wrapper">
    <div class="container-fluid overflow-container">
      <div class="flex-row">
        <div id="accordionStatistics" class="accordion">
          <div class="card">
            <div id="headingDegree" class="card-header">
              <h2 class="mb-0">
                <button
                  class="btn btn-link collapsed"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapseDegree"
                  aria-expanded="false"
                  aria-controls="collapseDegree"
                >
                  Degree
                </button>
              </h2>
            </div>

            <div
              id="collapseDegree"
              class="collapse show"
              aria-labelledby="headingDegree"
              data-parent="#accordionStatistics"
            >
              <div class="card-body">
                <form class="form-inline justify-content-center">
                  <div class="form-check mb-2 mr-sm-2">
                    <label class="form-check-label"
                      ><input type="checkbox" class="form-check-input" v-model="degreeDirected"
                    /> Directed Graph? </label>
                  </div>

                  <template v-if="calculatingDegree">
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm mb-2"
                      @click="calculateDegree"
                    >
                      Stop Calculation
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm mb-2"
                      @click="calculateDegree"
                    >
                      Calculate
                    </button>
                  </template>
                </form>
              </div>
            </div>
          </div>

          <div class="card">
            <div id="headingPageRank" class="card-header">
              <h2 class="mb-0">
                <button
                  class="btn btn-link collapsed"
                  type="button"
                  data-toggle="collapse"
                  data-target="#collapsePageRank"
                  aria-expanded="false"
                  aria-controls="collapsePageRank"
                >
                  PageRank
                </button>
              </h2>
            </div>

            <div
              id="collapsePageRank"
              class="collapse"
              aria-labelledby="headingPageRank"
              data-parent="#accordionStatistics"
            >
              <div class="card-body">
                <form>
                  <div class="form-group row">
                    <label for="pageRankProb" class="col-lg-6 col-form-label col-form-label-sm">Probability (0-1)</label>
                    <div class="col-lg-6">
                        <input id="pageRankProb" type="number" placeholder="Probability (0-1)" v-model.number="pageRankProb" class="form-control form-control-sm" min="0" max="1" step="any"></input>
                    </div>
                  </div>
                  <div class="form-group row">
                    <label for="pageRankEpsilon" class="col-lg-6 col-form-label col-form-label-sm">Epsilon (0-1)</label>
                    <div class="col-lg-6">
                      <input id="pageRankEpsilon" type="number" placeholder="Epsilon" v-model.number="pageRankEpsilon" class="form-control form-control-sm" min="0" max="1" step="any"></input>
                    </div>
                  </div>

                  <div class="form-group row">
                    <div class="col-lg-6">
                      <template v-if="calculatingPageRank">
                        <button
                          type="button"
                          class="btn btn-outline-danger btn-sm"
                          @click="calculatePageRank"
                        >
                          Stop Calculation
                        </button>
                      </template>
                      <template v-else>
                        <button
                          type="button"
                          class="btn btn-outline-primary btn-sm"
                          @click="calculatePageRank"
                        >
                          Calculate
                        </button>
                      </template>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

import * as algorithms from "@/statistics/algorithms.js";
import * as degree from "@/statistics/degree.js";

import { mapActions } from "vuex";

export default {
  name: "Statistics",

  data: () => ({
    degreeDirected: true,
    calculatingDegree: false,
    degreeWorker: null,
    pageRankProb: 0.85,
    pageRankEpsilon: 0.005,
    calculatingPageRank: false,
    pageRankWorker: null,
  }),

  computed: {
    transformVertexParams() {
      return this.$store.state.transformVertexParams;
    },

    transformVertices() {
      return this.$store.state.transformVertices;
    },

    transformEdges() {
      return this.$store.state.transformEdges;
    },

    filteredVertices() {
      var vertices = this.transformVertices;

      return vertices;
    }
  },

  methods: {
    ...mapActions(["addTransformVertexParam", "setTransformVertices"]),

    generateVertices(vertices, param, values) {
      for (const [id, value] of Object.entries(values)) {
        // TODO: Make sure this works
        const chosenVertex = vertices.find(
          vertex => vertex.id.toString() === id
        );

        try {
          this.$set(chosenVertex, param.id, value);
        } catch (e) {
          console.log(e);
        }
      }
    },

    calculateDegree() {
      var vm = this;

      const degreeParam = { id: "_degree", label: "Degree", type: "int" };
      this.addTransformVertexParam(degreeParam);

      if (this.degreeWorker) {
        this.degreeWorker.terminate();

        this.degreeWorker = null;

        this.calculatingDegree = false;
        this.degreeDirected = true;
        return;
     }
 
      if (!this.degreeWorker && !this.calculatingDegree) {
        const vertices = [...this.transformVertices];

        this.calculatingDegree = true;

        const workerURL = URL.createObjectURL(new Blob(['(',
          degree.calculateVertexDegrees.toString(), ')()'], { type: 'application/javascript' }));

        this.degreeWorker = new Worker(workerURL);

        const verticesBuffer = new ArrayBuffer(this.transformVertices.length * 4);

        this.degreeWorker.onmessage = function(event) {
          if (event.data.type === "result") {
            if (vm.degreeDirected) {
              const inDegreeParam = {
                id: "_inDegree",
                label: "In Degree",
                type: "int"
              };
              vm.addTransformVertexParam(inDegreeParam);

              const outDegreeParam = {
                id: "_outDegree",
                label: "Out Degree",
                type: "int"
              };
              vm.addTransformVertexParam(outDegreeParam);
            }

            for (let i = 0, len = vertices.length; i < len; i++) {
              const v = vertices[i];

              vm.$set(v, "_degree", event.data.degreeBuffer[v.index]);

              if (vm.degreeDirected) {
                vm.$set(v, "_inDegree", event.data.inDegreeBuffer[v.index]);
                vm.$set(v, "_outDegree", event.data.outDegreeBuffer[v.index]);
              }
            }

            vm.degreeWorker = null;
            vm.calculatingDegree = false;
            vm.degreeDirected = true;
          }
        }
 
        for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          const offset = i * 4;

          const dV = new DataView(verticesBuffer);
          dV.setUint32(offset, v.index);
        }

        const edgesBuffer = new ArrayBuffer(this.transformEdges.length * (4 + 4));

        for (let i = 0, len = this.transformEdges.length; i < len; i++) {
          const v = this.transformEdges[i];

          const offset = i * (4 + 4);

          const dV = new DataView(edgesBuffer);
          dV.setUint32(offset, v.source.index);
          dV.setUint32(offset + 4, v.target.index);
        }

        this.degreeWorker.postMessage({ verticesBuffer: verticesBuffer, edgesBuffer: edgesBuffer });

        URL.revokeObjectURL(workerURL);
      }
    },

    calculatePageRank() {
      var vm = this;

      const pageRankParam = { id: "_pageRank", label: "PageRank", type: "float" };
      this.addTransformVertexParam(pageRankParam);

      if (this.pageRankWorker) {
        this.pageRankWorker.terminate();

        this.pageRankWorker = null;

        this.calculatingPageRank = false;
        return;
      }
 
      if (!this.pageRankWorker && !this.calculatingPageRank) {
        const vertices = [...this.transformVertices];

        this.calculatingPageRank = true;

        const workerURL = URL.createObjectURL(new Blob(['(',
          degree.calculatePageRank.toString(), ')()'], { type: 'application/javascript' }));

        this.pageRankWorker = new Worker(workerURL);

        const verticesBuffer = new ArrayBuffer(this.transformVertices.length * 4);

        this.pageRankWorker.onmessage = function(event) {
          if (event.data.type === "result") {
            for (let i = 0, len = vertices.length; i < len; i++) {
              const v = vertices[i];

              vm.$set(v, "_pageRank", event.data.pageRankBuffer[v.index]);
            }

            vm.pageRankWorker = null;
            vm.calculatingPageRank = false;
          }
        }
 
        for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          const offset = i * 4;

          const dV = new DataView(verticesBuffer);
          dV.setUint32(offset, v.index);
        }

        const edgesBuffer = new ArrayBuffer(this.transformEdges.length * (4 + 4));

        for (let i = 0, len = this.transformEdges.length; i < len; i++) {
          const v = this.transformEdges[i];

          const offset = i * (4 + 4);

          const dV = new DataView(edgesBuffer);
          dV.setUint32(offset, v.source.index);
          dV.setUint32(offset + 4, v.target.index);
        }

        var pageRankProb = 0.85;
        var pageRankEpsilon = 0.005;

        if (this.pageRankProb >= 0 && this.pageRankProb <= 1) pageRankProb = this.pageRankProb;
        if (this.pageRankEpsilon >= 0 && this.pageRankEpsilon <= 1)
          pageRankEpsilon = this.pageRankEpsilon;

        this.pageRankWorker.postMessage({ verticesBuffer: verticesBuffer, edgesBuffer: edgesBuffer, pageRankProb: pageRankProb, pageRankEpsilon: pageRankEpsilon });

        URL.revokeObjectURL(workerURL);
      }
    }
  }
};
</script>

<style scoped>
.accordion {
  padding-bottom: 10px;
  text-align: center;
}
</style>
