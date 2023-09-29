<template>
  <div class="content-wrapper">
    <div class="container-fluid">
      <div class="col-lg-8 mx-auto text-lg-left">
        <div class="form-group form-row row"
        v-for="filter in availableFilters"
        :key="filter.displayName">
          <label :for="filter.displayName" class="col-lg-9 col-form-label">{{ filter.displayName }}</label>

          <div class="col-lg-3">
            <button
              :id="filter.displayName"
              @click="addFilter(filter)"
              class="btn btn-outline-secondary btn-sm"
              type="button"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>

    <!--<ul
      v-for="filter in availableFilters"
      :key="filter.id"
      class="list-unstyled"
    >
      <li>
        {{ filter.displayName }} -
        <button
          @click="addFilter(filter)"
          class="btn btn-outline-secondary btn-sm"
        >
          Add
        </button>
      </li>
    </ul>-->

    <div class="overflow-container">
      <div class="flex-column container-fluid">
        <template v-for="filter in chosenFilters">
          <div class="row" :key="filter.id" style="padding-bottom:10px;">
            <div class="container-fluid w-100">
              <div class="position-relative float-right">
                <button
                  type="button"
                  @click="removeFilter(filter.id)"
                  class="close"
                >
                  <i class="material-icons">close</i>
                </button>
              </div>

              <component
                :is="filter.name"
                :key="filter.id"
                :ref="filter.id"
                :filterId="filter.id"
                :dataType="filter.dataType"
                :transformVertexParams="transformVertexParams"
                :transformEdgeParams="transformEdgeParams"
                :transformVertices="transformVertices"
                :transformEdges="transformEdges"
                @change="sD()"
              ></component>
            </div>
          </div>
        </template>
      </div>
    </div>


    <div class="container-fluid">
      <div class="text-center" v-if="filteringObject">
        <ul class="list-unstyled">
          <li>
            <p class="h6">Vertices Selected: {{ numFilteredVertices }}</p>
          </li>
          <li>
            <p class="h6">Edges Selected: {{ numFilteredEdges }}</p>
          </li>
        </ul>
      </div>

      <div class="container-fluid text-center">
        <div class="btn-group" style="padding-top:10px;padding-bottom:10px;">
          <!--<button @click="sD()" class="btn btn-outline-primary btn-sm">
            Select
          </button>-->
          <button
            v-if="filteringObject"
            type="button"
            class="btn btn-outline-danger"
            @click="setFilteringObject(false)"
          >
            Stop Selecting
          </button>
          <button
            v-else
            type="button"
            class="btn btn-outline-primary"
            @click="setFilteringObject(true)"
          >
            Select
          </button>

          <button @click="fD()" class="btn btn-outline-secondary">
            Filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import * as utils from "@/utils.js";
import Range from "@/components/filters/Range.vue";
import { mapActions } from "vuex";
import uuid from "uuid/v4";
import Vue from "vue";

export default {
  name: "FilterData",

  components: {
    Range
  },

  data: () => ({
    availableFilters: [
      { name: "Range", displayName: "Vertex Range", dataType: "vertex" },
      { name: "Range", displayName: "Edge Range", dataType: "edge" }
    ],
    chosenFilters: [],
    numFilteredVertices: 0,
    numFilteredEdges: 0
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

    filteringObject() {
      return this.$store.state.filteringObject;
    },

    activeTab() {
      return this.$store.state.activeTab;
    }
  },

  watch: {
    filteringObject() {
      this.updateSelecting();
    },

    chosenFilters() {
      this.updateChosenFilters();
    },

    activeTab() {
      if (this.activeTab && this.activeTab === "FilterData") {
        for (var key in this.$refs) {
          //TODO
          //this.$refs[key][0].resize();
        }
      }
    }
  },

  mounted() {
    this.updateSelecting();
  },

  methods: {
    ...mapActions([
      "triggerVertexPropertiesChanged",
      "setFilteringObject",
      "setTransformVertices",
      "setTransformEdges"
    ]),

    updateSelecting() {
      if (this.chosenFilters.length === 0) this.setFilteringObject(false);

      if (this.filteringObject) this.sD();
      else {
        for (var i = 0, len = this.transformVertices.length; i < len; i++) {
          const v = this.transformVertices[i];

          this.$set(v, "selected", true);
        }

        this.triggerVertexPropertiesChanged();
      }
    },

    updateChosenFilters() {
      if (this.filteringObject)
        if (this.chosenFilters.length === 0) this.setFilteringObject(false);
        else this.sD();
    },

    addFilter(filter) {
      const newFilter = {
        id: uuid(),
        name: filter.name,
        dataType: filter.dataType
      };

      this.chosenFilters.push(newFilter);
    },

    removeFilter(filterId) {
      Vue.delete(this.$refs, filterId);

      this.chosenFilters.splice(
        this.chosenFilters.findIndex(i => i.id === filterId),
        1
      );
    },

    /*validData() {
      for (var key in this.$refs) {
        const valid = this.$refs[key][0].validData;

        if (!valid) {
          return false;
        }
      }

      return true;
    },*/

    sD() {
      if (!this.filteringObject) return;

      // https://stackoverflow.com/questions/33682651/call-a-vue-js-component-method-from-outside-the-component
      // TODO: Use chosen filters with ID's -> change to array of objects
      // Improve efficiency by using pipe - filter
      // select data use filter data instead???
      var filteredVertices = this.transformVertices;
      var filteredEdges = this.transformEdges;

      for (var i = 0, len = this.transformVertices.length; i < len; i++) {
        const v = this.transformVertices[i];

        this.$set(v, "selected", false);
      }

      for (var key in this.$refs) {
        const data = this.$refs[key][0].filterData(
          filteredVertices,
          filteredEdges
        );

        if (!data) continue;

        filteredVertices = data.filteredVertices;
        filteredEdges = data.filteredEdges;
      }

      for (var i = 0, len = filteredVertices.length; i < len; i++) {
        const v = filteredVertices[i];

        this.$set(v, "selected", true);
      }

      this.numFilteredVertices = filteredVertices.length;
      this.numFilteredEdges = filteredEdges.length;

      this.triggerVertexPropertiesChanged();
    },

    fD() {
      //if (!this.validData()) return;

      var filteredVertices = [...this.transformVertices];
      var filteredEdges = [...this.transformEdges];

      for (var key in this.$refs) {
        const data = this.$refs[key][0].filterData(
          filteredVertices,
          filteredEdges
        );

        if (!data) continue;

        filteredVertices = data.filteredVertices;
        filteredEdges = data.filteredEdges;
      }

      this.setTransformVertices([]);
      this.setTransformEdges([]);

      //utils.addTransformVertices(filteredVertices);
      utils.setTransformVertices(filteredVertices);
      utils.setTransformEdges(filteredEdges);

      this.triggerVertexPropertiesChanged();
    }
  }
};
</script>

<style scoped>
.form-row {
  display: flex;
  align-items: center;
}
</style>
