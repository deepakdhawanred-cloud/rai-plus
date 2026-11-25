import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCsvString, escapeCsvCell } from './csvExport';

describe('csvExport', () => {
  it('neutralizes formula-injection prefixes and escapes RFC 4180 quotes/commas', () => {
    assert.equal(escapeCsvCell('=CMD("calc")'), `"'=CMD(""calc"")"`);
    assert.equal(escapeCsvCell('+1234'), "'+1234");
    assert.equal(escapeCsvCell('-sum(A1:A2)'), "'-sum(A1:A2)");
    assert.equal(escapeCsvCell('@SUM(1,1)'), `"'@SUM(1,1)"`);
    assert.equal(escapeCsvCell('Class 6-A, Fractions'), '"Class 6-A, Fractions"');
  });

  it('builds CRLF CSV string cleanly', () => {
    const csv = buildCsvString(
      ['Student', 'Class', 'Score'],
      [
        ['Abhiraj', '6-A', 87.5],
        ['=EVIL()', '6-A', null],
      ],
    );
    assert.equal(csv, "Student,Class,Score\r\nAbhiraj,6-A,87.5\r\n'=EVIL(),6-A,");
  });
});
