<template>
  <div class="text-center">
    <ImportData v-show="showModal" @close="showModal = false"></ImportData>

    <div class="container">
      <div class="row">
        <div class="col float-right">
          <div class="btn-toolbar float-right" role="toolbar" style="padding-top:10px;">
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-outline-warning btn-sm"
                @click="clearData"
              >
                Clear Data
              </button>
              <button
                type="button"
                class="btn btn-outline-primary btn-sm"
                @click="showModal = true"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <p class="h3">Vertices</p>

          <input type="text" v-model="queryVertices" class="form-control form-control-sm" placeholder="Search Vertices" />

          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <!-- For selected -->
                <th>
                  <input
                    type="checkbox"
                    :checked="allVerticesSelected"
                    @click="selectVertices"
                  />
                </th>

                <th v-for="key in dataVertexParams" :key="key.id">
                  {{ key.label }}
                </th>

                <!-- For delete -->
                <th></th>
                <!-- For send TODO -->
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="vertex in paginatedVertices" :key="vertex.id">
                <td>
                  <input
                    type="checkbox"
                    :checked="vertexSelected(vertex)"
                    @click="selectVertex(vertex)"
                  />
                </td>

                <td v-for="key in dataVertexParams" :key="key.id">
                  {{ vertex[key.id] }}
                </td>

                <td>
                  <button
                    type="button"
                    @click="transformVertex(vertex)"
                    class="close"
                  >
                    <i class="material-icons">add_circle</i>
                  </button>
                </td>

                <td>
                  <button
                    type="button"
                    @click="deleteVertex(vertex)"
                    class="close"
                  >
                    <i class="material-icons">delete</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <nav>
            <paginate
              :page-count="verticesPageCount"
              :force-page="verticesPageNumber"
              :click-handler="setVerticesPageNumber"
              :prev-text="'Prev'"
              :next-text="'Next'"
              :container-class="'pagination pagination-sm justify-content-center'"
              :page-class="'page-item'"
              :page-link-class="'page-link'"
              :prev-link-class="'page-link'"
              :next-link-class="'page-link'"
            >
            </paginate>
          </nav>

          <div class="btn-group">
            <button
              @click="deleteSelectedVertices"
              class="btn btn-outline-danger btn-sm"
            >
              Delete Selected
            </button>
            <button
              @click="transformSelectedVertices"
              class="btn btn-outline-primary btn-sm"
            >
              Add to Graph
            </button>
          </div>
        </div>

        <div class="col-md-6">
          <p class="h3">Edges</p>

          <input type="text" v-model="queryEdges" class="form-control form-control-sm" placeholder="Search Edges" />

          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    :checked="allEdgesSelected"
                    @click="selectEdges"
                  />
                </th>

                <th v-for="key in dataEdgeParams" :key="key.id">
                  {{ key.label }}
                </th>

                <!-- For delete -->
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="edge in paginatedEdges" :key="edge.id">
                <td>
                  <input
                    type="checkbox"
                    :checked="edgeSelected(edge)"
                    @click="selectEdge(edge)"
                  />
                </td>
                <td v-for="key in dataEdgeParams" :key="key.id">
                  {{ edge[key.id] }}
                </td>

                <td>
                  <button
                    type="button"
                    @click="removeDataEdge(edge)"
                    class="close"
                  >
                    <i class="material-icons">delete</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <nav>
            <paginate
              :page-count="edgesPageCount"
              :force-page="edgesPageNumber"
              :click-handler="setEdgesPageNumber"
              :prev-text="'Prev'"
              :next-text="'Next'"
              :container-class="'pagination pagination-sm justify-content-center'"
              :page-class="'page-item'"
              :page-link-class="'page-link'"
              :prev-link-class="'page-link'"
              :next-link-class="'page-link'"
            >
            </paginate>
          </nav>

          <div class="btn-group">
            <button
              @click="deleteSelectedEdges"
              class="btn btn-outline-danger btn-sm"
            >
              Delete Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import * as utils from "@/utils.js";
import ImportData from "@/components/ImportData.vue";
import * as d3 from "d3";
import { mapActions } from "vuex";
import Paginate from "vuejs-paginate";

