<template>
  <div class="content-wrapper">
    <div class="align-items-center">
      <nav class="navbar navbar-default navbar-xs navbar-subnav">
        <div class="flex-column">
          <ul class="navbar-nav nav nav-tabs flex-row">
            <li class="nav-item">
              <a
                href="#"
                @click="setActiveTransformTab('Vertices')"
                :class="
                  'nav-link' +
                    (activeTransformTab === 'Vertices' ? ' active' : '')
                "
                >Vertices</a
              >
            </li>
            <li class="nav-item">
              <a
                href="#"
                @click="setActiveTransformTab('Edges')"
                :class="
                  'nav-link' + (activeTransformTab === 'Edges' ? ' active' : '')
                "
                >Edges</a
              >
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="container-fluid content-wrapper">
      <input type="text" v-model="query" class="form-control form-control-sm" />

      <div class="overflow-container">
        <template v-if="dataCount == 0">
          <p class="h6 text-center" style="margin-top:10px;">No data loaded into graph</p>
        </template>

        <template v-else>
          <template v-if="activeTransformTab === 'Vertices'">
            <Table oType="vertex_table" :data="filteredData"></Table>
          </template>

          <template v-else>
            <Table oType="edge_table" :data="filteredData"></Table>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import * as utils from "@/utils.js";
import { mapActions } from "vuex";

import Table from "@/components/Table.vue";

export default {
  name: "Transform",

  components: {
    Table
  },

  data: () => ({
    query: "",
    activeTransformTab: "Vertices",
    selectAllVertices: false,
  }),

  computed: {
    transformVertexParams() {
      return this.$store.state.transformVertexParams;
    },

    transformEdgeParams() {
      return this.$store.state.transformEdgeParams;
    },

    transformVertices() {
      return this.$store.state.transformVertices;
    },

    transformEdges() {
      return this.$store.state.transformEdges;
    },

    activeTab() {
      return this.$store.state.activeTab;
    },

    dataCount() {
      // Refresh the tab when leaving Transform
      if (this.activeTab !== "Transform")
        return 0;

      if (this.activeTransformTab === "Vertices") {
        if (this.transformVertices)
          return this.transformVertices.length
      } 

      if (this.activeTransformTab === "Edges") {
        if (this.transformEdges)
          return this.transformEdges.length
      }

      return 0;
    },

    filteredData() {
      var query = this.query && this.query.toLowerCase();
      var vertices = this.transformVertices;
      var edges = this.transformEdges;

      const max = 100000;
      var count = 0;

      var data = [];

      if (this.activeTransformTab === "Vertices") {
        for (let i = 0, len = vertices.length; i < len && count < max; i++) {
          const v = vertices[i];

          if (query) {
            if (v.id.toString().toLowerCase() === query.toLowerCase()) {
              data.push(v);
              count++;
            }
          } else {
            data.push(v);
            count++;
          }
        }
      } else if (this.activeTransformTab === "Edges") {
        for (let i = 0, len = edges.length; i < len && count < max; i++) {
          const e = edges[i];

          if (query) {
            if (
              e._source.toString().toLowerCase() === query.toLowerCase() ||
              e._target.toString().toLowerCase() === query.toLowerCase()
            ) {
              data.push(e);
              count++;
            }
          } else {
            data.push(e);
            count++;
          }
        }
      }

      // Don't do data.splice(0, 10);
      return data;
    },

    idVertexParam() {
      return this.transformVertexParams.find(vP => vP.id === "id");
    },

    sourceEdgeParam() {
      return this.transformEdgeParams.find(vP => vP.id === "_source");
    },

    targetEdgeParam() {
      return this.transformEdgeParams.find(vP => vP.id === "_target");
    },
  },

  mounted() {
    //this.transformVertices.forEach(v => this.$set(v, ["selected"]", false));
  },

  methods: {
    ...mapActions([
      "setActiveTab",
      "triggerVertexPropertiesChanged",
      "setSelectedObject",
      "setSelectedObjectType"
    ]),

    importRelatedVertices(vertex) {
      //utils.importRelatedVertices(vertex);
    },

    removeTransformVertex(vertexId) {
      utils.removeTransformVertex(vertexId);
    },

    removeTransformEdge(edgeId) {
      utils.removeTransformEdge(edgeId);
    },

    setActiveTransformTab(tab) {
      this.activeTransformTab = tab;
    },

    setVertex(vertex) {
      if (vertex["selected"] === true) vertex["selected"] = false;
      else vertex["selected"] = true;

      this.triggerVertexPropertiesChanged();
    },

    selectObject(o) {
      this.setSelectedObject(o);

      if (this.activeTransformTab === "Vertices")
        this.setSelectedObjectType("vertex");
      else this.setSelectedObjectType("edge");

      this.setActiveTab("Details");
    }
  }
};
</script>

