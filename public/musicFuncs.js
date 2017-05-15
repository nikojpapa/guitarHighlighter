LETTER_MAP = {
       'B': 0.0,
  'C': 0.5, 'A': 5.0,
  'D': 1.5, 'G': 4.0,
  'E': 2.5, 'F': 3.0,
};
// MINOR_SECOND = teoria.interval('a4', 'bb')

function note_to_number(note) {
  base = LETTER_MAP[note.name()];
  accidental_offset = note.accidentalValue() / 2;
  return (base + accidental_offset) % 6
}