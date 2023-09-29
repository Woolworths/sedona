<template>
  <div v-if="!closed" id="sticky-card" class="card border-dark">
    <div class="card-body">
      <button
        type="button"
        @click="close"
        class="close pull-right"
      >
        <i class="material-icons pull-right">close</i>
      </button>

      <div class="container-fluid text-center">
        <h5 class="card-title">Welcome to Sedona!</h5>
      </div>

      <div class="card-text">
        <p>What you're looking at is a high-voltage power grid in the United States. The vertices are transformers, substations and generators, and the edges are high-voltage power lines. This data can be found <a href="http://networkrepository.com/power-US-Grid.php" target="_blank">here</a>.
        </p>
        <p>Shortcut keys:
          <ul class="list-unstyled">
            <li>- To center the graph press <b>c</b></li>
            <li>- To stop/start the simulation press <b>s</b></li>
            <li>- To hide/show the edges press <b>h</b></li>
          </ul>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "sticky",

  mounted() {

  },

  computed: {
    closed() {
      /*if (Cookies.get('closed') && Cookies.get('closed') === "true") {
        return true;
      }*/

      return false;
    }
  },

  methods: {
    close() {
      //Cookies.set('closed', true)

      $(this.$el).fadeOut();
    }
  }
}
</script>

<style scoped>
.card {
  bottom: 10px;
  right: 10px;
  width: 25%;
  min-width: 300px;
  max-width: 450px;
  position: fixed;
}
</style>
