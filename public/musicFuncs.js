LETTER_MAP = {
       'b': 0.0,
  'c': 0.5, 'a': 5.0,
  'd': 1.5, 'g': 4.0,
  'e': 2.5, 'f': 3.0,
};
// MINOR_SECOND = teoria.interval('a4', 'bb')

function noteToNumber(note) {
  base = LETTER_MAP[note.name()];
  accidental_offset = note.accidentalValue() / 2;
  return (base + accidental_offset) % 6
}

function generateFretboard(openStrings, numFrets) {
  fretboard = [];
  openStrings.forEach(function(openStringNote) {
    var note = teoria.note(openStringNote);

    thisString = [];
    range(1,numFrets,1).forEach(function(fretNumber) {
      currentNoteNum = noteToNumber(note);
      thisString.push(currentNoteNum);
      note = note.interval('A1');
    })

    fretboard.push(thisString);
  });
  return fretboard;
}

function generateChordShapes(chordProgression, fretboard, startingFret, positionSize, stringsToUse) {
  chordShapes = {};
  chordProgression.forEach(function(chord) {
    fretRegion    = [];
    chordName     = chord.name;
    notesInChord  = chord.notes();

    chordToNumTranslator  = {};
    noteNamesInChord      = [];
    noteNumsInChord       = [];
    notesInChord.forEach(function(note) {
      noteName = note.name();
      noteNum = noteToNumber(note);
      noteNamesInChord.push(noteName);
      noteNumsInChord.push(noteNum);
      chordToNumTranslator[noteNum] = noteName;
    });

    fretboard.forEach(function(string, stringNum) {
      stringRegion = [];
      mapFrets = string.slice(startingFret, startingFret+positionSize);
      mapFrets.forEach(function(fret) {
        if (stringsToUse.indexOf(stringNum) > -1 && noteNumsInChord.indexOf(fret) > -1) stringRegion.push(chordToNumTranslator[fret])
        else stringRegion.push('x');
      })
      fretRegion.push(stringRegion);
    })
    chordShapes[chordName] = fretRegion;
  })
  return chordShapes;
}










