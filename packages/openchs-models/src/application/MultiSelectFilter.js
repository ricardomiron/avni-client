import Filter from "./Filter";

export default class MultiSelectFilter extends Filter {
    constructor(label, optsFnMap, options) {
        super(label, Filter.types.MultiSelect, optsFnMap, options);
    }

    selectOption(option) {
        if (this.selectedOptions.indexOf(option) > -1) {
            return new MultiSelectFilter(this.label,this.optsFnMap, this.selectedOptions.filter(so => so !== option));
        }
        return new MultiSelectFilter(this.label, this.optsFnMap, [...this.selectedOptions, option]);
    }

    isApplied() {
        return this.selectedOptions.length > 0;
    }

    toString() {
        return `${this.label} - ${this.selectedOptions.join(", ")}`;
    }

    clone() {
        return new MultiSelectFilter(this.label, this.optsFnMap, this.selectedOptions);
    }
}