<template>
  <div class="table-responsive h-100">
    <table class="table table-fixed table-sm table-hover h-100">
      <thead>
        <tr v-if="oType === 'vertex' || oType === 'edge_table'">
          <th scope="col">{{ sourceEdgeParam.label }}</th>
          <th scope="col">{{ targetEdgeParam.label }}</th>
          <th scope="col" class="small-col"></th>

          <template v-if="oType === 'edge_table'">
            <th scope="col" class="small-col"></th>
          </template>
        </tr>

        <tr v-else>
          <th scope="col">{{ idVertexParam.label }}</th>
          <th scope="col" class="small-col"></th>
 
          <template v-if="oType === 'vertex_table'">
            <th scope="col" class="small-col"></th>
            <th scope="col" class="small-col"></th>
          </template>
        </tr>
      </thead>

      <tbody>
        <template v-if="oType === 'vertex' || oType === 'edge_table'">
          <tr v-for="o in lData" :key="o.id">
            <td class="overflow-text">
              {{ o._source }}
            </td>

            <td class="overflow-text">
              {{ o._target }}
            </td>

            <td class="small-col">
              <button
                type="button"
                @click="removeTooltip(); selectEdge(o)"
                class="close"
                data-toggle="tooltip"
                data-placement="bottom"
                title="View edge"
              >
                <i class="material-icons">search</i>
              </button>
            </td>

            <template v-if="oType === 'edge_table'">
              <td class="small-col">
                <button
                  type="button"
                  @click="removeTransformEdge(o)"
                  class="close"
                  data-toggle="tooltip"
                  data-placement="bottom"
                  title="Delete edge"
                >
                  <i class="material-icons">delete</i>
                </button>
              </td>
            </template>
          </tr>
        </template>

        <template v-else>
          <tr v-for="o in lData" :key="o.id">
            <td class="overflow-text">
              {{ o.id }}
            </td>

            <td class="small-col">
              <button
                type="button"
                @click="removeTooltip(); selectVertex(o)"
                class="close"
                data-toggle="tooltip"
                data-placement="bottom"
                title="View vertex"
              >
                <i class="material-icons">search</i>
              </button>
            </td>

            <template v-if="oType === 'vertex_table'">
              <td class="small-col">
                <button
                  type="button"
                  @click="importRelatedVertices(o)"
                  class="close"
                  data-toggle="tooltip"
                  data-placement="bottom"
                  title="Import related vertices"
                >
                  <i class="material-icons">insert_link</i>
                </button>
              </td>

              <td class="small-col">
                <button
                  type="button"
                  @click="removeTransformVertex(o.id)"
                  class="close"
                  data-toggle="tooltip"
                  data-placement="bottom"
                  title="Delete vertex"
                >
                  <i class="material-icons">delete</i>
                </button>
              </td>
            </template>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
import * as utils from "@/utils.js";
import { mapActions } from "vuex";

import _ from 'lodash';

export default {
  name: "Table",

  props: ['oType', 'data'],

  data: () => ({
    curr: 0,
    inc: 10
  }),

  watch: {
    data: function() {
      this.reset();
      this.initTooltip();
    }
  },

  mounted () {
    var vm = this;

    this.reset();
    this.initTooltip();

    console.log('Table mounted');

    const el = this.$el.querySelector('tbody');

    el.addEventListener("scroll", _.throttle(() => {
      let pos = el.scrollTop + el.offsetHeight;
      let m = el.scrollHeight;

      // Choppy on Firefox browsers
      if(m - pos <= 10)   {
        vm.curr = vm.curr + vm.inc;
      }
    }, 10), {
      capture: false,
      passive: true
    })
  },

  computed: {
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

    lData() {
      return [...this.data].splice(0, this.curr);
    }
  },

  methods: {
    ...mapActions([
      "setActiveTab",
      "setSelectedObject",
      "setSelectedObjectType"
    ]),

    scrollTop() {
      const el = this.$el.querySelector('tbody');

      el.scrollTo(0, 0);
    },

    reset() {
      this.scrollTop();

      this.curr = 50;
    },

    initTooltip() {
      this.$nextTick(() => {
        $(function () {
          $('[data-toggle="tooltip"]').tooltip()
        })
      })
    },

    removeTooltip(event) {
      $('[data-toggle="tooltip"]').tooltip('dispose');
    },

    setActiveDetailsTab(tab) {
      this.activeDetailsTab = tab;
    },

    importRelatedVertices(vertex) {
      //utils.importRelatedVertices(vertex);
    },

    removeTransformVertex(vertexId) {
      utils.removeTransformVertex(vertexId);
    },

    removeTransformEdge(edgeId) {
      utils.removeTransformEdge(edgeId);
    },

    selectVertex(v) {
      this.setSelectedObject(v);
      this.setSelectedObjectType("vertex");

      this.setActiveTab("Details");
    },

    selectEdge(e) {
      this.setSelectedObject(e);
      this.setSelectedObjectType("edge");

      this.setActiveTab("Details");
    }
  },

  activated() {
    this.removeTooltip();
    this.initTooltip();
  },

  deactivated() {
    this.removeTooltip();
  },
};
</script>

<style>

.table-responsive {
  overflow: hidden;
}

.table-fixed {
  display: flex;
  flex-flow: column;
  width: 100%;

  padding-bottom: 15px;
}

.table-fixed > thead {
  flex: 0 0 auto;
}

.table-fixed > tbody {
  flex: 1 1 auto;
  display: block;
  overflow: scroll;
}

.table-fixed * tr {
  width: 100%;
  display: table;
  table-layout: fixed;
}

.table-fixed * td {
  padding-right: 12px;
}

.table-fixed * td, .table-fixed * th {
  text-align: center;
}

.small-col {
  width: 20%;
}
</style>

