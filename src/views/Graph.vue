<template>
  <div class="container-fluid d-flex flex-fill h-100">
    <div class="row flex-fill">
      <div class="sidebar col-3 h-100">
        <Sidebar></Sidebar>
      </div>

      <div id="graph-container" class="graph col-9 ml-auto">
        <GraphItem></GraphItem>
      </div>

      <Sticky></Sticky>
    </div>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky.vue";
import Sidebar from "@/components/Sidebar.vue";
import GraphItem from "@/components/GraphItem.vue";

import { mapActions } from "vuex";

export default {
  name: "graph",
  components: {
    Sticky,
    Sidebar,
    GraphItem
  },

  activated() {
    console.log("Graph activated");

    this.setGraphActivated(true);
  },

  deactivated() {
    console.log("Graph deactivated");

    this.setGraphActivated(false);
  },

  computed: {
    graphActivated() {
      return this.$store.state.graphActivated;
    },

    transformVertices() {
      return this.$store.state.transformVertices;
    },

    transformEdges() {
      return this.$store.state.transformEdges;
    }
  },
  methods: {
    ...mapActions(["setGraphActivated"])
  }
};
</script>

<style>
.sidebar {
  border-right: 1px dotted;

  overflow: scroll;
}


#graph-container {
  overflow: hidden;
  padding: 0px;
}
</style>
