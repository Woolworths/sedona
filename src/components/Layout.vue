<template>
  <div class="content-wrapper">
    <div class="container-fluid overflow-container">
      <div class="col-lg-10 mx-auto">
        <div class="form-group form-row row">
          <label for="animation" class="col-lg-8 col-form-label">Animation (<u>s</u>)</label>
          <div class="col-lg-4">
            <template v-if="animateGraph">
              <button
                id="animation"
                type="button"
                class="btn btn-middle btn-outline-danger btn-sm"
                @click="toggleAnimation"
              >
                Stop
              </button>
            </template>
            <template v-else>
              <button
                id="animation"
                type="button"
                class="btn btn-middle btn-outline-success btn-sm"
                @click="toggleAnimation"
              >
                Start
              </button>
            </template>
          </div>
        </div>

        <div class="form-group form-row row">
          <label for="edges" class="col-lg-8 col-form-label">Edges (<u>h</u>)</label>
          <div class="col-lg-4">
            <template v-if="showEdges">
              <button
                id="edges"
                type="button"
                class="btn btn-middle btn-outline-danger btn-sm"
                @click="toggleEdges"
              >
                Hide
              </button>
            </template>
            <template v-else>
              <button
                id="edges"
                type="edges"
                class="btn btn-middle btn-outline-success btn-sm"
                @click="toggleEdges"
              >
                Show
              </button>
            </template>
          </div>
        </div>

        <div class="form-group form-row row">
          <label for="edgeColour" class="col-lg-8 col-form-label">Edge Colour</label>
          <div class="col-lg-4">
            <input
              id="edgeColour"
              type="color"
              v-model="linkColour"
              class="form-control form-control-sm"
            />
          </div>
        </div>

        <div class="form-group form-row row">
          <label for="highlight" class="col-lg-8 col-form-label">Highlight Vertices</label>
          <div class="col-lg-4">
            <template v-if="highlightVertices">
              <button
                id="highlight"
                type="button"
                class="btn btn-middle btn-outline-danger btn-sm"
                @click="toggleVertices"
              >
                Off
              </button>
            </template>
            <template v-else>
              <button
                id="highlight"
                type="button"
                class="btn btn-middle btn-outline-success btn-sm"
                @click="toggleVertices"
              >
                On
              </button>
            </template>
          </div>
        </div>

        <div class="form-group form-row row">
          <label for="center" class="col-lg-8 col-form-label">Center Graph (<u>c</u>)</label>
          <div class="col-lg-4">
            <button
              id="center"
              type="button"
              class="btn btn-middle btn-outline-primary btn-sm"
              @click="triggerCenterGraph"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "Layout",

  computed: {
    animateGraph() {
      return this.$store.state.animateGraph;
    },

    showEdges() {
      return this.$store.state.showEdges;
    },

    linkColour: {
      get () {
        return this.$store.state.linkColour;
      },
      set (value) {
        this.setLinkColour(value);
      }
    },

    highlightVertices() {
      return this.$store.state.highlightVertices;
    }
  },

  methods: {
    ...mapActions([
      "setAnimateGraph",
      "setShowEdges",
      "setLinkColour",
      "setHighlightVertices",
      "triggerCenterGraph"
    ]),

    toggleAnimation() {
      this.setAnimateGraph(!this.animateGraph);
    },

    toggleEdges() {
      this.setShowEdges(!this.showEdges);
    },

    toggleVertices() {
      this.setHighlightVertices(!this.highlightVertices);
    }
  },

  mounted() {
    //
  }
};
</script>

<style scoped>
.form-row {
  display: flex;
  align-items: center;
}
</style>
