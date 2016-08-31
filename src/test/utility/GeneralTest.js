import {expect} from 'chai';
import General from '../../js/utility/General'
import Duration from "../../js/models/Duration";

describe('General', () => {
    it('replaceAndroidIncompatibleChars', () => {
        const nameWithAllIncompatibleCharacters = "a|b\\c?d* <e\"f:>g+[]/'";
        expect(General.replaceAndroidIncompatibleChars(nameWithAllIncompatibleCharacters)).to.equal("a_b_c_d_ _e_f__g_____");
    });

    it('formatDate', () => {
        expect(General.formatDate(new Date('2011-04-11'))).is.equal('11-04-2011');
    });

    it('formatValue', () => {
        expect(General.formatValue('abc')).is.equal('abc');
        General.formatValue(new Duration(10, Duration.Year));
    });

    it('toExportable', () => {
        expect(General.toExportable('abc')).is.equal('abc');
        expect(General.toExportable('a,b')).is.equal('"a,b"');
    });
});