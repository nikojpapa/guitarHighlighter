Vue.component('settings', {
  template: '#settingsTemplate',
  props: [
    'startingFret',
    'positionSize',
    'useStrings',
    'openStrings',
    'chordShapes',
    'selectedChord'
  ],
  watch: {
    startingFret: function() {this.$emit('update:startingFret', this.startingFret);},
    positionSize: function() {this.$emit('update:positionSize', this.positionSize);},
    useStrings: function() {this.$emit('update:useStrings', this.useStrings);},
    openStrings: function() {this.$emit('update:openStrings', this.openStrings);},
    chordShapes: function() {this.$emit('update:chordShapes', this.chordShapes);},
    selectedChord: function() {this.$emit('update:selectedChord', this.selectedChord);},
  }
})
// <form>
//   <div class="form-group">
//     <label for="startingFret">Starting Fret:</label>
//     <input type="number" v-model.number="startingFret" />
//   </div>
//   <div class="form-group">
//     <label for="positionSize">Position Size:</label>
//     <input type="number" v-model.number="positionSize" />
//   </div>
//   <div class="form-group">
//     <label for="openStrings">Tuning:</label>
//     <ul class="list-group">
//       <template id="openStrings" v-for="stringNum in 6">
//         <li class="list-group-item" :class="{disabled: useStrings.indexOf(stringNum-1) === -1}">
//           <label>{{stringNum}}</label>
//           <input type="text" v-model.number="openStrings[stringNum-1]" />
//           <input type="checkbox" :value="stringNum - 1" v-model="useStrings" />
//         </li>
//       </template>
//     </ul>
//   </div>
//   <div class="form-group">
//     <label for="chords">Chords:</label>
//     <template id="chords" v-for="(strings, chordName) in chordShapes">
//       <li @click="selectedChord = chordName">{{chordName}}</li>
//     </template>
//     <div>Selected chord: {{selectedChord}}</div>
//   </div>
// </form>