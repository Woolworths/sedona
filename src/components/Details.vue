<template>
  <div class="content-wrapper flex-column">
    <div class="align-items-center">
      <nav class="navbar navbar-default navbar-xs navbar-subnav">
        <div class="flex-column">
          <ul class="navbar-nav nav nav-tabs flex-row">
            <li class="nav-item">
              <a
                href="#"
                @click="setActiveDetailsTab('Properties')"
                :class="
                  'nav-link' +
                    (activeDetailsTab === 'Properties' ? ' active' : '')
                "
                >Properties</a
              >
            </li>
            <li class="nav-item">
              <a
                href="#"
                @click="setActiveDetailsTab('Links')"
                :class="
                  'nav-link' + (activeDetailsTab === 'Links' ? ' active' : '')
                "
                >Links</a
              >
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="overflow-container">
      <template v-if="selectedObject">
        <div class="container" v-if="activeDetailsTab === 'Properties'">
          <table class="table table-sm text-center">
            <tbody>
              <tr
                v-for="key in filteredDataParams"
                :key="key.id"
              >
                <td>{{ key.label }}</td>
                <td>{{ selectedObject[key.id] }}</td>
              </tr>
            </tbody>
          </table>
          <!-- TODO: Implement this! <li>
            <button
              type="button"
              class="btn btn-sm btn-outline-primary"
              @click=""
            >
              View on Graph
            </button>
          </li>-->

          <div class="container-fluid text-center" style="padding-bottom:10px;">
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              @click="removeTransformObject(selectedObject)"
            >
              Remove from Graph
            </button>
          </div>
        </div>

        <div class="container h-100" v-if="activeDetailsTab === 'Links'">
          <template v-if="selectedObjectType === 'vertex'">
            <Table oType="vertex" :data="selectedObjects"></Table>
          </template>

          <template v-if="selectedObjectType === 'edge'">
            <Table oType="edge" :data="selectedObjects"></Table>
          </template>
        </div>
      </template>

      <template v-else>
        <p class="h6 text-center">
          Click on a vertex in the graph or table to view details
        </p>
      </template>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapActions } from "vuex";

import Table from "@/components/Table.vue";

import * as utils from "@/utils.js";

export default {
  name: "Details",

  data: () => ({
    activeDetailsTab: "Properties",
  }),

  components: {
    Table
  },

  computed: {
    selectedObject() {
      return this.$store.state.selectedObject;
    },

    selectedObjectType() {
      return this.$store.state.selectedObjectType;
    },

    transformVertexParams() {
      return this.$store.state.transformVertexParams;
    },

    transformEdgeParams() {
      return this.$store.state.transformEdgeParams;
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

    transformVertices() {
      return this.$store.state.transformVertices;
    },

    transformEdges() {
      return this.$store.state.transformEdges;
    },

    filteredDataParams() {
      if (this.selectedObjectType === "vertex")
        return this.transformVertexParams.filter(vP => !vP.hidden);
      else if (this.selectedObjectType === "edge")
        return this.transformEdgeParams.filter(vE => !vE.hidden);

      return [];
    },

    selectedObjects () {
      const sO = this.selectedObject;

      var a = [];

      if (this.selectedObjectType === "vertex") {
        const edges = this.transformEdges;

        for (let i = 0, len = edges.length; i < len; i++) {
          const e = edges[i];

          if (e.source.id == sO.id || e.target.id == sO.id) {
            a.push(e);
          }
        }
      } else if (this.selectedObjectType === "edge") {
        a = [sO.source, sO.target];
      }

      return a;
    }
  },

  methods: {
    ...mapActions([
      "setSelectedObject",
      "setSelectedObjectType"
    ]),

    setActiveDetailsTab(tab) {
      this.activeDetailsTab = tab;
    },

    removeTransformObject(object) {
      if (this.selectedObjectType === "vertex") {
        utils.removeTransformVertex(object.id);
      } else if (this.selectedObjectType === "edge") {
        utils.removeTransformEdge(object);
      }
    },

    selectVertex(v) {
      this.setSelectedObject(v);
      this.setSelectedObjectType("vertex");
    },

    selectEdge(e) {
      this.setSelectedObject(e);
      this.setSelectedObjectType("edge");
    }
  }
};
</script>

<style scoped>
.table tr:first-child td:nth-child(1),
.table tr:first-child td:nth-child(2) {
  border-top: 0px transparent;
}
</style>