export default {
  name: "data-table",

  components: {
    Paginate,
    ImportData
  },

  data: () => ({
    queryVertices: "",
    queryEdges: "",
    selectedVertices: new Map(),
    numberSelectedVertices: 0,
    selectedEdges: new Map(),
    numberSelectedEdges: 0,
    verticesPerPage: 9,
    verticesPageNumber: 1,
    edgesPerPage: 9,
    edgesPageNumber: 1,
    showModal: false
  }),

  computed: {
    dataVertexParams() {
      return this.$store.state.dataVertexParams;
    },

    dataEdgeParams() {
      return this.$store.state.dataEdgeParams;
    },

    dataVertices() {
      return this.$store.state.dataVertices;
    },

    dataEdges() {
      return this.$store.state.dataEdges;
    },

    transformVertices() {
      return this.$store.state.transformVertices;
    },

    allVerticesSelected() {
      if (this.dataVertices.length === 0) return false;

      return this.numberSelectedVertices === this.dataVertices.length;
    },

    allEdgesSelected() {
      if (this.dataEdges.length === 0) return false;

      return this.numberSelectedEdges === this.dataEdges.length;
    },

    filteredVertices() {
      var query = this.queryVertices && this.queryVertices.toLowerCase();
      var vertices = this.dataVertices;

      if (query) {
        vertices = vertices.filter(row =>
          Object.keys(row).some(
            key =>
              String(row[key])
                .toLowerCase()
                .indexOf(query) > -1
          )
        );
      }

      return vertices;
    },

    filteredEdges() {
      var query = this.queryEdges && this.queryEdges.toLowerCase();
      var edges = this.dataEdges;

      if (query) {
        edges = edges.filter(row =>
          Object.keys(row).some(
            key =>
              String(row[key])
                .toLowerCase()
                .indexOf(query) > -1
          )
        );
      }

      return edges;
    },

    verticesPageCount() {
      return Math.ceil(this.filteredVertices.length / this.verticesPerPage);
    },

    paginatedVertices() {
      const vertices = this.filteredVertices.slice(
        this.verticesPageNumber * this.verticesPerPage - this.verticesPerPage,
        this.verticesPageNumber * this.verticesPerPage
      );

      return vertices;
    },

    edgesPageCount() {
      return Math.ceil(this.filteredEdges.length / this.edgesPerPage);
    },

    paginatedEdges() {
      const edges = this.filteredEdges.slice(
        this.edgesPageNumber * this.edgesPerPage - this.edgesPerPage,
        this.edgesPageNumber * this.edgesPerPage
      );

      return edges;
    }
  },

  mounted() {},

  methods: {
    ...mapActions([
      "resetState",
      "addDataVertexParam",
      "addDataEdgeParam",
      "setDataVertices",
      "setDataEdges",
      "removeDataVertex",
      "removeDataVertices",
      "removeDataEdge",
      "setTransformVertices",
      "setTransformEdges",
      "addTransformVertexParam",
      "addTransformEdgeParam"
    ]),

    clearData() {
      this.resetState();
    },

    resetVerticesPageNumber() {
      this.verticesPageNumber = 1;
    },

    setVerticesPageNumber(number) {
      this.verticesPageNumber = number;
    },

    resetEdgesPageNumber() {
      this.edgesPageNumber = 1;
    },

    setEdgesPageNumber(number) {
      this.edgesPageNumber = number;
    },

    selectVertices() {
      if (!this.allVerticesSelected) {
        this.selectedVertices = new Map();
        this.numberSelectedVertices = 0;

        const filteredVertices = this.filteredVertices;

        for (let i = 0, len = filteredVertices.length; i < len; i++) {
          const v = filteredVertices[i];

          this.selectedVertices.set(v.id, v);
          this.numberSelectedVertices++;
        }
      } else {
        this.selectedVertices = new Map();
        this.numberSelectedVertices = 0;
      }
    },

    selectVertex(vertex) {
      if (!this.selectedVertices.has(vertex.id)) {
        this.selectedVertices.set(vertex.id, vertex);
        this.numberSelectedVertices++;
      } else {
        this.selectedVertices.delete(vertex.id);
        this.numberSelectedVertices--;
      }
    },

    vertexSelected(vertex) {
      if (this.selectedVertices.has(vertex.id)) return true;

      return false;
    },

    deleteSelectedVertices() {
      //this.selectedVertices.map(i => this.removeDataVertex(i));

      const verticesToSet = [];

      for (let i = 0, len = this.dataVertices.length; i < len; i++) {
        const v = this.dataVertices[i];

        if (!this.selectedVertices.has(v.id)) {
          verticesToSet.push(v);
        }
      }

      this.setDataVertices(verticesToSet);

      this.selectedVertices = new Map();
      this.numberSelectedVertices = 0;
      this.queryVertices = "";
      this.resetVerticesPageNumber();
    },

    deleteVertex(vertex) {
      this.removeDataVertex(vertex);

      if (this.selectedVertices.has(vertex.id)) {
        this.selectedVertices.delete(vertex.id);
        this.numberSelectedVertices--;
      }
    },

    transformSelectedVertices() {
      this.initDataVertexParams();

      //utils.addTransformVertices(this.selectedVertices);

      const vertices = [];

      this.selectedVertices.forEach((value, key) => vertices.push(value));

      utils.addTransformVertices(vertices);

      this.selectedVertices = new Map();
      this.numberSelectedVertices = 0;
      this.queryVertices = "";
    },

    transformVertex(vertex) {
      this.initDataVertexParams();

      var v = [];
      v.push(vertex);

      utils.addTransformVertices(v);
    },

    selectEdges() {
      if (!this.allEdgesSelected) {
        this.selectedEdges = new Map();
        this.numberSelectedEdges = 0;

        const filteredEdges = this.filteredEdges;

        for (let i = 0, len = filteredEdges.length; i < len; i++) {
          const e = filteredEdges[i];

          this.selectedEdges.set(e.id, e);
          this.numberSelectedEdges++;
        }
      } else {
        this.selectedEdges = new Map();
        this.numberSelectedEdges = 0;
      }
    },

    selectEdge(edge) {
      if (!this.selectedEdges.has(edge.id)) {
        this.selectedEdges.set(edge.id, edge);
        this.numberSelectedEdges++;
      } else {
        this.selectedEdges.delete(edge.id);
        this.numberSelectedEdges--;
      }
    },

    edgeSelected(edge) {
      if (this.selectedEdges.has(edge.id)) return true;

      return false;
    },

    deleteSelectedEdges() {
      const edgesToSet = [];

      for (let i = 0, len = this.dataEdges.length; i < len; i++) {
        const e = this.dataEdges[i];

        if (!this.selectedEdges.has(e.id)) {
          edgesToSet.push(e);
        }
      }

      this.setDataEdges(edgesToSet);

      this.selectedEdges = new Map();
      this.numberSelectedEdges = 0;
      this.queryVertices = "";
      this.resetEdgesPageNumber();
    },

    initDataVertexParams() {
      // VALIDATE DATA
      this.dataVertexParams.map(i => this.addTransformVertexParam(i));

      // TODO: validate data making sure everyting arrite & need to use _
      // infront of vars.
      const xParam = { id: "x", label: "x", type: "float", hidden: true };
      this.addTransformVertexParam(xParam);

      const yParam = { id: "y", label: "y", type: "float", hidden: true };
      this.addTransformVertexParam(yParam);

      const vxParam = { id: "vx", label: "vx", type: "float", hidden: true };
      this.addTransformVertexParam(vxParam);

      const vyParam = { id: "vy", label: "vy", type: "float", hidden: true };
      this.addTransformVertexParam(vyParam);

      const selected = {
        id: "selected",
        label: "Selected",
        type: "bool",
        hidden: true
      };
      this.addTransformVertexParam(selected);

      this.dataEdgeParams.map(i => utils.addTransformEdgeParam(i));

      const x1Param = { id: "x1", label: "x1", type: "float", hidden: true };
      this.addTransformEdgeParam(x1Param);

      const x2Param = { id: "x2", label: "x2", type: "float", hidden: true };
      this.addTransformEdgeParam(x2Param);

      const y1Param = { id: "y1", label: "y1", type: "float", hidden: true };
      this.addTransformEdgeParam(y1Param);

      const y2Param = { id: "y2", label: "y2", type: "float", hidden: true };
      this.addTransformEdgeParam(y2Param);
    }
  },

  filters: {
    capitalise: str => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  },

  watch: {
    queryVertices: function() {
      this.resetVerticesPageNumber();
    },
    queryEdges: function() {
      this.resetEdgesPageNumber();
    }
  }
};
</script>

<style scoped>
.btn-group {
  padding-bottom: 15px;
}
</style>
