<template>
  <div class="text-center">
    <p class="h2" style="padding-top:20px;">Welcome to Sedona!<p>
    <p>This is a project by <a href="https://www.jeanabed.com/" target="_blank">Jean Abed</a>. If you enjoy this, feel free to check out my personal website.</p>

    <p>To get started, <router-link to="data">Import Data</router-link> then navigate to the <router-link to="graph">Graph</router-link> to visualise.</p>

    <br/>
    <div>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/GgRkT7Qvi14" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen crossorigin="anonymous"></iframe>
    </div>

    <hr/>

    <ul class="list-inline">
      <li><a href="https://www.jeanabed.com/" target="_blank">
        <img alt="Jean Abed Website" src="/jeanabed.svg" style="width:23px;height:23px;"></img>
      </a></li>
      <li><a href="https://www.linkedin.com/in/jeanabed/" target="_blank">
        <img alt="Jean Abed LinkedIn" src="/li_logo.png" style="width:27px;height:23px;"></img>
      </a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "HelloWorld"
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
